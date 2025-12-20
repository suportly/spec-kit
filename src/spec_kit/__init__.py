"""
Spec-Kit: A comprehensive specification and testing toolkit.

This package provides tools for API specification, testing, and validation
with FastAPI integration.
"""

__version__ = "0.1.0"
__author__ = "Suportly Team"
__email__ = "team@suportly.com"
__description__ = "A comprehensive specification and testing toolkit"

# Package metadata
__all__ = [
    "__version__",
    "__author__",
    "__email__",
    "__description__",
]

# Version info tuple for programmatic access
VERSION_INFO = tuple(map(int, __version__.split(".")))

# Package configuration
DEFAULT_CONFIG = {
    "debug": False,
    "testing": False,
    "log_level": "INFO",
}


def get_version() -> str:
    """Get the current version of spec-kit.
    
    Returns:
        str: The version string.
    """
    return __version__


def get_version_info() -> tuple:
    """Get version information as a tuple.
    
    Returns:
        tuple: Version information as (major, minor, patch).
    """
    return VERSION_INFO