"""
Issue Hunter Module - Step 2 of Octo Project

This module provides functionality to find "unclaimed" GitHub issues
that are good candidates for contribution.
"""

from typing import Optional
from dataclasses import dataclass
from github import Github, Auth
from github.Issue import Issue
from github.Repository import Repository
from github.GithubException import GithubException, RateLimitExceededException


@dataclass
class IssueCandidate:
    """Represents a filtered issue candidate for contribution."""
    
    issue: Issue
    repo_name: str
    title: str
    url: str
    labels: list[str]
    comments_count: int
    created_at: str
    
    def __repr__(self) -> str:
        return f"IssueCandidate(#{self.issue.number}: {self.title[:50]}...)"


class IssueHunter:
    """
    Hunts for unclaimed GitHub issues that are good candidates for contribution.
    
    Uses PyGitHub to fetch and filter issues based on strict criteria:
    - Issue must be open
    - Issue must have no assignee
    - Issue must have low comment count (configurable)
    - Issue must have no linked Pull Requests
    
    Attributes:
        github: Authenticated PyGitHub instance
        max_comments: Maximum number of comments for an issue to be considered (default: 3)
        
    Example:
        >>> hunter = IssueHunter(github_token="ghp_xxx")
        >>> candidates = hunter.get_candidate_issues(["facebook/react", "vercel/next.js"])
        >>> for candidate in candidates:
        ...     print(candidate.title, candidate.url)
    """
    
    def __init__(
        self,
        github_token: str,
        max_comments: int = 3,
        per_page: int = 30
    ) -> None:
        """
        Initialize the IssueHunter with GitHub authentication.
        
        Args:
            github_token: GitHub personal access token for API authentication
            max_comments: Maximum number of comments allowed on an issue (default: 3)
            per_page: Number of issues to fetch per API page (default: 30)
            
        API Calls:
            - None during initialization
        """
        auth = Auth.Token(github_token)
        self.github: Github = Github(auth=auth, per_page=per_page)
        self.max_comments: int = max_comments
        self.per_page: int = per_page
    
    def _get_repository(self, repo_name: str) -> Optional[Repository]:
        """
        Fetch a repository by its full name.
        
        Args:
            repo_name: Full repository name in "owner/repo" format
            
        Returns:
            Repository object if found, None otherwise
            
        API Calls:
            - GET /repos/{owner}/{repo}
        """
        try:
            return self.github.get_repo(repo_name)
        except GithubException as e:
            print(f"[ERROR] Failed to fetch repository '{repo_name}': {e.data.get('message', str(e))}")
            return None
    
    def _fetch_open_issues(
        self,
        repo: Repository,
        labels: Optional[list[str]] = None
    ) -> list[Issue]:
        """
        Fetch all open issues from a repository.
        
        Args:
            repo: Repository object to fetch issues from
            labels: Optional list of label names to filter by (e.g., ["good first issue"])
            
        Returns:
            List of open Issue objects
            
        API Calls:
            - GET /repos/{owner}/{repo}/issues?state=open
        """
        try:
            if labels:
                issues = repo.get_issues(state="open", labels=labels)
            else:
                issues = repo.get_issues(state="open")
            
            # Filter out pull requests (GitHub API returns PRs as issues)
            return [issue for issue in issues if issue.pull_request is None]
        except RateLimitExceededException:
            print(f"[ERROR] GitHub API rate limit exceeded while fetching issues from '{repo.full_name}'")
            return []
        except GithubException as e:
            print(f"[ERROR] Failed to fetch issues from '{repo.full_name}': {e.data.get('message', str(e))}")
            return []
    
    def _has_no_assignee(self, issue: Issue) -> bool:
        """
        Check if an issue has no assignee.
        
        Args:
            issue: Issue object to check
            
        Returns:
            True if issue has no assignee, False otherwise
            
        API Calls:
            - None (uses cached issue data)
        """
        return issue.assignee is None and len(issue.assignees) == 0
    
    def _has_low_comments(self, issue: Issue) -> bool:
        """
        Check if an issue has a low comment count.
        
        Args:
            issue: Issue object to check
            
        Returns:
            True if comment count is below max_comments threshold
            
        API Calls:
            - None (uses cached issue data)
        """
        return issue.comments < self.max_comments
    
    def _has_no_linked_prs(self, issue: Issue) -> bool:
        """
        Check if an issue has no linked Pull Requests by examining its timeline.
        
        This is an advanced check that looks at the issue's timeline events
        to detect if any PRs have been opened that reference this issue.
        
        Args:
            issue: Issue object to check
            
        Returns:
            True if no PRs are linked to this issue, False otherwise
            
        API Calls:
            - GET /repos/{owner}/{repo}/issues/{issue_number}/timeline
        """
        try:
            timeline = issue.get_timeline()
            
            for event in timeline:
                # Check for cross-referenced events (PRs linking to this issue)
                if event.event == "cross-referenced":
                    source = event.source
                    if source and hasattr(source, "issue"):
                        # Check if the source is a pull request
                        source_issue = source.issue
                        if source_issue and source_issue.pull_request is not None:
                            return False
                
                # Check for connected events (PRs explicitly linked via keywords)
                elif event.event == "connected":
                    return False
                
                # Check for referenced events from commits in PRs
                elif event.event == "referenced":
                    # This could be from a commit, which might be in a PR
                    # We'll be conservative and still allow these
                    pass
                    
            return True
            
        except RateLimitExceededException:
            print(f"[WARN] Rate limit hit while checking timeline for issue #{issue.number}")
            # Be conservative - assume there might be linked PRs
            return False
        except GithubException as e:
            print(f"[WARN] Failed to fetch timeline for issue #{issue.number}: {e}")
            # Be conservative - assume there might be linked PRs
            return False
    
    def _is_unclaimed(self, issue: Issue, check_timeline: bool = True) -> bool:
        """
        Apply all filters to determine if an issue is unclaimed.
        
        An issue is considered unclaimed if:
        1. It has no assignee
        2. It has a low comment count (< max_comments)
        3. It has no linked Pull Requests (if check_timeline is True)
        
        Args:
            issue: Issue object to evaluate
            check_timeline: Whether to check for linked PRs (default: True)
                           Set to False to save API calls
            
        Returns:
            True if issue passes all filters, False otherwise
            
        API Calls:
            - GET /repos/{owner}/{repo}/issues/{issue_number}/timeline (if check_timeline)
        """
        # Quick filters first (no API calls)
        if not self._has_no_assignee(issue):
            return False
        
        if not self._has_low_comments(issue):
            return False
        
        # Expensive filter last (requires API call)
        if check_timeline and not self._has_no_linked_prs(issue):
            return False
        
        return True
    
    def _create_candidate(self, issue: Issue, repo_name: str) -> IssueCandidate:
        """
        Create an IssueCandidate dataclass from an Issue.
        
        Args:
            issue: Issue object to convert
            repo_name: Full repository name
            
        Returns:
            IssueCandidate with extracted metadata
        """
        return IssueCandidate(
            issue=issue,
            repo_name=repo_name,
            title=issue.title,
            url=issue.html_url,
            labels=[label.name for label in issue.labels],
            comments_count=issue.comments,
            created_at=issue.created_at.isoformat()
        )
    
    def hunt_issues(
        self,
        repo_name: str,
        labels: Optional[list[str]] = None,
        max_issues: int = 100,
        check_timeline: bool = True
    ) -> list[IssueCandidate]:
        """
        Hunt for unclaimed issues in a single repository.
        
        Args:
            repo_name: Full repository name in "owner/repo" format
            labels: Optional list of label names to filter by
                   Common values: ["good first issue", "help wanted", "beginner"]
            max_issues: Maximum number of issues to process (default: 100)
            check_timeline: Whether to check for linked PRs (default: True)
            
        Returns:
            List of IssueCandidate objects that passed all filters
            
        API Calls:
            - GET /repos/{owner}/{repo}
            - GET /repos/{owner}/{repo}/issues?state=open
            - GET /repos/{owner}/{repo}/issues/{issue_number}/timeline (per issue, if check_timeline)
            
        Example:
            >>> candidates = hunter.hunt_issues(
            ...     "facebook/react",
            ...     labels=["good first issue"],
            ...     max_issues=50
            ... )
        """
        candidates: list[IssueCandidate] = []
        
        # Fetch repository
        repo = self._get_repository(repo_name)
        if repo is None:
            return candidates
        
        print(f"[INFO] Hunting issues in '{repo_name}'...")
        
        # Fetch open issues
        issues = self._fetch_open_issues(repo, labels)
        
        # Process issues up to max_issues
        processed = 0
        for issue in issues:
            if processed >= max_issues:
                break
            
            processed += 1
            
            # Apply filters
            if self._is_unclaimed(issue, check_timeline):
                candidate = self._create_candidate(issue, repo_name)
                candidates.append(candidate)
                print(f"  [FOUND] #{issue.number}: {issue.title[:60]}...")
        
        print(f"[INFO] Found {len(candidates)} unclaimed issues in '{repo_name}' (processed {processed})")
        return candidates
    
    def get_candidate_issues(
        self,
        repo_names: str | list[str],
        labels: Optional[list[str]] = None,
        max_issues_per_repo: int = 100,
        check_timeline: bool = True
    ) -> list[IssueCandidate]:
        """
        Get candidate issues from one or more repositories.
        
        This is the main entry point for finding unclaimed issues across
        multiple repositories.
        
        Args:
            repo_names: Single repo name or list of repo names in "owner/repo" format
            labels: Optional list of label names to filter by
            max_issues_per_repo: Maximum issues to process per repository (default: 100)
            check_timeline: Whether to check for linked PRs (default: True)
            
        Returns:
            List of IssueCandidate objects from all repositories
            
        API Calls:
            - Per repository: see hunt_issues()
            
        Example:
            >>> candidates = hunter.get_candidate_issues(
            ...     ["facebook/react", "vercel/next.js", "microsoft/vscode"],
            ...     labels=["good first issue", "help wanted"]
            ... )
            >>> print(f"Found {len(candidates)} total candidates")
        """
        # Normalize input to list
        if isinstance(repo_names, str):
            repo_names = [repo_names]
        
        all_candidates: list[IssueCandidate] = []
        
        for repo_name in repo_names:
            try:
                candidates = self.hunt_issues(
                    repo_name=repo_name,
                    labels=labels,
                    max_issues=max_issues_per_repo,
                    check_timeline=check_timeline
                )
                all_candidates.extend(candidates)
            except Exception as e:
                print(f"[ERROR] Unexpected error processing '{repo_name}': {e}")
                continue
        
        print(f"\n[SUMMARY] Total candidates found: {len(all_candidates)} across {len(repo_names)} repositories")
        return all_candidates
    
    def close(self) -> None:
        """
        Close the GitHub connection and cleanup resources.
        
        Should be called when done using the IssueHunter.
        
        API Calls:
            - None
        """
        self.github.close()
    
    def __enter__(self) -> "IssueHunter":
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        """Context manager exit - ensures connection is closed."""
        self.close()


# Convenience function for quick usage
def find_unclaimed_issues(
    github_token: str,
    repo_names: str | list[str],
    labels: Optional[list[str]] = None,
    max_comments: int = 3,
    max_issues_per_repo: int = 100,
    check_timeline: bool = True
) -> list[IssueCandidate]:
    """
    Convenience function to find unclaimed issues.
    
    Args:
        github_token: GitHub personal access token
        repo_names: Single repo or list of repos in "owner/repo" format
        labels: Optional label filter (e.g., ["good first issue"])
        max_comments: Maximum comments threshold (default: 3)
        max_issues_per_repo: Max issues to process per repo (default: 100)
        check_timeline: Check for linked PRs (default: True)
        
    Returns:
        List of IssueCandidate objects
        
    Example:
        >>> issues = find_unclaimed_issues(
        ...     github_token="ghp_xxx",
        ...     repo_names="facebook/react",
        ...     labels=["good first issue"]
        ... )
    """
    with IssueHunter(github_token, max_comments) as hunter:
        return hunter.get_candidate_issues(
            repo_names=repo_names,
            labels=labels,
            max_issues_per_repo=max_issues_per_repo,
            check_timeline=check_timeline
        )


if __name__ == "__main__":
    import os
    
    # Example usage
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("Please set GITHUB_TOKEN environment variable")
        exit(1)
    
    # Find good first issues in popular repos
    candidates = find_unclaimed_issues(
        github_token=token,
        repo_names=["microsoft/vscode", "facebook/react"],
        labels=["good first issue"],
        max_issues_per_repo=20
    )
    
    print("\n" + "=" * 60)
    print("UNCLAIMED ISSUES READY FOR CONTRIBUTION:")
    print("=" * 60)
    
    for candidate in candidates:
        print(f"\n[{candidate.repo_name}] #{candidate.issue.number}")
        print(f"  Title: {candidate.title}")
        print(f"  Labels: {', '.join(candidate.labels)}")
        print(f"  Comments: {candidate.comments_count}")
        print(f"  URL: {candidate.url}")
