"""
Example test module for spec-kit.

This module demonstrates basic testing patterns and serves as a template
for writing tests in the spec-kit project.
"""

import pytest
from pathlib import Path

from spec_kit import get_version, get_version_info


class TestVersion:
    """Test version-related functionality."""
    
    def test_get_version_returns_string(self):
        """Test that get_version returns a string."""
        version = get_version()
        assert isinstance(version, str)
        assert len(version) > 0
    
    def test_get_version_info_returns_tuple(self):
        """Test that get_version_info returns a tuple."""
        version_info = get_version_info()
        assert isinstance(version_info, tuple)
        assert len(version_info) == 3
        assert all(isinstance(x, int) for x in version_info)
    
    def test_version_format(self):
        """Test that version follows semantic versioning format."""
        version = get_version()
        parts = version.split(".")
        assert len(parts) == 3
        assert all(part.isdigit() for part in parts)


class TestBasicFunctionality:
    """Test basic functionality."""
    
    def test_import_success(self):
        """Test that the main module can be imported successfully."""
        import spec_kit
        assert spec_kit is not None
    
    def test_package_attributes(self):
        """Test that package has expected attributes."""
        import spec_kit
        
        expected_attrs = [
            "__version__",
            "__author__",
            "__email__",
            "__description__",
        ]
        
        for attr in expected_attrs:
            assert hasattr(spec_kit, attr)
            assert getattr(spec_kit, attr) is not None


@pytest.mark.unit
class TestUtilities:
    """Test utility functions."""
    
    def test_sample_data_fixture(self, sample_data):
        """Test that sample_data fixture works correctly."""
        assert isinstance(sample_data, dict)
        assert "test_string" in sample_data
        assert "test_number" in sample_data
        assert sample_data["test_string"] == "Hello, World!"
        assert sample_data["test_number"] == 42
    
    def test_temp_dir_fixture(self, temp_dir):
        """Test that temp_dir fixture creates a valid directory."""
        assert isinstance(temp_dir, Path)
        assert temp_dir.exists()
        assert temp_dir.is_dir()
        
        # Test that we can create files in the temp directory
        test_file = temp_dir / "test.txt"
        test_file.write_text("test content")
        assert test_file.exists()
        assert test_file.read_text() == "test content"


@pytest.mark.asyncio
class TestAsyncFunctionality:
    """Test asynchronous functionality."""
    
    async def test_async_client_fixture(self, async_client):
        """Test that async_client fixture works correctly."""
        # This is a basic test to ensure the fixture works
        # In real tests, you would make HTTP requests
        assert async_client is not None
    
    async def test_basic_async_operation(self):
        """Test a basic async operation."""
        import asyncio
        
        async def sample_async_function():
            await asyncio.sleep(0.01)  # Very short sleep
            return "async result"
        
        result = await sample_async_function()
        assert result == "async result"


@pytest.mark.slow
class TestSlowOperations:
    """Test slow operations (skipped unless --runslow is used)."""
    
    def test_slow_operation(self):
        """Test a slow operation."""
        import time
        time.sleep(0.1)  # Simulate slow operation
        assert True


class TestErrorHandling:
    """Test error handling scenarios."""
    
    def test_exception_handling(self):
        """Test that exceptions are handled properly."""
        with pytest.raises(ValueError):
            raise ValueError("Test exception")
    
    def test_assertion_error(self):
        """Test assertion errors."""
        with pytest.raises(AssertionError):
            assert False, "This should raise an AssertionError"


# Parametrized tests
@pytest.mark.parametrize("input_value,expected", [
    (1, 2),
    (2, 4),
    (3, 6),
    (4, 8),
])
def test_parametrized_function(input_value, expected):
    """Test a function with multiple parameter sets."""
    def double(x):
        return x * 2
    
    assert double(input_value) == expected


# Integration test example
@pytest.mark.integration
class TestIntegration:
    """Integration tests."""
    
    def test_integration_example(self):
        """Example integration test."""
        # This would test integration between components
        assert True