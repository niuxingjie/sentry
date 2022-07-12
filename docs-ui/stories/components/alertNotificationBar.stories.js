import {NotificationBar} from 'sentry/components/alerts/notificationBar';
import ExternalLink from 'sentry/components/links/externalLink';

export default {
  title: 'Components/Alerts/Notification Bar',
  component: NotificationBar,
  parameters: {
    controls: {hideNoControlsWarning: true},
  },
};

export const Default = () => (
  <NotificationBar type="info">
    <ExternalLink href="#">Info message with a url</ExternalLink>
  </NotificationBar>
);
Default.parameters = {
  docs: {
    description: {
      story: 'Inline alert messages',
    },
  },
};
