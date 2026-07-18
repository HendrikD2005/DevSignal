import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { fetchLanguages, fetchReadme, fetchRepositories } from './github';
import type { GitHubRepository } from './types';

const repos: GitHubRepository[] = [
  {
    id: 1,
    name: 'portfolio-forge',
    full_name: 'hendrik/portfolio-forge',
    description: 'Portfolio generator',
    html_url: 'https://github.com/hendrik/portfolio-forge',
    language: 'TypeScript',
    stargazers_count: 4,
    forks_count: 1,
    fork: false,
    updated_at: '2026-07-01T12:00:00Z',
  },
  {
    id: 2,
    name: 'old-fork',
    full_name: 'hendrik/old-fork',
    description: null,
    html_url: 'https://github.com/hendrik/old-fork',
    language: 'JavaScript',
    stargazers_count: 0,
    forks_count: 0,
    fork: true,
    updated_at: '2026-06-01T12:00:00Z',
  },
];

const fetchMock = vi.fn();

function response(overrides: Partial<Response> = {}): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
    ...overrides,
  } as Response;
}

describe('GitHub API client', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('fetchRepositories encodes usernames and filters forks', async () => {
    fetchMock.mockResolvedValueOnce(response({ json: async () => repos }));

    await expect(fetchRepositories('demo user')).resolves.toEqual([repos[0]]);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/users/demo%20user/repos?sort=updated&per_page=24',
      { headers: { Accept: 'application/vnd.github+json' } },
    );
  });

  test('fetchRepositories surfaces API failures', async () => {
    fetchMock.mockResolvedValueOnce(response({ ok: false, status: 403 }));

    await expect(fetchRepositories('demo')).rejects.toThrow('GitHub request failed: 403');
  });

  test('fetchLanguages returns language byte counts', async () => {
    fetchMock.mockResolvedValueOnce(response({ json: async () => ({ TypeScript: 12000, CSS: 3000 }) }));

    await expect(fetchLanguages('hendrik/portfolio-forge')).resolves.toEqual({ TypeScript: 12000, CSS: 3000 });
  });

  test('fetchReadme returns raw README text', async () => {
    fetchMock.mockResolvedValueOnce(response({ text: async () => 'README body' }));

    await expect(fetchReadme('hendrik/portfolio-forge')).resolves.toBe('README body');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/hendrik/portfolio-forge/readme',
      { headers: { Accept: 'application/vnd.github.raw' } },
    );
  });

  test('fetchReadme treats missing README files as empty content', async () => {
    fetchMock.mockResolvedValueOnce(response({ ok: false, status: 404 }));

    await expect(fetchReadme('hendrik/no-readme')).resolves.toBe('');
  });

  test('fetchReadme surfaces non-404 API failures', async () => {
    fetchMock.mockResolvedValueOnce(response({ ok: false, status: 500 }));

    await expect(fetchReadme('hendrik/broken')).rejects.toThrow('README request failed: 500');
  });
});
