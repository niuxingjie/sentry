from datetime import datetime
from unittest import mock

import pytz
from django.utils.functional import cached_property as fixture

from sentry.api.serializers import serialize
from sentry.incidents.models import Incident, IncidentActivity, IncidentStatus
from sentry.testutils import APITestCase


class IncidentDetailsTestBase:
    endpoint = "sentry-api-0-organization-incident-details"

    def setUp(self):
        self.create_team(organization=self.organization, members=[self.user])
        self.login_as(self.user)

    @fixture
    def organization(self):
        return self.create_organization(owner=self.create_user())

    @fixture
    def project(self):
        return self.create_project(organization=self.organization)

    @fixture
    def user(self):
        return self.create_user()

    def test_no_perms(self):
        incident = self.create_incident()
        self.login_as(self.create_user())
        with self.feature("organizations:incidents"):
            resp = self.get_response(incident.organization.slug, incident.id)
        assert resp.status_code == 403

    def test_no_feature(self):
        incident = self.create_incident()
        resp = self.get_response(incident.organization.slug, incident.id)
        assert resp.status_code == 404


class OrganizationIncidentDetailsTest(IncidentDetailsTestBase, APITestCase):
    @mock.patch("django.utils.timezone.now")
    def test_simple(self, mock_now):
        mock_now.return_value = datetime.utcnow().replace(tzinfo=pytz.utc)

        incident = self.create_incident(seen_by=[self.user])
        with self.feature("organizations:incidents"):
            resp = self.get_success_response(incident.organization.slug, incident.identifier)

        expected = serialize(incident)

        user_data = serialize(self.user)
        seen_by = [user_data]

        assert resp.data["id"] == expected["id"]
        assert resp.data["identifier"] == expected["identifier"]
        assert resp.data["projects"] == expected["projects"]
        assert resp.data["dateDetected"] == expected["dateDetected"]
        assert resp.data["dateCreated"] == expected["dateCreated"]
        assert resp.data["projects"] == expected["projects"]
        assert [item["id"] for item in resp.data["seenBy"]] == [item["id"] for item in seen_by]


class OrganizationIncidentUpdateStatusTest(IncidentDetailsTestBase, APITestCase):
    method = "put"

    def get_success_response(self, *args, **params):
        params.setdefault("status", IncidentStatus.CLOSED.value)
        return super().get_success_response(*args, **params)

    def test_simple(self):
        incident = self.create_incident()
        with self.feature("organizations:incidents"):
            self.get_success_response(
                incident.organization.slug, incident.identifier, status=IncidentStatus.CLOSED.value
            )

        incident = Incident.objects.get(id=incident.id)
        assert incident.status == IncidentStatus.CLOSED.value

    def test_cannot_open(self):
        incident = self.create_incident()
        with self.feature("organizations:incidents"):
            resp = self.get_response(
                incident.organization.slug, incident.identifier, status=IncidentStatus.OPEN.value
            )
            assert resp.status_code == 400
            assert resp.data.startswith("Status cannot be changed")

    def test_comment(self):
        incident = self.create_incident()
        status = IncidentStatus.CLOSED.value
        comment = "fixed"
        with self.feature("organizations:incidents"):
            self.get_success_response(
                incident.organization.slug, incident.identifier, status=status, comment=comment
            )

        incident = Incident.objects.get(id=incident.id)
        assert incident.status == status
        activity = IncidentActivity.objects.filter(incident=incident).order_by("-id")[:1].get()
        assert activity.value == str(status)
        assert activity.comment == comment
        assert activity.user == self.user

    def test_invalid_status(self):
        incident = self.create_incident()
        with self.feature("organizations:incidents"):
            resp = self.get_response(incident.organization.slug, incident.identifier, status=5000)
            assert resp.status_code == 400
            assert resp.data["status"][0].startswith("Invalid value for status")
