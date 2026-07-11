import { expect, test } from '@playwright/test';

const repos = [
  {
    id: 1,
    name: 'portfolio-forge',
    full_name: 'hendrik/portfolio-forge',
    description: 'Generates portfolio content from GitHub repositories.',
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
    description: 'Should not be visible because it is a fork.',
    html_url: 'https://github.com/hendrik/old-fork',
    language: 'JavaScript',
    stargazers_count: 0,
    forks_count: 0,
    fork: true,
    updated_at: '2026-06-01T12:00:00Z',
  },
];

test.beforeEach(async ({ page }) => {
  await page.route('https://api.github.com/users/demo/repos?sort=updated&per_page=24', async (route) => {
    await route.fulfill({ json: repos });
  });

  await page.route('https://api.github.com/repos/hendrik/portfolio-forge/languages', async (route) => {
    await route.fulfill({ json: { TypeScript: 12000, CSS: 3000 } });
  });

  await page.route('https://api.github.com/repos/hendrik/portfolio-forge/readme', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'Portfolio Forge is a React and TypeScript app with GitHub Actions, Playwright tests, setup guide, screenshots and architecture notes.',
    });
  });
});

test('loads repositories and generates a LinkedIn draft', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('username-input').fill('demo');
  await page.getByTestId('load-repos-button').click();

  await expect(page.getByTestId('repo-card-portfolio-forge')).toBeVisible();
  await expect(page.getByText('old-fork')).not.toBeVisible();

  await page.getByTestId('repo-card-portfolio-forge').click();

  await expect(page.getByTestId('analysis-card')).toBeVisible();
  await expect(page.getByTestId('post-preview')).toContainText('portfolio-forge');
  await expect(page.getByTestId('post-preview')).toContainText('TypeScript');
});

test('shows a useful validation message for an empty username', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('load-repos-button').click();

  await expect(page.getByTestId('error-alert')).toContainText('Bitte gib einen GitHub-Username ein.');
});
