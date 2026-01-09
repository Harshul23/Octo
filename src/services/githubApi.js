// GitHub API service functions

const GITHUB_API_BASE = 'https://api.github.com';

// Helper function to make authenticated requests
const fetchWithAuth = async (url, token, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
};

// Fetch user profile
export const fetchUserProfile = async (token) => {
  return fetchWithAuth(`${GITHUB_API_BASE}/user`, token);
};

// Fetch user's recent events/activity
export const fetchUserEvents = async (username, token, perPage = 30) => {
  return fetchWithAuth(
    `${GITHUB_API_BASE}/users/${username}/events?per_page=${perPage}`,
    token
  );
};

// Fetch user's repositories
export const fetchUserRepositories = async (username, token, perPage = 100) => {
  return fetchWithAuth(
    `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=${perPage}`,
    token
  );
};

// Fetch user's contribution data (requires GraphQL)
export const fetchContributionData = async (username, token, fromDate, toDate) => {
  const query = `
    query($userName:String!, $from:DateTime!, $to:DateTime!, $prQuery:String!, $issueQuery:String!) {
      user(login: $userName){
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
      prs: search(query: $prQuery, type: ISSUE, first: 0) {
        issueCount
      }
      issues: search(query: $issueQuery, type: ISSUE, first: 0) {
        issueCount
      }
    }
  `;

  // Format dates for search query (YYYY-MM-DD)
  const fromStr = new Date(fromDate).toISOString().split('T')[0];
  const toStr = new Date(toDate).toISOString().split('T')[0];

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        userName: username,
        from: fromDate,
        to: toDate,
        prQuery: `author:${username} type:pr is:merged created:${fromStr}..${toStr}`,
        issueQuery: `author:${username} type:issue is:closed created:${fromStr}..${toStr}`
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch contribution data');
  }

  const data = await response.json();
  
  if (data.errors) {
    console.error('GraphQL Errors:', data.errors);
    // Fallback if search fails? Or just throw.
    throw new Error(data.errors[0].message);
  }

  return {
    calendar: data.data.user.contributionsCollection.contributionCalendar,
    stats: {
      prsMerged: data.data.prs.issueCount,
      issuesSolved: data.data.issues.issueCount,
      totalContributions: data.data.user.contributionsCollection.contributionCalendar.totalContributions
    }
  };
};

// Parse events into categorized activity
export const parseUserActivity = (events) => {
  const activity = {
    commits: [],
    pullRequests: [],
    issues: [],
    repositories: [],
    comments: [],
  };

  events.forEach((event) => {
    switch (event.type) {
      case 'PushEvent':
        activity.commits.push({
          repo: event.repo.name,
          count: event.payload.commits?.length || 0,
          date: event.created_at,
          commits: event.payload.commits,
        });
        break;

      case 'PullRequestEvent':
        activity.pullRequests.push({
          repo: event.repo.name,
          action: event.payload.action,
          number: event.payload.pull_request.number,
          title: event.payload.pull_request.title,
          url: event.payload.pull_request.html_url,
          date: event.created_at,
        });
        break;

      case 'IssuesEvent':
        activity.issues.push({
          repo: event.repo.name,
          action: event.payload.action,
          number: event.payload.issue.number,
          title: event.payload.issue.title,
          url: event.payload.issue.html_url,
          date: event.created_at,
        });
        break;

      case 'CreateEvent':
        if (event.payload.ref_type === 'repository') {
          activity.repositories.push({
            name: event.repo.name,
            date: event.created_at,
          });
        }
        break;

      case 'IssueCommentEvent':
      case 'PullRequestReviewCommentEvent':
        activity.comments.push({
          repo: event.repo.name,
          date: event.created_at,
          body: event.payload.comment?.body,
        });
        break;

      default:
        break;
    }
  });

  return activity;
};

// Aggregate commits by repository
export const aggregateCommitsByRepo = (commits) => {
  const repoMap = {};

  commits.forEach((commit) => {
    if (!repoMap[commit.repo]) {
      repoMap[commit.repo] = 0;
    }
    repoMap[commit.repo] += commit.count;
  });

  return Object.entries(repoMap)
    .map(([repo, count]) => ({ repo, count }))
    .sort((a, b) => b.count - a.count);
};

// Get contribution level color (GitHub style)
export const getContributionColor = (count) => {
  if (count === 0) return '#161b22';
  if (count < 3) return '#0e4429';
  if (count < 6) return '#006d32';
  if (count < 9) return '#26a641';
  return '#39d353';
};

// Get contribution intensity (0-4)
export const getContributionLevel = (count) => {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 9) return 3;
  return 4;
};

// Fetch repository commit statistics for a user
export const fetchRepositoryCommitStats = async (username, token, repos, since) => {
  const commitStats = [];
  
  // Fetch commit counts for each repository
  for (const repo of repos.slice(0, 10)) { // Limit to top 10 repos to avoid rate limiting
    try {
      const repoName = repo.full_name || repo.name;
      const commits = await fetchWithAuth(
        `${GITHUB_API_BASE}/repos/${repoName}/commits?author=${username}&since=${since}&per_page=100`,
        token
      );
      
      if (commits.length > 0) {
        commitStats.push({
          repo: repoName,
          count: commits.length,
        });
      }
    } catch (err) {
      console.error(`Error fetching commits for ${repo.name}:`, err);
    }
  }
  
  return commitStats.sort((a, b) => b.count - a.count);
};
