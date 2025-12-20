"""Global pytest configuration and fixtures."""

import asyncio
import os
import sys
from pathlib import Path
from typing import Generator, Any

import pytest
from _pytest.config import Config
from _pytest.fixtures import FixtureRequest

# Add src directory to Python path
project_root = Path(__file__).parent
src_path = project_root / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))


def pytest_configure(config: Config) -> None:
    """Configure pytest with custom settings."""
    # Add custom markers
    config.addinivalue_line(
        "markers", "unit: mark test as a unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "e2e: mark test as an end-to-end test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "api: mark test as an API test"
    )
    config.addinivalue_line(
        "markers", "database: mark test as a database test"
    )
    config.addinivalue_line(
        "markers", "auth: mark test as an authentication test"
    )
    config.addinivalue_line(
        "markers", "external: mark test as requiring external services"
    )

    # Set environment variables for testing
    os.environ["TESTING"] = "1"
    os.environ["ENVIRONMENT"] = "test"


def pytest_collection_modifyitems(config: Config, items: list) -> None:
    """Modify test collection to add markers based on file paths."""
    for item in items:
        # Auto-mark tests based on file path
        test_file = str(item.fspath)
        
        if "/unit/" in test_file or "test_unit_" in test_file:
            item.add_marker(pytest.mark.unit)
        elif "/integration/" in test_file or "test_integration_" in test_file:
            item.add_marker(pytest.mark.integration)
        elif "/e2e/" in test_file or "test_e2e_" in test_file:
            item.add_marker(pytest.mark.e2e)
        elif "/api/" in test_file or "test_api_" in test_file:
            item.add_marker(pytest.mark.api)
        
        # Mark slow tests
        if hasattr(item.obj, "pytestmark"):
            for mark in item.obj.pytestmark:
                if mark.name == "slow":
                    item.add_marker(pytest.mark.slow)


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def test_config() -> dict[str, Any]:
    """Provide test configuration."""
    return {
        "database_url": "sqlite:///:memory:",
        "redis_url": "redis://localhost:6379/1",
        "api_base_url": "http://localhost:8000",
        "frontend_url": "http://localhost:3000",
        "test_timeout": 30,
        "debug": True,
    }


@pytest.fixture
def mock_env_vars(monkeypatch: pytest.MonkeyPatch) -> None:
    """Mock environment variables for testing."""
    test_env_vars = {
        "DATABASE_URL": "sqlite:///:memory:",
        "REDIS_URL": "redis://localhost:6379/1",
        "SECRET_KEY": "test-secret-key",
        "DEBUG": "True",
        "TESTING": "True",
        "ENVIRONMENT": "test",
    }
    
    for key, value in test_env_vars.items():
        monkeypatch.setenv(key, value)


@pytest.fixture
def temp_dir(tmp_path: Path) -> Path:
    """Provide a temporary directory for tests."""
    return tmp_path


@pytest.fixture
def sample_data() -> dict[str, Any]:
    """Provide sample data for tests."""
    return {
        "user": {
            "id": 1,
            "email": "test@example.com",
            "name": "Test User",
            "is_active": True,
        },
        "project": {
            "id": 1,
            "name": "Test Project",
            "description": "A test project",
            "status": "active",
        },
        "spec": {
            "id": 1,
            "title": "Test Specification",
            "content": "This is a test specification",
            "version": "1.0.0",
        },
    }


@pytest.fixture(autouse=True)
def reset_singletons() -> Generator[None, None, None]:
    """Reset singleton instances between tests."""
    yield
    # Add cleanup code for singletons if needed
    pass


@pytest.fixture
def disable_network(monkeypatch: pytest.MonkeyPatch) -> None:
    """Disable network access for tests that shouldn't make external calls."""
    import socket
    
    def guard(*args, **kwargs):
        raise RuntimeError("Network access not allowed during testing")
    
    monkeypatch.setattr(socket, "socket", guard)


@pytest.fixture
def capture_logs(caplog: pytest.LogCaptureFixture) -> pytest.LogCaptureFixture:
    """Capture logs with INFO level."""
    caplog.set_level("INFO")
    return caplog


# Async test utilities
@pytest.fixture
async def async_client():
    """Provide an async HTTP client for API testing."""
    # This would be implemented based on your HTTP client choice
    # Example with httpx:
    # import httpx
    # async with httpx.AsyncClient() as client:
    #     yield client
    pass


# Database fixtures (if using a database)
@pytest.fixture
async def db_session():
    """Provide a database session for testing."""
    # This would be implemented based on your database setup
    # Example with SQLAlchemy:
    # from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    # engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    # async with AsyncSession(engine) as session:
    #     yield session
    pass


# Authentication fixtures
@pytest.fixture
def auth_headers() -> dict[str, str]:
    """Provide authentication headers for API tests."""
    return {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json",
    }


@pytest.fixture
def mock_user():
    """Provide a mock user for testing."""
    return {
        "id": 1,
        "email": "test@example.com",
        "name": "Test User",
        "roles": ["user"],
        "is_active": True,
        "created_at": "2023-01-01T00:00:00Z",
    }


# Performance testing fixtures
@pytest.fixture
def benchmark_config() -> dict[str, Any]:
    """Configuration for performance benchmarks."""
    return {
        "min_rounds": 5,
        "max_time": 1.0,
        "warmup": True,
        "warmup_iterations": 2,
    }


# Cleanup fixtures
@pytest.fixture(autouse=True)
def cleanup_test_files(request: FixtureRequest) -> Generator[None, None, None]:
    """Clean up test files after each test."""
    yield
    
    # Clean up any test files created during the test
    test_files_dir = Path("/tmp/spec-kit-tests")
    if test_files_dir.exists():
        import shutil
        shutil.rmtree(test_files_dir, ignore_errors=True)