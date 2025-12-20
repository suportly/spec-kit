"""Test Coverage Analyzer module for generating detailed coverage metrics and reports."""

import json
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

import coverage
from pydantic import BaseModel


class CoverageMetrics(BaseModel):
    """Model for coverage metrics."""
    line_coverage: float
    branch_coverage: float
    function_coverage: float
    total_lines: int
    covered_lines: int
    missing_lines: List[int]
    excluded_lines: List[int]
    timestamp: datetime


class FileCoverage(BaseModel):
    """Model for individual file coverage."""
    filename: str
    metrics: CoverageMetrics
    complexity_score: Optional[float] = None


class CoverageReport(BaseModel):
    """Model for complete coverage report."""
    project_name: str
    total_metrics: CoverageMetrics
    file_coverage: List[FileCoverage]
    trend_data: Optional[Dict[str, Any]] = None
    generated_at: datetime


class TestCoverageAnalyzer:
    """Analyzer for test coverage with detailed metrics and trend tracking."""

    def __init__(self, project_path: str, config_file: Optional[str] = None):
        """Initialize the coverage analyzer.
        
        Args:
            project_path: Path to the project root
            config_file: Optional path to coverage configuration file
        """
        self.project_path = Path(project_path)
        self.config_file = config_file
        self.coverage_data_dir = self.project_path / ".coverage_data"
        self.coverage_data_dir.mkdir(exist_ok=True)
        
        # Initialize coverage.py
        self.cov = coverage.Coverage(
            config_file=config_file,
            data_file=str(self.coverage_data_dir / ".coverage")
        )

    def run_tests_with_coverage(self, test_command: str = "python -m pytest") -> bool:
        """Run tests with coverage collection.
        
        Args:
            test_command: Command to run tests
            
        Returns:
            True if tests ran successfully, False otherwise
        """
        try:
            # Start coverage
            self.cov.start()
            
            # Run tests
            result = subprocess.run(
                test_command.split(),
                cwd=self.project_path,
                capture_output=True,
                text=True
            )
            
            # Stop coverage
            self.cov.stop()
            self.cov.save()
            
            return result.returncode == 0
            
        except Exception as e:
            print(f"Error running tests with coverage: {e}")
            return False

    def analyze_coverage(self) -> CoverageReport:
        """Analyze coverage data and generate detailed metrics.
        
        Returns:
            Complete coverage report with metrics
        """
        try:
            # Load coverage data
            self.cov.load()
            
            # Get overall metrics
            total_metrics = self._calculate_total_metrics()
            
            # Get file-level coverage
            file_coverage = self._analyze_file_coverage()
            
            # Load trend data
            trend_data = self._load_trend_data()
            
            report = CoverageReport(
                project_name=self.project_path.name,
                total_metrics=total_metrics,
                file_coverage=file_coverage,
                trend_data=trend_data,
                generated_at=datetime.now()
            )
            
            # Save trend data
            self._save_trend_data(report)
            
            return report
            
        except Exception as e:
            raise RuntimeError(f"Error analyzing coverage: {e}")

    def _calculate_total_metrics(self) -> CoverageMetrics:
        """Calculate overall project coverage metrics."""
        # Get coverage statistics
        total_lines = 0
        covered_lines = 0
        missing_lines = []
        excluded_lines = []
        
        for filename in self.cov.get_data().measured_files():
            analysis = self.cov.analysis2(filename)
            total_lines += len(analysis.statements)
            covered_lines += len(analysis.statements) - len(analysis.missing)
            missing_lines.extend(analysis.missing)
            excluded_lines.extend(analysis.excluded)
        
        line_coverage = (covered_lines / total_lines * 100) if total_lines > 0 else 0
        
        # Calculate branch coverage if available
        branch_coverage = 0
        try:
            branch_stats = self.cov.get_data().branch_coverage()
            if branch_stats:
                branch_coverage = branch_stats.get('percent_covered', 0)
        except:
            pass
        
        return CoverageMetrics(
            line_coverage=round(line_coverage, 2),
            branch_coverage=round(branch_coverage, 2),
            function_coverage=0,  # Would need additional analysis
            total_lines=total_lines,
            covered_lines=covered_lines,
            missing_lines=missing_lines,
            excluded_lines=excluded_lines,
            timestamp=datetime.now()
        )

    def _analyze_file_coverage(self) -> List[FileCoverage]:
        """Analyze coverage for individual files."""
        file_coverage = []
        
        for filename in self.cov.get_data().measured_files():
            try:
                analysis = self.cov.analysis2(filename)
                
                total_lines = len(analysis.statements)
                covered_lines = total_lines - len(analysis.missing)
                line_coverage = (covered_lines / total_lines * 100) if total_lines > 0 else 0
                
                metrics = CoverageMetrics(
                    line_coverage=round(line_coverage, 2),
                    branch_coverage=0,  # File-level branch coverage would need more analysis
                    function_coverage=0,
                    total_lines=total_lines,
                    covered_lines=covered_lines,
                    missing_lines=list(analysis.missing),
                    excluded_lines=list(analysis.excluded),
                    timestamp=datetime.now()
                )
                
                # Calculate complexity score (simplified)
                complexity_score = self._calculate_complexity_score(filename)
                
                file_coverage.append(FileCoverage(
                    filename=str(Path(filename).relative_to(self.project_path)),
                    metrics=metrics,
                    complexity_score=complexity_score
                ))
                
            except Exception as e:
                print(f"Error analyzing file {filename}: {e}")
                continue
        
        return file_coverage

    def _calculate_complexity_score(self, filename: str) -> float:
        """Calculate a simplified complexity score for a file."""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Simple complexity metrics
            lines = content.split('\n')
            complexity_indicators = [
                'if ', 'elif ', 'else:', 'for ', 'while ', 'try:', 'except:', 
                'def ', 'class ', 'lambda ', 'with '
            ]
            
            complexity_count = sum(
                line.count(indicator) for line in lines for indicator in complexity_indicators
            )
            
            # Normalize by file size
            return round(complexity_count / len(lines) * 100, 2) if lines else 0
            
        except Exception:
            return 0

    def _load_trend_data(self) -> Dict[str, Any]:
        """Load historical trend data."""
        trend_file = self.coverage_data_dir / "trend_data.json"
        
        if trend_file.exists():
            try:
                with open(trend_file, 'r') as f:
                    return json.load(f)
            except Exception:
                pass
        
        return {"history": [], "trends": {}}

    def _save_trend_data(self, report: CoverageReport) -> None:
        """Save current report data for trend analysis."""
        trend_file = self.coverage_data_dir / "trend_data.json"
        trend_data = self._load_trend_data()
        
        # Add current data point
        data_point = {
            "timestamp": report.generated_at.isoformat(),
            "line_coverage": report.total_metrics.line_coverage,
            "branch_coverage": report.total_metrics.branch_coverage,
            "total_lines": report.total_metrics.total_lines,
            "covered_lines": report.total_metrics.covered_lines
        }
        
        trend_data["history"].append(data_point)
        
        # Keep only last 100 data points
        if len(trend_data["history"]) > 100:
            trend_data["history"] = trend_data["history"][-100:]
        
        # Calculate trends
        trend_data["trends"] = self._calculate_trends(trend_data["history"])
        
        try:
            with open(trend_file, 'w') as f:
                json.dump(trend_data, f, indent=2)
        except Exception as e:
            print(f"Error saving trend data: {e}")

    def _calculate_trends(self, history: List[Dict]) -> Dict[str, Any]:
        """Calculate coverage trends from historical data."""
        if len(history) < 2:
            return {}
        
        recent = history[-5:]  # Last 5 data points
        older = history[-10:-5] if len(history) >= 10 else history[:-5]
        
        if not older:
            return {}
        
        recent_avg = sum(point["line_coverage"] for point in recent) / len(recent)
        older_avg = sum(point["line_coverage"] for point in older) / len(older)
        
        trend = "improving" if recent_avg > older_avg else "declining" if recent_avg < older_avg else "stable"
        change = round(recent_avg - older_avg, 2)
        
        return {
            "trend": trend,
            "change_percentage": change,
            "recent_average": round(recent_avg, 2),
            "previous_average": round(older_avg, 2)
        }

    def generate_html_report(self, output_path: str = "coverage_report.html") -> str:
        """Generate HTML coverage report.
        
        Args:
            output_path: Path for the HTML report
            
        Returns:
            Path to generated HTML report
        """
        try:
            self.cov.html_report(directory=output_path)
            return str(Path(output_path).absolute())
        except Exception as e:
            raise RuntimeError(f"Error generating HTML report: {e}")

    def generate_json_report(self, report: CoverageReport, output_path: str = "coverage_report.json") -> str:
        """Generate JSON coverage report.
        
        Args:
            report: Coverage report to save
            output_path: Path for the JSON report
            
        Returns:
            Path to generated JSON report
        """
        try:
            output_file = Path(output_path)
            with open(output_file, 'w') as f:
                json.dump(report.dict(), f, indent=2, default=str)
            return str(output_file.absolute())
        except Exception as e:
            raise RuntimeError(f"Error generating JSON report: {e}")

    def get_coverage_summary(self) -> Dict[str, Any]:
        """Get a quick coverage summary.
        
        Returns:
            Dictionary with coverage summary
        """
        try:
            report = self.analyze_coverage()
            return {
                "line_coverage": report.total_metrics.line_coverage,
                "branch_coverage": report.total_metrics.branch_coverage,
                "total_files": len(report.file_coverage),
                "files_with_low_coverage": len([
                    f for f in report.file_coverage 
                    if f.metrics.line_coverage < 80
                ]),
                "trend": report.trend_data.get("trends", {}).get("trend", "unknown") if report.trend_data else "unknown",
                "generated_at": report.generated_at.isoformat()
            }
        except Exception as e:
            raise RuntimeError(f"Error getting coverage summary: {e}")