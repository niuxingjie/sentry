from unittest.mock import patch

from sentry.net.socket import ensure_fqdn, is_ipaddress_allowed, is_safe_hostname
from sentry.testutils import TestCase
from sentry.testutils.helpers import override_blacklist
from sentry.testutils.helpers.django import override_settings


class SocketTest(TestCase):
    @override_blacklist("10.0.0.0/8", "127.0.0.1")
    def test_is_ipaddress_allowed(self):
        is_ipaddress_allowed.cache_clear()
        assert is_ipaddress_allowed("127.0.0.1") is False
        is_ipaddress_allowed.cache_clear()
        assert is_ipaddress_allowed("10.0.1.1") is False
        is_ipaddress_allowed.cache_clear()
        assert is_ipaddress_allowed("1.1.1.1") is True

    @override_blacklist("10.0.0.0/8", "127.0.0.1")
    @patch("socket.getaddrinfo")
    def test_is_safe_hostname(self, mock_getaddrinfo):
        mock_getaddrinfo.return_value = [(2, 1, 6, "", ("81.0.0.1", 0))]
        assert is_safe_hostname("example.com") is True
        mock_getaddrinfo.return_value = [(2, 1, 6, "", ("127.0.0.1", 0))]
        assert is_safe_hostname("example.com") is False

    @override_settings(SENTRY_ENSURE_FQDN=True)
    def test_ensure_fqdn(self):
        assert ensure_fqdn("example.com") == "example.com."
        assert ensure_fqdn("127.0.0.1") == "127.0.0.1"
        assert ensure_fqdn("example.com.") == "example.com."
