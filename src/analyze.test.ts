import { describe, expect, test } from 'vitest';
import { analyzeRepository, calculateScore, detectSkills, generateLinkedInPost } from './analyze';
import type { GitHubRepository } from './types';

function repo(overrides: Partial<GitHubRepository> = {}): GitHubRepository {
  return {
    id: 1,
    name: 'portfolio-forge',
    full_name: 'hendrik/portfolio-forge',
    description: 'React portfolio generator with Docker and GitHub Actions workflow.',
    html_url: 'https://github.com/hendrik/portfolio-forge',
    language: 'TypeScript',
    stargazers_count: 4,
    forks_count: 1,
    fork: false,
    updated_at: '2026-07-01T12:00:00Z',
    ...overrides,
  };
}

describe('detectSkills', () => {
  test('combines GitHub language data and keyword matches', () => {
    const skills = detectSkills(
      repo(),
      'Setup guide with Playwright tests, screenshots, Dockerfile and architecture notes.',
      { TypeScript: 12000, CSS: 3000 },
    );

    expect(skills).toEqual(
      expect.arrayContaining(['TypeScript', 'CSS', 'React', 'Docker', 'CI/CD', 'Testing', 'Architecture']),
    );
  });

  test('limits the result to ten skills', () => {
    const skills = detectSkills(
      repo({ description: 'Java Spring Boot Azure Docker PostgreSQL CI/CD testing architecture React TypeScript' }),
      'node vite next.js component microservice event sourcing setup preview',
      {
        TypeScript: 1,
        CSS: 1,
        HTML: 1,
        Shell: 1,
        Java: 1,
        SQL: 1,
      },
    );

    expect(skills).toHaveLength(10);
  });
});

describe('calculateScore', () => {
  test('rewards a documented and presentable repository', () => {
    const readme = 'setup demo screenshots architecture '.repeat(12);
    const result = calculateScore(repo(), readme, ['TypeScript', 'React', 'Testing']);

    expect(result.score).toBe(100);
    expect(result.reasons).toHaveLength(5);
  });

  test('keeps a sparse repository at the base score', () => {
    const result = calculateScore(
      repo({ description: null, stargazers_count: 0 }),
      'short readme',
      ['TypeScript'],
    );

    expect(result.score).toBe(35);
    expect(result.reasons).toEqual([]);
  });
});

describe('generateLinkedInPost', () => {
  test('uses detected skills when they are available', () => {
    const post = generateLinkedInPost(repo(), ['TypeScript', 'React'], 87);

    expect(post).toContain('portfolio-forge');
    expect(post).toContain('TypeScript, React');
    expect(post).toContain('Portfolio-Score: 87/100');
  });

  test('falls back to generic text when metadata is missing', () => {
    const post = generateLinkedInPost(repo({ description: null, language: null }), [], 42);

    expect(post).toContain('moderne Web-Technologien');
    expect(post).toContain('ein eigenes Softwareprojekt');
  });
});

describe('analyzeRepository', () => {
  test('returns a complete repository analysis', () => {
    const readme = 'GitHub Actions and Playwright setup with architecture screenshots. '.repeat(6);
    const analysis = analyzeRepository(repo(), readme, { TypeScript: 100, CSS: 20 });

    expect(analysis.languages).toEqual({ TypeScript: 100, CSS: 20 });
    expect(analysis.readme).toBe(readme);
    expect(analysis.skills).toContain('Testing');
    expect(analysis.score).toBeGreaterThanOrEqual(80);
    expect(analysis.linkedInPost).toContain('GitHub: https://github.com/hendrik/portfolio-forge');
  });
});
