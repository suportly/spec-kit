"""
speckit - A Python library for spec-driven development with universal LLM support.

This library provides tools for the complete specification workflow:
- Constitution: Project-level principles and standards
- Specify: Generate feature specifications from natural language
- Clarify: Identify ambiguities and generate clarification questions
- Plan: Generate technical implementation plans
- Tasks: Generate implementation task breakdowns
- Analyze: Check consistency across artifacts
"""

from speckit.config import LLMConfig, SpecKitConfig, StorageConfig
from speckit.llm import LiteLLMProvider, LLMResponse
from speckit.schemas import (
    AnalysisReport,
    APIContract,
    APIEndpoint,
    ArchitectureComponent,
    ChecklistItem,
    ClarificationQuestion,
    # Workflow artifacts
    Constitution,
    # Extended artifacts
    DataModel,
    DataModelEntity,
    DataModelField,
    Entity,
    FeatureStatus,
    FunctionalRequirement,
    Phase,
    PhaseType,
    # Enums
    Priority,
    QualityChecklist,
    QuickstartGuide,
    ResearchFindings,
    Specification,
    Task,
    TaskBreakdown,
    TaskStatus,
    TechnicalPlan,
    TechnologyDecision,
    TechStack,
    UserStory,
)
from speckit.speckit import SpecKit

__version__ = "0.2.4"
__all__ = [
    # Main class
    "SpecKit",
    # Config
    "LLMConfig",
    "StorageConfig",
    "SpecKitConfig",
    # Enums
    "Priority",
    "TaskStatus",
    "PhaseType",
    "FeatureStatus",
    # Workflow artifacts
    "Constitution",
    "UserStory",
    "FunctionalRequirement",
    "Entity",
    "Specification",
    "TechStack",
    "ArchitectureComponent",
    "TechnicalPlan",
    "Phase",
    "Task",
    "TaskBreakdown",
    "ClarificationQuestion",
    "AnalysisReport",
    # Extended artifacts
    "DataModel",
    "DataModelEntity",
    "DataModelField",
    "ResearchFindings",
    "TechnologyDecision",
    "APIContract",
    "APIEndpoint",
    "QualityChecklist",
    "ChecklistItem",
    "QuickstartGuide",
    # LLM
    "LiteLLMProvider",
    "LLMResponse",
]
