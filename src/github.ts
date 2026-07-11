import type { GitHubRepository } from './types';

const GITHUB_API = 'https://api.github.com';

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchRepositories(username: string): Promise<GitHubRepository[]> {
  const repos = await request<GitHubRepository[]>(
    `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=24`,
  );

  return repos.filter((repo) => !repo.fork);
}

export async function fetchLanguages(fullName: string): Promise<Record<string, number>> {
  return request<Record<string, number>>(`${GITHUB_API}/repos/${fullName}/languages`);
}

export async function fetchReadme(fullName: string): Promise<string> {
  const response = await fetch(`${GITHUB_API}/repos/${fullName}/readme`, {
    headers: {
      Accept: 'application/vnd.github.raw',
    },
  });

  if (response.status === 404) {
    return '';
  }

  if (!response.ok) {
    throw new Error(`README request failed: ${response.status}`);
  }

  return response.text();
}
