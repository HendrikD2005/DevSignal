import type { GitHubRepository, RepositoryAnalysis } from './types';
import { createTranslator, type Locale } from './i18n';

const SKILL_KEYWORDS: Record<string, string[]> = {
  Java: ['java', 'spring', 'spring boot', 'maven', 'gradle'],
  TypeScript: ['typescript', 'tsx', 'vite', 'next.js', 'react', 'node'],
  React: ['react', 'jsx', 'tsx', 'component'],
  'Spring Boot': ['spring boot', 'spring cloud', 'spring security'],
  Azure: ['azure', 'function app', 'key vault', 'blob storage'],
  Docker: ['docker', 'dockerfile', 'container'],
  'CI/CD': ['github actions', 'pipeline', 'ci/cd', 'workflow'],
  PostgreSQL: ['postgres', 'postgresql', 'sql'],
  Testing: ['test', 'playwright', 'junit', 'vitest', 'jest'],
  Architecture: ['architecture', 'system design', 'microservice', 'event sourcing'],
};

export function detectSkills(repo: GitHubRepository, readme: string, languages: Record<string, number>): string[] {
  const source = `${repo.name} ${repo.description ?? ''} ${readme}`.toLowerCase();
  const skills = new Set<string>();

  Object.keys(languages).forEach((language) => skills.add(language));

  for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
    if (keywords.some((keyword) => source.includes(keyword))) {
      skills.add(skill);
    }
  }

  return [...skills].slice(0, 10);
}

export function calculateScore(
  repo: GitHubRepository,
  readme: string,
  skills: string[],
  locale: Locale,
): { score: number; reasons: string[] } {
  let score = 35;
  const reasons: string[] = [];
  const t = createTranslator(locale);

  if (repo.description) {
    score += 12;
    reasons.push(t('analysis.reason.hasDescription'));
  }

  if (readme.length > 250) {
    score += 20;
    reasons.push(t('analysis.reason.readmeDetailed'));
  }

  if (skills.length >= 3) {
    score += 12;
    reasons.push(t('analysis.reason.skillsDetected'));
  }

  if (repo.stargazers_count > 0) {
    score += 8;
    reasons.push(t('analysis.reason.publicResonance'));
  }

  if (/demo|screenshot|preview|architecture|setup/i.test(readme)) {
    score += 13;
    reasons.push(t('analysis.reason.readmePresentation'));
  }

  return {
    score: Math.min(score, 100),
    reasons,
  };
}

export function generateLinkedInPost(repo: GitHubRepository, skills: string[], score: number, locale: Locale): string {
  const t = createTranslator(locale);
  const techStack = skills.length > 0 ? skills.join(', ') : repo.language ?? t('analysis.post.defaultTechStack');
  const description = repo.description ?? t('analysis.post.defaultDescription');

  return [
    t('analysis.post.line1', { repoName: repo.name }),
    '',
    t('analysis.post.line3', { description }),
    '',
    t('analysis.post.line5', { techStack }),
    '',
    t('analysis.post.line7'),
    '',
    t('analysis.post.line9', { score }),
    '',
    t('analysis.post.line11', { url: repo.html_url }),
  ].join('\n');
}

export function analyzeRepository(
  repo: GitHubRepository,
  readme: string,
  languages: Record<string, number>,
  locale: Locale,
): RepositoryAnalysis {
  const skills = detectSkills(repo, readme, languages);
  const { score, reasons } = calculateScore(repo, readme, skills, locale);

  return {
    languages,
    readme,
    skills,
    score,
    scoreReasons: reasons,
    linkedInPost: generateLinkedInPost(repo, skills, score, locale),
  };
}
