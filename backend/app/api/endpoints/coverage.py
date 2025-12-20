"""API endpoints for test coverage analysis."""

from typing import Dict, Any, Optional
from pathlib import Path

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel

from app.core.test_coverage_analyzer import TestCoverageAnalyzer, CoverageReport


router = APIRouter(prefix="/coverage", tags=["coverage"])


class CoverageAnalysisRequest(BaseModel):
    """Request model for coverage analysis."""
    project_path: str
    test_command: Optional[str] = "python -m pytest"
    config_file: Optional[str] = None


class CoverageAnalysisResponse(BaseModel):
    """Response model for coverage analysis."""
    success: bool
    message: str
    report_id: Optional[str] = None
    summary: Optional[Dict[str, Any]] = None


# In-memory storage for demo purposes (use database in production)
coverage_reports: Dict[str, CoverageReport] = {}


@router.post("/analyze", response_model=CoverageAnalysisResponse)
async def analyze_coverage(
    request: CoverageAnalysisRequest,
    background_tasks: BackgroundTasks
) -> CoverageAnalysisResponse:
    """Run coverage analysis for a project.
    
    Args:
        request: Coverage analysis request
        background_tasks: FastAPI background tasks
        
    Returns:
        Coverage analysis response
    """
    try:
        # Validate project path
        project_path = Path(request.project_path)
        if not project_path.exists():
            raise HTTPException(
                status_code=400,
                detail=f"Project path does not exist: {request.project_path}"
            )
        
        # Initialize analyzer
        analyzer = TestCoverageAnalyzer(
            project_path=str(project_path),
            config_file=request.config_file
        )
        
        # Run tests with coverage in background
        background_tasks.add_task(
            _run_coverage_analysis,
            analyzer,
            request.test_command
        )
        
        return CoverageAnalysisResponse(
            success=True,
            message="Coverage analysis started. Use /coverage/status to check progress."
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error starting coverage analysis: {str(e)}"
        )


@router.get("/summary")
async def get_coverage_summary(
    project_path: str = Query(..., description="Path to the project")
) -> Dict[str, Any]:
    """Get coverage summary for a project.
    
    Args:
        project_path: Path to the project
        
    Returns:
        Coverage summary
    """
    try:
        # Validate project path
        if not Path(project_path).exists():
            raise HTTPException(
                status_code=400,
                detail=f"Project path does not exist: {project_path}"
            )
        
        # Initialize analyzer
        analyzer = TestCoverageAnalyzer(project_path=project_path)
        
        # Get summary
        summary = analyzer.get_coverage_summary()
        
        return {
            "success": True,
            "data": summary
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting coverage summary: {str(e)}"
        )


@router.get("/report/{report_id}")
async def get_coverage_report(report_id: str) -> Dict[str, Any]:
    """Get detailed coverage report by ID.
    
    Args:
        report_id: Report identifier
        
    Returns:
        Detailed coverage report
    """
    if report_id not in coverage_reports:
        raise HTTPException(
            status_code=404,
            detail=f"Coverage report not found: {report_id}"
        )
    
    report = coverage_reports[report_id]
    
    return {
        "success": True,
        "data": report.dict()
    }


@router.get("/reports")
async def list_coverage_reports() -> Dict[str, Any]:
    """List all available coverage reports.
    
    Returns:
        List of coverage reports
    """
    reports = []
    
    for report_id, report in coverage_reports.items():
        reports.append({
            "id": report_id,
            "project_name": report.project_name,
            "line_coverage": report.total_metrics.line_coverage,
            "generated_at": report.generated_at.isoformat(),
            "total_files": len(report.file_coverage)
        })
    
    return {
        "success": True,
        "data": {
            "reports": reports,
            "total_count": len(reports)
        }
    }


@router.post("/generate-html-report")
async def generate_html_report(
    project_path: str = Query(..., description="Path to the project"),
    output_path: str = Query("coverage_report.html", description="Output path for HTML report")
) -> Dict[str, Any]:
    """Generate HTML coverage report.
    
    Args:
        project_path: Path to the project
        output_path: Output path for HTML report
        
    Returns:
        Path to generated HTML report
    """
    try:
        # Validate project path
        if not Path(project_path).exists():
            raise HTTPException(
                status_code=400,
                detail=f"Project path does not exist: {project_path}"
            )
        
        # Initialize analyzer
        analyzer = TestCoverageAnalyzer(project_path=project_path)
        
        # Generate HTML report
        report_path = analyzer.generate_html_report(output_path)
        
        return {
            "success": True,
            "message": "HTML report generated successfully",
            "data": {
                "report_path": report_path
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating HTML report: {str(e)}"
        )


@router.get("/trends")
async def get_coverage_trends(
    project_path: str = Query(..., description="Path to the project")
) -> Dict[str, Any]:
    """Get coverage trends for a project.
    
    Args:
        project_path: Path to the project
        
    Returns:
        Coverage trends data
    """
    try:
        # Validate project path
        if not Path(project_path).exists():
            raise HTTPException(
                status_code=400,
                detail=f"Project path does not exist: {project_path}"
            )
        
        # Initialize analyzer
        analyzer = TestCoverageAnalyzer(project_path=project_path)
        
        # Load trend data
        trend_data = analyzer._load_trend_data()
        
        return {
            "success": True,
            "data": trend_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting coverage trends: {str(e)}"
        )


async def _run_coverage_analysis(analyzer: TestCoverageAnalyzer, test_command: str) -> None:
    """Background task to run coverage analysis.
    
    Args:
        analyzer: Coverage analyzer instance
        test_command: Command to run tests
    """
    try:
        # Run tests with coverage
        success = analyzer.run_tests_with_coverage(test_command)
        
        if success:
            # Analyze coverage
            report = analyzer.analyze_coverage()
            
            # Store report (use proper database in production)
            report_id = f"{report.project_name}_{report.generated_at.strftime('%Y%m%d_%H%M%S')}"
            coverage_reports[report_id] = report
            
            print(f"Coverage analysis completed for {report.project_name}")
        else:
            print("Tests failed during coverage analysis")
            
    except Exception as e:
        print(f"Error in background coverage analysis: {e}")