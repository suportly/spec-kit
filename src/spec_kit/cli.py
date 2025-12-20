#!/usr/bin/env python3
"""
Command Line Interface for spec-kit.

Provides CLI commands for managing specifications, running tests,
and other development tasks.
"""

import sys
from pathlib import Path
from typing import Optional

import click
from rich.console import Console
from rich.table import Table

from . import __version__, get_version

console = Console()


@click.group()
@click.version_option(version=__version__, prog_name="spec-kit")
@click.option(
    "--verbose", "-v", 
    is_flag=True, 
    help="Enable verbose output"
)
@click.pass_context
def cli(ctx: click.Context, verbose: bool) -> None:
    """Spec-Kit: A comprehensive specification and testing toolkit."""
    ctx.ensure_object(dict)
    ctx.obj["verbose"] = verbose
    
    if verbose:
        console.print(f"[green]Spec-Kit v{get_version()}[/green]")


@cli.command()
def version() -> None:
    """Show version information."""
    table = Table(title="Spec-Kit Version Information")
    table.add_column("Component", style="cyan")
    table.add_column("Version", style="green")
    
    table.add_row("Spec-Kit", __version__)
    table.add_row("Python", f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    
    console.print(table)


@cli.command()
@click.option(
    "--output", "-o",
    type=click.Path(),
    help="Output directory for the project"
)
@click.argument("name")
def init(name: str, output: Optional[str]) -> None:
    """Initialize a new spec-kit project.
    
    Args:
        name: Name of the project to create
        output: Output directory (defaults to current directory)
    """
    output_path = Path(output) if output else Path.cwd()
    project_path = output_path / name
    
    if project_path.exists():
        console.print(f"[red]Error: Directory '{project_path}' already exists[/red]")
        sys.exit(1)
    
    try:
        # Create project structure
        project_path.mkdir(parents=True)
        (project_path / "src").mkdir()
        (project_path / "tests").mkdir()
        (project_path / "docs").mkdir()
        
        # Create basic files
        (project_path / "README.md").write_text(f"# {name}\n\nA spec-kit project.\n")
        (project_path / ".gitignore").write_text(
            "__pycache__/\n*.py[cod]\n*$py.class\n\n"
            "*.so\n.Python\nbuild/\ndevelop-eggs/\ndist/\n"
            "downloads/\neggs/\n.eggs/\nlib/\nlib64/\n"
            "parts/\nsdist/\nvar/\nwheels/\n*.egg-info/\n"
            ".installed.cfg\n*.egg\nPIPFILE.lock\n\n"
            "venv/\nenv/\nENV/\n.venv/\n\n"
            ".coverage\nhtmlcov/\n.pytest_cache/\n"
            ".mypy_cache/\n.DS_Store\n"
        )
        
        console.print(f"[green]✓ Project '{name}' created successfully![/green]")
        console.print(f"[blue]Project location: {project_path}[/blue]")
        
    except Exception as e:
        console.print(f"[red]Error creating project: {e}[/red]")
        sys.exit(1)


@cli.command()
@click.option(
    "--config", "-c",
    type=click.Path(exists=True),
    help="Configuration file path"
)
def test(config: Optional[str]) -> None:
    """Run tests for the current project.
    
    Args:
        config: Path to configuration file
    """
    import subprocess
    
    cmd = ["pytest"]
    if config:
        cmd.extend(["-c", config])
    
    try:
        result = subprocess.run(cmd, check=True)
        console.print("[green]✓ Tests completed successfully![/green]")
    except subprocess.CalledProcessError as e:
        console.print(f"[red]✗ Tests failed with exit code {e.returncode}[/red]")
        sys.exit(e.returncode)
    except FileNotFoundError:
        console.print("[red]Error: pytest not found. Please install development dependencies.[/red]")
        sys.exit(1)


@cli.command()
def info() -> None:
    """Show project information."""
    cwd = Path.cwd()
    
    table = Table(title="Project Information")
    table.add_column("Property", style="cyan")
    table.add_column("Value", style="green")
    
    table.add_row("Current Directory", str(cwd))
    table.add_row("Python Version", f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    
    # Check for common files
    files_to_check = [
        "setup.py", "pyproject.toml", "requirements.txt", 
        "pytest.ini", ".coveragerc", "Makefile"
    ]
    
    for file_name in files_to_check:
        file_path = cwd / file_name
        status = "✓" if file_path.exists() else "✗"
        table.add_row(file_name, status)
    
    console.print(table)


def main() -> None:
    """Main entry point for the CLI."""
    try:
        cli()
    except KeyboardInterrupt:
        console.print("\n[yellow]Operation cancelled by user[/yellow]")
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]Unexpected error: {e}[/red]")
        sys.exit(1)


if __name__ == "__main__":
    main()