"""
Test package for spec-kit.

This package contains all test modules for the spec-kit project.
"""

# Test configuration
TEST_CONFIG = {
    "test_db_url": "sqlite:///test.db",
    "test_timeout": 30,
    "mock_external_apis": True,
}

__all__ = ["TEST_CONFIG"]