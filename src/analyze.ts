import type { GitHubRepository, RepositoryAnalysis } from './types';

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

export function calculateScore(repo: GitHubRepository, readme: string, skills: string[]): { score: number; reasons: string[] } {
  let score = 35;
  const reasons: string[] = [];

  if (repo.description) {
    score += 12;
    reasons.push('Repository hat eine Beschreibung.');
  }

  if (readme.length > 250) {
    score += 20;
    reasons.push('README wirkt aussagekräftig.');
  }

  if (skills.length >= 3) {
    score += 12;
    reasons.push('Mehrere relevante Skills erkannt.');
  }

  if (repo.stargazers_count > 0) {
    score += 8;
    reasons.push('Repository hat öffentliche Resonanz.');
  }

  if (/demo|screenshot|preview|architecture|setup/i.test(readme)) {
    score += 13;
    reasons.push('README enthält präsentationsnahe Inhalte.');
  }

  return {
    score: Math.min(score, 100),
    reasons,
  };
}

export function generateLinkedInPost(repo: GitHubRepository, skills: string[], score: number): string {
  const techStack = skills.length > 0 ? skills.join(', ') : repo.language ?? 'moderne Web-Technologien';
  const description = repo.description ?? 'ein eigenes Softwareprojekt zur Verbesserung meines Entwicklerportfolios';

  return [
    `Ich habe mein Projekt „${repo.name}” weiter ausgearbeitet.`,
    '',
    `Dabei geht es um ${description}.`,
    '',
    `Technisch spannend daran: ${techStack}.`,
    '',
    `Für mein Portfolio ist das Projekt besonders wertvoll, weil es nicht nur Code zeigt, sondern auch Produktdenken, technische Umsetzung und klare Dokumentation verbindet.`,
    '',
    `Portfolio-Score: ${score}/100`,
    '',
    `GitHub: ${repo.html_url}`,
  ].join('\n');
}

export function analyzeRepository(
  repo: GitHubRepository,
  readme: string,
  languages: Record<string, number>,
): RepositoryAnalysis {
  const skills = detectSkills(repo, readme, languages);
  const { score, reasons } = calculateScore(repo, readme, skills);

  return {
    languages,
    readme,
    skills,
    score,
    scoreReasons: reasons,
    linkedInPost: generateLinkedInPost(repo, skills, score),
  };
}
