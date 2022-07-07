from __future__ import annotations

import itertools
import logging
import time
import traceback
import uuid
from datetime import datetime, timedelta
from random import Random
from typing import Any, MutableMapping

import pytz
from django.template.defaultfilters import slugify
from django.urls import reverse
from django.utils import timezone
from django.utils.safestring import mark_safe
from django.views.generic import View
from rest_framework.request import Request
from rest_framework.response import Response

from sentry import eventstore
from sentry.constants import LOG_LEVELS
from sentry.digests import Record
from sentry.digests.notifications import Notification, build_digest
from sentry.digests.utils import get_digest_metadata
from sentry.event_manager import EventManager, get_event_type
from sentry.http import get_server_hostname
from sentry.mail.notifications import get_builder_args
from sentry.models import (
    Activity,
    Group,
    GroupStatus,
    Organization,
    OrganizationMember,
    Project,
    Release,
    Rule,
    Team,
    User,
)
from sentry.notifications.notifications.activity import EMAIL_CLASSES_BY_TYPE
from sentry.notifications.notifications.base import BaseNotification
from sentry.notifications.notifications.digest import DigestNotification
from sentry.notifications.types import GroupSubscriptionReason
from sentry.notifications.utils import get_group_settings_link, get_rules
from sentry.utils import loremipsum
from sentry.utils.dates import to_datetime, to_timestamp
from sentry.utils.email import inline_css
from sentry.utils.http import absolute_uri
from sentry.utils.samples import load_data
from sentry.web.decorators import login_required
from sentry.web.helpers import render_to_response, render_to_string

logger = logging.getLogger(__name__)


def get_random(request):
    seed = request.GET.get("seed", str(time.time()))
    return Random(seed)


def make_message(random, length=None):
    if length is None:
        length = int(random.weibullvariate(8, 3))
    return " ".join(random.choice(loremipsum.words) for _ in range(length))


def make_culprit(random):
    def make_module_path_components(min, max):
        for _ in range(random.randint(min, max)):
            yield "".join(
                random.sample(loremipsum.words, random.randint(1, int(random.paretovariate(2.2))))
            )

    return "{module} in {function}".format(
        module=".".join(make_module_path_components(1, 4)), function=random.choice(loremipsum.words)
    )


def make_group_metadata(random, group):
    return {
        "type": "error",
        "metadata": {
            "type": "{}Error".format(
                "".join(
                    word.title() for word in random.sample(loremipsum.words, random.randint(1, 3))
                )
            ),
            "value": make_message(random),
        },
    }


def make_group_generator(random, project):
    epoch = to_timestamp(datetime(2016, 6, 1, 0, 0, 0, tzinfo=timezone.utc))
    for id in itertools.count(1):
        first_seen = epoch + random.randint(0, 60 * 60 * 24 * 30)
        last_seen = random.randint(first_seen, first_seen + (60 * 60 * 24 * 30))

        culprit = make_culprit(random)
        level = random.choice(list(LOG_LEVELS.keys()))
        message = make_message(random)

        group = Group(
            id=id,
            short_id=id,
            project=project,
            culprit=culprit,
            level=level,
            message=message,
            first_seen=to_datetime(first_seen),
            last_seen=to_datetime(last_seen),
            status=random.choice((GroupStatus.UNRESOLVED, GroupStatus.RESOLVED)),
            data={"type": "default", "metadata": {"title": message}},
        )

        if random.random() < 0.8:
            group.data = make_group_metadata(random, group)

        yield group


def add_unsubscribe_link(context):
    if "unsubscribe_link" not in context:
        context[
            "unsubscribe_link"
        ] = 'javascript:alert("This is a preview page, what did you expect to happen?");'


# TODO(dcramer): use https://github.com/disqus/django-mailviews
class MailPreview:
    def __init__(self, html_template, text_template, context=None, subject=None):
        self.html_template = html_template
        self.text_template = text_template
        self.subject = subject
        self.context = context if context is not None else {}
        add_unsubscribe_link(self.context)

    def text_body(self):
        return render_to_string(self.text_template, context=self.context)

    def html_body(self):
        try:
            return inline_css(render_to_string(self.html_template, context=self.context))
        except Exception:
            traceback.print_exc()
            raise

    def render(self, request: Request):
        return render_to_response(
            "sentry/debug/mail/preview.html",
            context={"preview": self, "format": request.GET.get("format")},
        )


class MailPreviewAdapter(MailPreview):
    """
    This is an adapter for MailPreview that will take similar arguments to MessageBuilder
    """

    def __init__(self, **kwargs):
        kwargs["text_template"] = kwargs["template"]
        del kwargs["template"]
        if "from_email" in kwargs:
            del kwargs["from_email"]
        del kwargs["type"]
        super().__init__(**kwargs)


class ActivityMailPreview:
    def __init__(self, request, activity):
        self.request = request
        self.email = EMAIL_CLASSES_BY_TYPE.get(activity.type)(activity)

    def get_context(self):
        context = self.email.get_base_context()
        context["reason"] = get_random(self.request).choice(
            list(GroupSubscriptionReason.descriptions.values())
        )
        context.update(self.email.get_context())
        add_unsubscribe_link(context)
        return context

    def text_body(self):
        txt_template = f"{self.email.template_path}.txt"
        return render_to_string(txt_template, context=self.get_context())

    def html_body(self):
        html_template = f"{self.email.template_path}.html"
        try:
            return inline_css(render_to_string(html_template, context=self.get_context()))
        except Exception:
            import traceback

            traceback.print_exc()
            raise


class ActivityMailDebugView(View):
    def get_activity(self, request: Request, event):
        raise NotImplementedError

    def get(self, request: Request) -> Response:
        org = Organization(id=1, slug="organization", name="My Company")
        project = Project(id=1, organization=org, slug="project", name="My Project")

        group = next(make_group_generator(get_random(request), project))

        data = dict(load_data("python"))
        data["message"] = group.message
        data.pop("logentry", None)

        event_manager = EventManager(data)
        event_manager.normalize()
        data = event_manager.get_data()
        event_type = get_event_type(data)

        event = eventstore.create_event(
            event_id="a" * 32, group_id=group.id, project_id=project.id, data=data.data
        )

        group.message = event.search_message
        group.data = {"type": event_type.key, "metadata": event_type.get_metadata(data)}

        activity = Activity(group=group, project=event.project, **self.get_activity(request, event))

        return render_to_response(
            "sentry/debug/mail/preview.html",
            context={
                "preview": ActivityMailPreview(request, activity),
                "format": request.GET.get("format"),
            },
        )


@login_required
def alert(request):
    platform = request.GET.get("platform", "python")
    org = Organization(id=1, slug="example", name="Example")
    project = Project(id=1, slug="example", name="Example", organization=org)

    random = get_random(request)
    group = next(make_group_generator(random, project))

    data = dict(load_data(platform))
    data["message"] = group.message
    data["event_id"] = "44f1419e73884cd2b45c79918f4b6dc4"
    data.pop("logentry", None)
    data["environment"] = "prod"
    data["tags"] = [
        ("logger", "javascript"),
        ("environment", "prod"),
        ("level", "error"),
        ("device", "Other"),
    ]

    event_manager = EventManager(data)
    event_manager.normalize()
    data = event_manager.get_data()
    event = event_manager.save(project.id)
    # Prevent CI screenshot from constantly changing
    event.data["timestamp"] = 1504656000.0  # datetime(2017, 9, 6, 0, 0)
    event_type = get_event_type(event.data)

    group.message = event.search_message
    group.data = {"type": event_type.key, "metadata": event_type.get_metadata(data)}

    rule = Rule(id=1, label="An example rule")

    # XXX: this interface_list code needs to be the same as in
    #      src/sentry/mail/adapter.py
    interface_list = []
    for interface in event.interfaces.values():
        body = interface.to_email_html(event)
        if not body:
            continue
        text_body = interface.to_string(event)
        interface_list.append((interface.get_title(), mark_safe(body), text_body))

    return MailPreview(
        html_template="sentry/emails/error.html",
        text_template="sentry/emails/error.txt",
        context={
            "rule": rule,
            "rules": get_rules([rule], org, project),
            "group": group,
            "event": event,
            "timezone": pytz.timezone("Europe/Vienna"),
            # http://testserver/organizations/example/issues/<issue-id>/?referrer=alert_email
            #       &alert_type=email&alert_timestamp=<ts>&alert_rule_id=1
            "link": get_group_settings_link(group, None, get_rules([rule], org, project), 1337),
            "interfaces": interface_list,
            "tags": event.tags,
            "project_label": project.slug,
            "commits": [
                {
                    # TODO(dcramer): change to use serializer
                    "repository": {
                        "status": "active",
                        "name": "Example Repo",
                        "url": "https://github.com/example/example",
                        "dateCreated": "2018-02-28T23:39:22.402Z",
                        "provider": {"id": "github", "name": "GitHub"},
                        "id": "1",
                    },
                    "score": 2,
                    "subject": "feat: Do something to raven/base.py",
                    "message": "feat: Do something to raven/base.py\naptent vivamus vehicula tempus volutpat hac tortor",
                    "id": "1b17483ffc4a10609e7921ee21a8567bfe0ed006",
                    "shortId": "1b17483",
                    "author": {
                        "username": "dcramer@gmail.com",
                        "isManaged": False,
                        "lastActive": "2018-03-01T18:25:28.149Z",
                        "id": "1",
                        "isActive": True,
                        "has2fa": False,
                        "name": "dcramer@gmail.com",
                        "avatarUrl": "https://secure.gravatar.com/avatar/51567a4f786cd8a2c41c513b592de9f9?s=32&d=mm",
                        "dateJoined": "2018-02-27T22:04:32.847Z",
                        "emails": [{"is_verified": False, "id": "1", "email": "dcramer@gmail.com"}],
                        "avatar": {"avatarUuid": None, "avatarType": "letter_avatar"},
                        "lastLogin": "2018-02-27T22:04:32.847Z",
                        "email": "dcramer@gmail.com",
                    },
                }
            ],
        },
    ).render(request)


@login_required
def release_alert(request):
    platform = request.GET.get("platform", "python")
    org = Organization(id=1, slug="example", name="Example")
    project = Project(id=1, slug="example", name="Example", organization=org, platform="python")

    random = get_random(request)
    group = next(make_group_generator(random, project))

    data = dict(load_data(platform))
    data["message"] = group.message
    data["event_id"] = "44f1419e73884cd2b45c79918f4b6dc4"
    data.pop("logentry", None)
    data["environment"] = "prod"
    data["tags"] = [
        ("logger", "javascript"),
        ("environment", "prod"),
        ("level", "error"),
        ("device", "Other"),
    ]

    event_manager = EventManager(data)
    event_manager.normalize()
    data = event_manager.get_data()
    event = event_manager.save(project.id)
    # Prevent CI screenshot from constantly changing
    event.data["timestamp"] = 1504656000.0  # datetime(2017, 9, 6, 0, 0)
    event_type = get_event_type(event.data)

    group.message = event.search_message
    group.data = {"type": event_type.key, "metadata": event_type.get_metadata(data)}

    rule = Rule(id=1, label="An example rule")

    # XXX: this interface_list code needs to be the same as in
    #      src/sentry/mail/adapter.py
    interfaces = {}
    for interface in event.interfaces.values():
        body = interface.to_email_html(event)
        if not body:
            continue
        text_body = interface.to_string(event)
        interfaces[interface.get_title()] = {
            "label": interface.get_title(),
            "html": mark_safe(body),
            "body": text_body,
        }

    return MailPreview(
        html_template="sentry/emails/release_alert.html",
        text_template="sentry/emails/release_alert.txt",
        context={
            "rule": rule,
            "rules": get_rules([rule], org, project),
            "group": group,
            "event": event,
            "event_user": event.data["user"],
            "timezone": pytz.timezone("Europe/Vienna"),
            "link": get_group_settings_link(group, None, get_rules([rule], org, project), 1337),
            "interfaces": interfaces,
            "tags": event.tags,
            "contexts": event.data["contexts"].items(),
            "project": project,
            "last_release": {
                "version": "13.9.2",
            },
            "last_release_link": f"http://testserver/organizations/{org.slug}/releases/13.9.2/?project={project.id}",
            "environment": "production",
        },
    ).render(request)


@login_required
def digest(request):
    random = get_random(request)

    # TODO: Refactor all of these into something more manageable.
    org = Organization(id=1, slug="example", name="Example Organization")

    project = Project(id=1, slug="example", name="Example Project", organization=org)

    rules = {
        i: Rule(id=i, project=project, label=f"Rule #{i}") for i in range(1, random.randint(2, 4))
    }

    state = {
        "project": project,
        "groups": {},
        "rules": rules,
        "event_counts": {},
        "user_counts": {},
    }

    records = []

    group_generator = make_group_generator(random, project)

    for _ in range(random.randint(1, 30)):
        group = next(group_generator)
        state["groups"][group.id] = group

        offset = timedelta(seconds=0)
        for _ in range(random.randint(1, 10)):
            offset += timedelta(seconds=random.random() * 120)

            data = dict(load_data("python"))
            data["message"] = group.message
            data.pop("logentry", None)

            event_manager = EventManager(data)
            event_manager.normalize()
            data = event_manager.get_data()

            data["timestamp"] = random.randint(
                to_timestamp(group.first_seen), to_timestamp(group.last_seen)
            )

            event = eventstore.create_event(
                event_id=uuid.uuid4().hex, group_id=group.id, project_id=project.id, data=data.data
            )

            records.append(
                Record(
                    event.event_id,
                    Notification(
                        event,
                        random.sample(
                            list(state["rules"].keys()), random.randint(1, len(state["rules"]))
                        ),
                    ),
                    to_timestamp(event.datetime),
                )
            )

            state["event_counts"][group.id] = random.randint(10, 1e4)
            state["user_counts"][group.id] = random.randint(10, 1e4)

    digest = build_digest(project, records, state)[0]
    start, end, counts = get_digest_metadata(digest)

    rule_details = get_rules(list(rules.values()), org, project)
    context = DigestNotification.build_context(digest, project, org, rule_details, 1337)
    add_unsubscribe_link(context)

    return MailPreview(
        html_template="sentry/emails/digests/body.html",
        text_template="sentry/emails/digests/body.txt",
        context=context,
    ).render(request)


@login_required
def report(request):
    from sentry.tasks import reports

    random = get_random(request)

    duration = 60 * 60 * 24 * 7
    timestamp = to_timestamp(
        reports.floor_to_utc_day(
            to_datetime(
                random.randint(
                    to_timestamp(datetime(2015, 6, 1, 0, 0, 0, tzinfo=timezone.utc)),
                    to_timestamp(datetime(2016, 7, 1, 0, 0, 0, tzinfo=timezone.utc)),
                )
            )
        )
    )

    start, stop = interval = reports._to_interval(timestamp, duration)

    organization = Organization(id=1, slug="example", name="Example")

    projects = []
    for i in range(0, random.randint(1, 8)):
        name = " ".join(random.sample(loremipsum.words, random.randint(1, 4)))
        projects.append(
            Project(
                id=i,
                organization=organization,
                slug=slugify(name),
                name=name,
                date_added=start - timedelta(days=random.randint(0, 120)),
            )
        )

    def make_release_generator():
        id_sequence = itertools.count(1)
        while True:
            dt = to_datetime(random.randint(timestamp - (30 * 24 * 60 * 60), timestamp))
            p = random.choice(projects)
            yield Release(
                id=next(id_sequence),
                project=p,
                organization_id=p.organization_id,
                version="".join(random.choice("0123456789abcdef") for _ in range(40)),
                date_added=dt,
            )

    def build_issue_summaries():
        summaries = []
        for i in range(3):
            summaries.append(int(random.weibullvariate(10, 1) * random.paretovariate(0.5)))
        return summaries

    def build_usage_outcomes():
        return (
            int(random.weibullvariate(3, 1) * random.paretovariate(0.2)),
            int(random.weibullvariate(3, 1) * random.paretovariate(0.2)),
            int(random.weibullvariate(3, 1) * random.paretovariate(0.2)),
            int(random.weibullvariate(5, 1) * random.paretovariate(0.2)),
        )

    def build_report(project):
        daily_maximum = random.randint(1000, 10000)

        rollup = 60 * 60 * 24
        series = [
            (
                timestamp + (i * rollup),
                (
                    # Issues
                    random.randint(0, daily_maximum),
                    # Transactions
                    random.randint(0, daily_maximum),
                ),
            )
            for i in range(0, 7)
        ]

        aggregates = [
            random.randint(0, daily_maximum * 7) if random.random() < 0.9 else None
            for _ in range(0, 4)
        ]

        return reports.Report(
            series,
            aggregates,
            build_issue_summaries(),
            build_usage_outcomes(),
            key_events=[(g.id, random.randint(0, 1000)) for g in Group.objects.all()[:3]],
            key_transactions=[("/transaction/1", 1234, project.id, 1111, 2222)],
        )

    if random.random() < 0.85:
        personal = {"resolved": random.randint(0, 100), "users": int(random.paretovariate(0.2))}
    else:
        personal = {"resolved": 0, "users": 0}
    html_template = "sentry/emails/reports/body.html"

    return MailPreview(
        html_template=html_template,
        text_template="sentry/emails/reports/body.txt",
        context={
            "duration": reports.durations[duration],
            "interval": {"start": reports.date_format(start), "stop": reports.date_format(stop)},
            "report": reports.to_context(
                organization, interval, {project: build_report(project) for project in projects}
            ),
            "organization": organization,
            "personal": personal,
            "user": request.user,
        },
    ).render(request)


@login_required
def request_access(request):
    org = Organization(id=1, slug="sentry", name="Sentry org")
    team = Team(id=1, slug="example", name="Example", organization=org)

    return MailPreview(
        html_template="sentry/emails/request-team-access.html",
        text_template="sentry/emails/request-team-access.txt",
        context={
            "email": "foo@example.com",
            "name": "George Bush",
            "organization": org,
            "team": team,
            "url": absolute_uri(
                reverse("sentry-organization-teams", kwargs={"organization_slug": org.slug})
            ),
        },
    ).render(request)


@login_required
def request_access_for_another_member(request):
    org = Organization(id=1, slug="sentry", name="Sentry org")
    team = Team(id=1, slug="example", name="Example", organization=org)

    return MailPreview(
        html_template="sentry/emails/request-team-access.html",
        text_template="sentry/emails/request-team-access.txt",
        context={
            "email": "foo@example.com",
            "name": "Username",
            "organization": org,
            "team": team,
            "url": absolute_uri(
                reverse("sentry-organization-teams", kwargs={"organization_slug": org.slug})
            ),
            "requester": request.user.get_display_name(),
        },
    ).render(request)


@login_required
def invitation(request):
    org = Organization(id=1, slug="example", name="Example")
    om = OrganizationMember(id=1, email="foo@example.com", organization=org)

    return MailPreview(
        html_template="sentry/emails/member-invite.html",
        text_template="sentry/emails/member-invite.txt",
        context={
            "email": "foo@example.com",
            "organization": org,
            "url": absolute_uri(
                reverse("sentry-accept-invite", kwargs={"member_id": om.id, "token": om.token})
            ),
        },
    ).render(request)


@login_required
def access_approved(request):
    org = Organization(id=1, slug="example", name="Example")
    team = Team(id=1, slug="example", name="Example", organization=org)

    return MailPreview(
        html_template="sentry/emails/access-approved.html",
        text_template="sentry/emails/access-approved.txt",
        context={
            "email": "foo@example.com",
            "name": "George Bush",
            "organization": org,
            "team": team,
        },
    ).render(request)


@login_required
def confirm_email(request):
    email = request.user.emails.first()
    email.set_hash()
    email.save()
    return MailPreview(
        html_template="sentry/emails/confirm_email.html",
        text_template="sentry/emails/confirm_email.txt",
        context={
            "confirm_email": "foo@example.com",
            "user": request.user,
            "url": absolute_uri(
                reverse(
                    "sentry-account-confirm-email", args=[request.user.id, email.validation_hash]
                )
            ),
            "is_new_user": True,
        },
    ).render(request)


@login_required
def recover_account(request):
    return MailPreview(
        html_template="sentry/emails/recover_account.html",
        text_template="sentry/emails/recover_account.txt",
        context={
            "user": request.user,
            "url": absolute_uri(
                reverse(
                    "sentry-account-confirm-email",
                    args=[request.user.id, "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
                )
            ),
            "domain": get_server_hostname(),
            "ip_address": request.META["REMOTE_ADDR"],
            "datetime": timezone.now(),
        },
    ).render(request)


@login_required
def org_delete_confirm(request):
    from sentry.models import AuditLogEntry

    org = Organization.get_default()
    entry = AuditLogEntry(
        organization=org, actor=request.user, ip_address=request.META["REMOTE_ADDR"]
    )

    return MailPreview(
        html_template="sentry/emails/org_delete_confirm.html",
        text_template="sentry/emails/org_delete_confirm.txt",
        context={
            "organization": org,
            "audit_log_entry": entry,
            "eta": timezone.now() + timedelta(days=1),
            "url": absolute_uri(reverse("sentry-restore-organization", args=[org.slug])),
        },
    ).render(request)


# Used to generate debug email views from a notification
def render_preview_email_for_notification(
    notification: BaseNotification, recipient: User | Team
) -> MutableMapping[str, Any]:
    # remove unneeded fields
    basic_args = get_builder_args(notification, recipient)
    args = {k: v for k, v in basic_args.items() if k not in ["headers", "reference", "subject"]}
    # convert subject back to a string
    args["subject"] = basic_args["subject"].decode("utf-8")

    preview = MailPreviewAdapter(**args)

    return render_to_response("sentry/debug/mail/preview.html", {"preview": preview})
