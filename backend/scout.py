"""
scout.py - Repository Discovery Module for Octo 🐙

This module analyzes your GitHub contribution history and recommends
new repositories that match your skills and interests.

Author: Octo Team
"""

import os
from collections import Counter
from typing import Optional
from dataclasses import dataclass

# PyGithub is the main library we use to interact with GitHub's API
# Documentation: https://pygithub.readthedocs.io/
from github import Github, Auth
from github.Repository import Repository
from github.PullRequest import PullRequest
from github.GithubException import GithubException

# python-dotenv loads environment variables from a .env file
# This keeps our secrets (like GITHUB_TOKEN) safe and out of code
from dotenv import load_dotenv


# ============================================================================
# DATA CLASSES - Clean way to structure our data
# ============================================================================

@dataclass
class UserProfile:
    """
    Represents the user's coding profile extracted from their PR history.
    
    Attributes:
        username: GitHub username
        top_languages: List of most used programming languages
        top_topics: List of most contributed repository topics
        owned_repos: Set of repo full names the user owns
        forked_repos: Set of repo full names the user has forked
    """
    username: str
    top_languages: list[str]
    top_topics: list[str]
    owned_repos: set[str]
    forked_repos: set[str]


@dataclass
class RepoRecommendation:
    """
    A recommended repository for the user to contribute to.
    
    Attributes:
        name: Full name of the repository (owner/repo)
        url: GitHub URL of the repository
        stars: Number of stars the repository has
        description: Short description of the repository
        language: Primary programming language
        topics: List of repository topics
    """
    name: str
    url: str
    stars: int
    description: str
    language: str
    topics: list[str]


# ============================================================================
# GITHUB SCOUT CLASS - The main discovery engine
# ============================================================================

class GitHubScout:
    """
    GitHubScout analyzes your contribution history and finds new repositories
    that match your skills and interests.
    
    How it works:
    1. Fetches your merged Pull Requests
    2. Analyzes languages and topics from those PRs
    3. Searches GitHub for matching repositories
    4. Filters out repos you already own or have forked
    """
    
    def __init__(self, token: Optional[str] = None) -> None:
        """
        Initialize the GitHubScout with authentication.
        
        Args:
            token: GitHub Personal Access Token. If not provided,
                   it will try to load from GITHUB_TOKEN env variable.
        
        Raises:
            ValueError: If no token is found
        """
        # Load environment variables from .env file
        # This is where we store GITHUB_TOKEN securely
        load_dotenv()
        
        # Try to get token from parameter or environment
        self.token: str = token or os.getenv("GITHUB_TOKEN", "")
        
        if not self.token:
            raise ValueError(
                "❌ No GitHub token found!\n"
                "Please set GITHUB_TOKEN in your .env file or pass it directly.\n"
                "Get your token from: https://github.com/settings/tokens"
            )
        
        # Create authenticated GitHub client
        # Auth.Token is the recommended way to authenticate in PyGithub v2+
        auth = Auth.Token(self.token)
        self.github: Github = Github(auth=auth)
        
        # Get the authenticated user object
        # This gives us access to user's repos, PRs, etc.
        self.user = self.github.get_user()
        print(f"✅ Authenticated as: {self.user.login}")
    
    def _get_merged_pull_requests(self, max_prs: int = 100) -> list[PullRequest]:
        """
        Fetch the user's merged Pull Requests from GitHub.
        
        This uses GitHub's Search API to find PRs where:
        - author: is the current user
        - is:pr - we're searching for Pull Requests
        - is:merged - only merged PRs (not open or closed)
        
        Args:
            max_prs: Maximum number of PRs to fetch (default: 100)
        
        Returns:
            List of merged PullRequest objects
        """
        print(f"🔍 Fetching merged PRs for {self.user.login}...")
        
        # GitHub Search API query syntax:
        # - "author:username" finds items created by that user
        # - "is:pr" filters to only Pull Requests
        # - "is:merged" filters to only merged PRs
        # - "is:public" ensures we only get public repos
        query = f"author:{self.user.login} is:pr is:merged is:public"
        
        # search_issues can find both Issues and PRs
        # Returns a PaginatedList that we can iterate over
        search_results = self.github.search_issues(query=query, sort="updated")
        
        merged_prs: list[PullRequest] = []
        
        # Iterate through results (paginated automatically by PyGithub)
        for issue in search_results:
            if len(merged_prs) >= max_prs:
                break
            
            # Convert Issue to PullRequest to get full PR data
            # issue.pull_request gives us the PR reference
            if issue.pull_request:
                try:
                    # Get the repository this PR belongs to
                    repo = self.github.get_repo(issue.repository.full_name)
                    # Get the actual PR object with full details
                    pr = repo.get_pull(issue.number)
                    merged_prs.append(pr)
                except GithubException as e:
                    # Skip if we can't access the PR (repo might be private now)
                    print(f"⚠️  Skipping inaccessible PR: {e}")
                    continue
        
        print(f"📊 Found {len(merged_prs)} merged PRs")
        return merged_prs
    
    def _analyze_contribution_history(self, prs: list[PullRequest]) -> tuple[list[str], list[str]]:
        """
        Analyze merged PRs to find top languages and topics.
        
        We look at each PR's repository to extract:
        - The primary programming language
        - The repository topics (tags)
        
        Then we count occurrences and return the most common ones.
        
        Args:
            prs: List of merged PullRequest objects
        
        Returns:
            Tuple of (top_languages, top_topics)
        """
        print("📈 Analyzing your contribution history...")
        
        # Counter is a dict subclass for counting hashable objects
        # It has helpful methods like most_common()
        language_counter: Counter[str] = Counter()
        topic_counter: Counter[str] = Counter()
        
        for pr in prs:
            try:
                # Get the repository this PR was merged into
                repo: Repository = pr.base.repo
                
                # repo.language is the primary language detected by GitHub
                # It uses linguist library to detect languages from file extensions
                if repo.language:
                    language_counter[repo.language] += 1
                
                # repo.topics is a list of topic tags set by repo maintainers
                # These are like hashtags that describe the project
                # Note: get_topics() makes an API call, so we use it sparingly
                topics = repo.get_topics()
                for topic in topics:
                    topic_counter[topic] += 1
                    
            except GithubException:
                # Skip if we can't access repo details
                continue
        
        # most_common(n) returns the n most common elements and their counts
        # We extract just the element names (not counts) using list comprehension
        top_languages = [lang for lang, _ in language_counter.most_common(3)]
        top_topics = [topic for topic, _ in topic_counter.most_common(5)]
        
        print(f"🗣️  Top Languages: {', '.join(top_languages) or 'None found'}")
        print(f"🏷️  Top Topics: {', '.join(top_topics) or 'None found'}")
        
        return top_languages, top_topics
    
    def _get_user_repos(self) -> tuple[set[str], set[str]]:
        """
        Get lists of repositories the user owns or has forked.
        
        We need this to filter out repos the user is already associated with.
        
        Returns:
            Tuple of (owned_repo_names, forked_repo_names)
        """
        print("📂 Fetching your repositories...")
        
        owned_repos: set[str] = set()
        forked_repos: set[str] = set()
        
        # get_repos() returns all repos the user has access to
        # affiliation="owner" means repos owned by the user
        for repo in self.user.get_repos(affiliation="owner"):
            if repo.fork:
                # If it's a fork, add both the fork and original to exclusion
                forked_repos.add(repo.full_name)
                # parent is the original repo this was forked from
                if repo.parent:
                    forked_repos.add(repo.parent.full_name)
            else:
                owned_repos.add(repo.full_name)
        
        print(f"📁 Found {len(owned_repos)} owned, {len(forked_repos)} forked repos")
        return owned_repos, forked_repos
    
    def build_user_profile(self) -> UserProfile:
        """
        Build a complete user profile by analyzing their GitHub history.
        
        This combines:
        - Merged PR analysis (languages, topics)
        - Repository ownership information
        
        Returns:
            UserProfile object with all analyzed data
        """
        print("\n" + "="*50)
        print("🐙 Building your GitHub profile...")
        print("="*50 + "\n")
        
        # Step 1: Get merged PRs
        merged_prs = self._get_merged_pull_requests()
        
        # Step 2: Analyze languages and topics from PRs
        top_languages, top_topics = self._analyze_contribution_history(merged_prs)
        
        # Step 3: Get owned and forked repos
        owned_repos, forked_repos = self._get_user_repos()
        
        return UserProfile(
            username=self.user.login,
            top_languages=top_languages,
            top_topics=top_topics,
            owned_repos=owned_repos,
            forked_repos=forked_repos
        )
    
    def search_repositories(
        self,
        profile: UserProfile,
        max_results: int = 5,
        sort_by: str = "stars"
    ) -> list[RepoRecommendation]:
        """
        Search for new repositories matching the user's profile.
        
        Uses GitHub Search API with advanced query syntax to find:
        - Public repositories
        - Matching user's top languages
        - Having help-wanted or good-first-issue labels
        - Sorted by stars or help-wanted-issues
        
        Args:
            profile: UserProfile with user's preferences
            max_results: Number of recommendations to return
            sort_by: How to sort results - "stars" or "help-wanted-issues"
        
        Returns:
            List of RepoRecommendation objects
        """
        print("\n" + "="*50)
        print("🔭 Searching for new repositories...")
        print("="*50 + "\n")
        
        recommendations: list[RepoRecommendation] = []
        
        # Set of repos to exclude (already owned or forked)
        excluded_repos = profile.owned_repos | profile.forked_repos
        
        # Build search query
        # GitHub Search Query Syntax:
        # - "language:X" filters by programming language
        # - "topic:X" filters by repository topic
        # - "stars:>N" filters by minimum star count
        # - "pushed:>DATE" filters by recent activity
        # - "good-first-issues:>0" finds repos with beginner issues
        # - "help-wanted-issues:>0" finds repos needing help
        
        # Search for each top language
        for language in profile.top_languages:
            if len(recommendations) >= max_results:
                break
            
            # Build query: find repos with this language, good first issues,
            # and pushed to recently (active development)
            query = (
                f"language:{language} "
                f"stars:>50 "  # Minimum popularity threshold
                f"pushed:>2024-01-01 "  # Active in 2024
                f"good-first-issues:>0 "  # Has beginner-friendly issues
                f"archived:false"  # Not archived
            )
            
            print(f"🔍 Searching: {query}")
            
            try:
                # search_repositories returns repos matching our query
                # sort parameter determines ordering
                search_results = self.github.search_repositories(
                    query=query,
                    sort=sort_by,
                    order="desc"  # Descending order (highest first)
                )
                
                # Process search results
                for repo in search_results:
                    if len(recommendations) >= max_results:
                        break
                    
                    # Skip if user owns or has forked this repo
                    if repo.full_name in excluded_repos:
                        continue
                    
                    # Skip if already in recommendations
                    if any(r.name == repo.full_name for r in recommendations):
                        continue
                    
                    # Create recommendation object
                    recommendation = RepoRecommendation(
                        name=repo.full_name,
                        url=repo.html_url,
                        stars=repo.stargazers_count,
                        description=repo.description or "No description",
                        language=repo.language or "Unknown",
                        topics=repo.get_topics()[:5]  # Limit topics for readability
                    )
                    
                    recommendations.append(recommendation)
                    print(f"✨ Found: {repo.full_name} ⭐ {repo.stargazers_count}")
                    
            except GithubException as e:
                print(f"⚠️  Search error: {e}")
                continue
        
        return recommendations
    
    def discover_repos(self, max_results: int = 5) -> list[RepoRecommendation]:
        """
        Main method to discover new repositories for the user.
        
        This is the high-level method that orchestrates:
        1. Building user profile from PR history
        2. Searching for matching repositories
        3. Filtering and returning recommendations
        
        Args:
            max_results: Number of recommendations to return
        
        Returns:
            List of RepoRecommendation objects
        """
        # Build profile from user's contribution history
        profile = self.build_user_profile()
        
        # Search for matching repositories
        recommendations = self.search_repositories(profile, max_results)
        
        return recommendations


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def print_recommendations(recommendations: list[RepoRecommendation]) -> None:
    """
    Pretty print the repository recommendations.
    
    Args:
        recommendations: List of RepoRecommendation objects to display
    """
    print("\n" + "="*60)
    print("🐙 OCTO'S REPOSITORY RECOMMENDATIONS")
    print("="*60 + "\n")
    
    if not recommendations:
        print("😔 No recommendations found. Try contributing to more repos!")
        return
    
    for i, repo in enumerate(recommendations, 1):
        print(f"📦 [{i}] {repo.name}")
        print(f"   🔗 {repo.url}")
        print(f"   ⭐ {repo.stars:,} stars")
        print(f"   💻 Language: {repo.language}")
        print(f"   📝 {repo.description[:80]}...")
        if repo.topics:
            print(f"   🏷️  Topics: {', '.join(repo.topics)}")
        print()
    
    print("="*60)
    print("💡 Tip: Look for 'good first issue' or 'help wanted' labels!")
    print("="*60)


def main() -> None:
    """
    Main function to run the repository discovery.
    
    This is the entry point when running scout.py directly.
    """
    try:
        # Initialize the scout with GitHub authentication
        scout = GitHubScout()
        
        # Discover repositories
        recommendations = scout.discover_repos(max_results=5)
        
        # Display results
        print_recommendations(recommendations)
        
    except ValueError as e:
        print(f"❌ Configuration Error: {e}")
    except GithubException as e:
        print(f"❌ GitHub API Error: {e}")


# This runs only when the script is executed directly
# Not when imported as a module
if __name__ == "__main__":
    main()
