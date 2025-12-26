"""
main.py - Entry Point for Octo Backend API 🐙

This module provides a FastAPI-based REST API for the Octo
GitHub automation tool.

Author: Octo Team
"""

import os
from typing import Optional
from contextlib import asynccontextmanager

# FastAPI is a modern, fast web framework for building APIs
# Documentation: https://fastapi.tiangolo.com/
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import our scout module for repository discovery
from scout import GitHubScout, RepoRecommendation, print_recommendations

from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# ============================================================================
# PYDANTIC MODELS - Request/Response schemas
# ============================================================================

class RepoResponse(BaseModel):
    """Response model for a repository recommendation."""
    name: str
    url: str
    stars: int
    description: str
    language: str
    topics: list[str]


class DiscoveryResponse(BaseModel):
    """Response model for the discovery endpoint."""
    success: bool
    username: str
    recommendations: list[RepoResponse]
    message: str


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    service: str
    version: str


# ============================================================================
# FASTAPI APP SETUP
# ============================================================================

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle app startup and shutdown events."""
    # Startup
    print("🐙 Octo Backend starting up...")
    yield
    # Shutdown
    print("🐙 Octo Backend shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Octo - GitHub Automation Tool",
    description="🐙 Automated GitHub workflow for discovering repos and managing contributions",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS for frontend communication
# This allows the React frontend to communicate with our API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/", response_model=HealthResponse)
async def root() -> HealthResponse:
    """
    Root endpoint - Health check.
    
    Returns basic service information to verify the API is running.
    """
    return HealthResponse(
        status="healthy",
        service="Octo Backend",
        version="0.1.0"
    )


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    
    Use this to verify the API is running and responsive.
    """
    return HealthResponse(
        status="healthy",
        service="Octo Backend",
        version="0.1.0"
    )


@app.get("/api/discover", response_model=DiscoveryResponse)
async def discover_repositories(
    max_results: int = 5,
    token: Optional[str] = None
) -> DiscoveryResponse:
    """
    Discover new repositories based on user's contribution history.
    
    This endpoint:
    1. Analyzes your merged PRs
    2. Identifies your top languages and topics
    3. Searches for matching repositories
    4. Filters out repos you already own/forked
    
    Args:
        max_results: Number of recommendations (default: 5, max: 10)
        token: Optional GitHub token (uses env variable if not provided)
    
    Returns:
        DiscoveryResponse with repository recommendations
    
    Raises:
        HTTPException: If authentication fails or API errors occur
    """
    # Validate max_results
    max_results = min(max(1, max_results), 10)
    
    try:
        # Initialize GitHubScout with provided token or env variable
        scout = GitHubScout(token=token)
        
        # Discover repositories
        recommendations = scout.discover_repos(max_results=max_results)
        
        # Convert to response format
        repo_responses = [
            RepoResponse(
                name=rec.name,
                url=rec.url,
                stars=rec.stars,
                description=rec.description,
                language=rec.language,
                topics=rec.topics
            )
            for rec in recommendations
        ]
        
        return DiscoveryResponse(
            success=True,
            username=scout.user.login,
            recommendations=repo_responses,
            message=f"Found {len(repo_responses)} repository recommendations!"
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error discovering repositories: {str(e)}"
        )


@app.get("/api/profile")
async def get_user_profile(token: Optional[str] = None) -> dict:
    """
    Get the analyzed user profile.
    
    Returns the user's top languages, topics, and repo counts
    without performing repository search.
    
    Args:
        token: Optional GitHub token (uses env variable if not provided)
    
    Returns:
        Dictionary with user profile information
    """
    try:
        scout = GitHubScout(token=token)
        profile = scout.build_user_profile()
        
        return {
            "success": True,
            "profile": {
                "username": profile.username,
                "top_languages": profile.top_languages,
                "top_topics": profile.top_topics,
                "owned_repos_count": len(profile.owned_repos),
                "forked_repos_count": len(profile.forked_repos)
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# CLI MODE - Run discovery from command line
# ============================================================================

def run_cli() -> None:
    """Run the discovery as a CLI tool."""
    print("\n🐙 Octo - Repository Discovery CLI\n")
    
    try:
        scout = GitHubScout()
        recommendations = scout.discover_repos(max_results=5)
        print_recommendations(recommendations)
    except Exception as e:
        print(f"❌ Error: {e}")


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--cli":
        # Run in CLI mode
        run_cli()
    else:
        # Run as API server
        import uvicorn
        
        port = int(os.getenv("PORT", "8000"))
        
        print(f"🐙 Starting Octo API on http://localhost:{port}")
        print("📚 API docs available at http://localhost:{port}/docs")
        
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=port,
            reload=True  # Auto-reload on code changes
        )
