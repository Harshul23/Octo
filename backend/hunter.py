"""
Issue Hunter Module - Feature 2 of Octo 🐙

Finds good candidate GitHub issues to contribute to.

Criteria:
- Open issues
- No assignee
- Low discussion: comments < 3
- Excludes labels: wontfix, duplicate, invalid
- Excludes issues that are PRs or have linked PRs (best-effort)

Usage:
    export GITHUB_TOKEN=ghp_xxx
    python backend/hunter.py
"""

from __future__ import annotations

from typing import Any, Iterable, Optional
from dataclasses import dataclass
from github import Github, Auth
from github.Issue import Issue
from github.Repository import Repository
from github.GithubException import GithubException, RateLimitExceededException


# Default labels to exclude
DEFAULT_EXCLUDED_LABELS: set[str] = {"wontfix", "duplicate", "invalid"}


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


@dataclass(frozen=True)
class IssueDict:
    """Typed container for issue dictionaries (clean output format)."""
    title: str
    number: int
    repo_name: str
    url: str
    body: str
    labels: list[str]

    def to_dict(self) -> dict[str, Any]:
        """Convert to plain dictionary."""
        return {
            "title": self.title,
            "number": self.number,
            "repo_name": self.repo_name,
            "url": self.url,
            "body": self.body,
            "labels": self.labels,
        }


class IssueHunter:
    """
    Hunts for unclaimed GitHub issues that are good candidates for contribution.
    
    Uses PyGitHub to fetch and filter issues based on strict criteria:
    - Issue must be open
    - Issue must have no assignee
    - Issue must have low comment count (< 3 by default)
    - Issue must not have excluded labels (wontfix, duplicate, invalid)
    - Issue must have no linked Pull Requests
    
    Attributes:
        github: Authenticated PyGitHub instance
        max_comments: Maximum number of comments for an issue to be considered
        excluded_labels: Set of label names to exclude (case-insensitive)
        
    Example:
        >>> hunter = IssueHunter(github_token="ghp_xxx")
        >>> candidates = hunter.hunt(["fastapi/fastapi", "tiangolo/typer"])
        >>> for c in candidates:
        ...     print(c["title"], c["url"])
    """
    
    def __init__(
        self,
        github_token: str,
        *,
        max_comments: int = 2,
        excluded_labels: Optional[Iterable[str]] = None,
        per_page: int = 50,
    ) -> None:
        """
        Initialize the IssueHunter with GitHub authentication.
        
        Args:
            github_token: GitHub personal access token for API authentication
            max_comments: Max allowed comments (default: 2, meaning < 3)
            excluded_labels: Additional labels to exclude (case-insensitive)
            per_page: Number of issues to fetch per API page (default: 50)
        """
        auth = Auth.Token(github_token)
        self.github: Github = Github(auth=auth, per_page=per_page)
        self.max_comments: int = max_comments
        self.per_page: int = per_page
        # Merge default excluded labels with any custom ones
        self.excluded_labels: set[str] = {
            *(label.lower() for label in (excluded_labels or [])),
            *DEFAULT_EXCLUDED_LABELS,
        }
    
    def _get_repository(self, repo_name: str) -> Optional[Repository]:
        """
        Fetch a repository by its full name.
        
        Args:
            repo_name: Full repository name in "owner/repo" format
            
        Returns:
            Repository object if found, None otherwise
        """
        try:
            return self.github.get_repo(repo_name)
        except GithubException as e:
            msg = getattr(e, "data", {}) or {}
            print(f"[ERROR] Failed to fetch repository '{repo_name}': {msg.get('message', str(e))}")
            return None
    
    def _fetch_open_issues(
        self,
        repo: Repository,
        labels: Optional[list[str]] = None
    ) -> list[Issue]:
        """
        Fetch all open issues from a repository (excluding PRs).
        
        GitHub API returns PRs in issues list; we filter them out.
        
        Args:
            repo: Repository object to fetch issues from
            labels: Optional list of label names to filter by
            
        Returns:
            List of open Issue objects (not PRs)
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
            msg = getattr(e, "data", {}) or {}
            print(f"[ERROR] Failed to fetch issues from '{repo.full_name}': {msg.get('message', str(e))}")
            return []
    
    def _has_no_assignee(self, issue: Issue) -> bool:
        """Check if an issue has no assignee."""
        return issue.assignee is None and len(issue.assignees) == 0
    
    def _has_low_comments(self, issue: Issue) -> bool:
        """Check if an issue has low comment count (< 3 by default)."""
        return issue.comments <= self.max_comments
    
    def _has_excluded_labels(self, issue: Issue) -> bool:
        """Check if an issue has any excluded labels (case-insensitive)."""
        label_names = {lbl.name.lower() for lbl in issue.labels}
        return any(name in self.excluded_labels for name in label_names)
    
    def _has_no_linked_prs(self, issue: Issue) -> bool:
        """
        Best-effort check via timeline to detect linked PRs.
        
        If rate-limited or error, conservatively assume there may be PRs.
        
        Args:
            issue: Issue object to check
            
        Returns:
            True if no PRs are linked to this issue, False otherwise
        """
        try:
            timeline = issue.get_timeline()
            
            for event in timeline:
                # Check for cross-referenced events (PRs linking to this issue)
                if event.event == "cross-referenced":
                    source = getattr(event, "source", None)
                    if source and hasattr(source, "issue"):
                        source_issue = source.issue
                        if source_issue and source_issue.pull_request is not None:
                            return False
                
                # Check for connected events (PRs explicitly linked via keywords)
                elif event.event == "connected":
                    return False
                    
            return True
            
        except RateLimitExceededException:
            print(f"[WARN] Rate limit hit while checking timeline for issue #{issue.number}")
            return False
        except GithubException as e:
            print(f"[WARN] Failed to fetch timeline for issue #{issue.number}: {e}")
            return False
    
    def _is_unclaimed(self, issue: Issue, check_timeline: bool = True) -> bool:
        """
        Apply all filters to determine if an issue is unclaimed.
        
        An issue is considered unclaimed if:
        1. It has no assignee
        2. It has a low comment count (< 3)
        3. It does NOT have excluded labels (wontfix, duplicate, invalid)
        4. It has no linked Pull Requests (if check_timeline is True)
        
        Args:
            issue: Issue object to evaluate
            check_timeline: Whether to check for linked PRs (default: True)
            
        Returns:
            True if issue passes all filters, False otherwise
        """
        # Quick filters first (no API calls)
        if not self._has_no_assignee(issue):
            return False
        
        if not self._has_low_comments(issue):
            return False
        
        if self._has_excluded_labels(issue):
            return False
        
        # Expensive filter last (requires API call)
        if check_timeline and not self._has_no_linked_prs(issue):
            return False
        
        return True
    
    def _create_candidate(self, issue: Issue, repo_name: str) -> IssueCandidate:
        """Create an IssueCandidate dataclass from an Issue."""
        return IssueCandidate(
            issue=issue,
            repo_name=repo_name,
            title=issue.title,
            url=issue.html_url,
            labels=[label.name for label in issue.labels],
            comments_count=issue.comments,
            created_at=issue.created_at.isoformat()
        )
    
    def _to_issue_dict(self, issue: Issue, repo_name: str) -> IssueDict:
        """Create a clean IssueDict from an Issue."""
        return IssueDict(
            title=issue.title,
            number=issue.number,
            repo_name=repo_name,
            url=issue.html_url,
            body=issue.body or "",
            labels=[lbl.name for lbl in issue.labels],
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
            max_issues: Maximum number of issues to process (default: 100)
            check_timeline: Whether to check for linked PRs (default: True)
            
        Returns:
            List of IssueCandidate objects that passed all filters
        """
        candidates: list[IssueCandidate] = []
        
        repo = self._get_repository(repo_name)
        if repo is None:
            return candidates
        
        print(f"[INFO] Hunting issues in '{repo_name}'...")
        
        issues = self._fetch_open_issues(repo, labels)
        
        processed = 0
        for issue in issues:
            if processed >= max_issues:
                break
            
            processed += 1
            
            if self._is_unclaimed(issue, check_timeline):
                candidate = self._create_candidate(issue, repo_name)
                candidates.append(candidate)
                print(f"  [FOUND] #{issue.number}: {issue.title[:60]}...")
        
        print(f"[INFO] Found {len(candidates)} unclaimed issues in '{repo_name}' (processed {processed})")
        return candidates
    
    def hunt_repo(
        self,
        repo_name: str,
        *,
        max_issues: int = 100,
        check_timeline: bool = True,
    ) -> list[dict[str, Any]]:
        """
        Hunt candidate issues in a single repository (returns clean dicts).
        
        Args:
            repo_name: "owner/repo" string.
            max_issues: Max issues to process.
            check_timeline: Exclude issues with linked PRs if True.
            
        Returns:
            List of issue dictionaries with: title, number, repo_name, url, body, labels
        """
        repo = self._get_repository(repo_name)
        if repo is None:
            return []
        
        print(f"[INFO] Hunting issues in '{repo_name}'...")
        issues = self._fetch_open_issues(repo)
        
        results: list[dict[str, Any]] = []
        processed = 0
        
        for issue in issues:
            if processed >= max_issues:
                break
            processed += 1
            
            if self._is_unclaimed(issue, check_timeline):
                results.append(self._to_issue_dict(issue, repo_name).to_dict())
        
        print(f"[INFO] Found {len(results)} candidates in '{repo_name}' (processed {processed})")
        return results
    
    def get_candidate_issues(
        self,
        repo_names: str | list[str],
        labels: Optional[list[str]] = None,
        max_issues_per_repo: int = 100,
        check_timeline: bool = True
    ) -> list[IssueCandidate]:
        """
        Get candidate issues from one or more repositories (IssueCandidate format).
        
        Args:
            repo_names: Single repo name or list of repo names in "owner/repo" format
            labels: Optional list of label names to filter by
            max_issues_per_repo: Maximum issues to process per repository
            check_timeline: Whether to check for linked PRs
            
        Returns:
            List of IssueCandidate objects from all repositories
        """
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
    
    def hunt(
        self,
        repo_names: Iterable[str],
        *,
        max_issues_per_repo: int = 100,
        check_timeline: bool = True,
    ) -> list[dict[str, Any]]:
        """
        Hunt candidate issues across multiple repositories (returns clean dicts).
        
        This is the main entry point that returns clean dictionaries.
        
        Args:
            repo_names: Iterable of "owner/repo" strings.
            max_issues_per_repo: Max issues per repository.
            check_timeline: Exclude issues with linked PRs if True.
            
        Returns:
            List of issue dictionaries with: title, number, repo_name, url, body, labels
        """
        all_results: list[dict[str, Any]] = []
        repo_list = list(repo_names)
        
        for repo_name in repo_list:
            try:
                all_results.extend(
                    self.hunt_repo(
                        repo_name=repo_name,
                        max_issues=max_issues_per_repo,
                        check_timeline=check_timeline,
                    )
                )
            except Exception as e:
                print(f"[ERROR] Unexpected error for '{repo_name}': {e}")
                continue
        
        print(f"[SUMMARY] Total candidates: {len(all_results)} across {len(repo_list)} repos")
        return all_results
    
    def close(self) -> None:
        """Close the GitHub connection and cleanup resources."""
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
    max_comments: int = 2,
    max_issues_per_repo: int = 100,
    check_timeline: bool = True
) -> list[IssueCandidate]:
    """
    Convenience function to find unclaimed issues.
    
    Args:
        github_token: GitHub personal access token
        repo_names: Single repo or list of repos in "owner/repo" format
        labels: Optional label filter (e.g., ["good first issue"])
        max_comments: Maximum comments threshold (default: 2, meaning < 3)
        max_issues_per_repo: Max issues to process per repo
        check_timeline: Check for linked PRs
        
    Returns:
        List of IssueCandidate objects
    """
    with IssueHunter(github_token, max_comments=max_comments) as hunter:
        return hunter.get_candidate_issues(
            repo_names=repo_names,
            labels=labels,
            max_issues_per_repo=max_issues_per_repo,
            check_timeline=check_timeline
        )


if __name__ == "__main__":
    import os
    
    # Get token from environment
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("Please set GITHUB_TOKEN environment variable")
        raise SystemExit(1)
    
    # Create hunter instance
    hunter = IssueHunter(github_token=token)
    
    # Test with popular open source repos
    repos = ["fastapi/fastapi", "tiangolo/typer"]
    candidates = hunter.hunt(repos, max_issues_per_repo=50, check_timeline=True)
    
    print("\n" + "=" * 60)
    print(f"CANDIDATE ISSUES ({len(candidates)} total)")
    print("=" * 60)
    
    for c in candidates[:20]:  # Show first 20
        print(f"\n[{c['repo_name']}] #{c['number']} - {c['title']}")
        print(f"  URL: {c['url']}")
        print(f"  Labels: {', '.join(c['labels']) if c['labels'] else 'None'}")
        if c['body']:
            # Show first 150 chars of body
            body_preview = c['body'][:150].replace('\n', ' ')
            print(f"  Body: {body_preview}...")
    
    hunter.close()
