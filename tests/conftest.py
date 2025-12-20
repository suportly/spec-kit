"""
Pytest configuration and fixtures for spec-kit tests.

This module contains shared fixtures and configuration for all tests.
"""

import asyncio
import os
import tempfile
from pathlib import Path
from typing import AsyncGenerator, Generator

import pytest
from httpx import AsyncClient

# Set test environment
os.environ["TESTING"] = "1"
os.environ["DATABASE_URL"] = "sqlite:///test.db"


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def temp_dir() -> Generator[Path, None, None]:
    """Create a temporary directory for tests.
    
    Yields:
        Path: Path to the temporary directory
    """
    with tempfile.TemporaryDirectory() as tmp_dir:
        yield Path(tmp_dir)


@pytest.fixture
def sample_data() -> dict:
    """Provide sample data for tests.
    
    Returns:
        dict: Sample data dictionary
    """
    return {
        "test_string": "Hello, World!",
        "test_number": 42,
        "test_list": [1, 2, 3, 4, 5],
        "test_dict": {"key1": "value1", "key2": "value2"},
        "test_boolean": True,
    }


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async HTTP client for testing.
    
    Yields:
        AsyncClient: HTTP client for testing
    """
    async with AsyncClient() as client:
        yield client


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Setup test environment before each test.
    
    This fixture runs automatically before each test to ensure
    a clean test environment.
    """
    # Setup code here
    yield
    # Teardown code here


# Pytest configuration
def pytest_configure(config):
    """Configure pytest with custom markers.
    
    Args:
        config: Pytest configuration object
    """
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )
    config.addinivalue_line(
        "markers", "api: mark test as API test"
    )
    config.addinivalue_line(
        "markers", "database: mark test as requiring database"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers automatically.
    
    Args:
        config: Pytest configuration object
        items: List of collected test items
    """
    for item in items:
        # Add 'unit' marker to tests in unit test directories
        if "unit" in str(item.fspath):
            item.add_marker(pytest.mark.unit)
        
        # Add 'integration' marker to tests in integration directories
        elif "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
        
        # Add 'api' marker to API tests
        if "api" in str(item.fspath) or "test_api" in item.name:
            item.add_marker(pytest.mark.api)


# Custom pytest hooks
def pytest_runtest_setup(item):
    """Setup hook that runs before each test.
    
    Args:
        item: Test item being run
    """
    # Skip slow tests unless explicitly requested
    if "slow" in item.keywords and not item.config.getoption("--runslow", default=False):
        pytest.skip("need --runslow option to run")


def pytest_addoption(parser):
    """Add custom command line options.
    
    Args:
        parser: Pytest argument parser
    """
    parser.addoption(
        "--runslow",
        action="store_true",
        default=False,
        help="run slow tests"
    )