export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  updated_at: string;
}

export interface RepositoryAnalysis {
  languages: Record<string, number>;
  readme: string;
  skills: string[];
  score: number;
  scoreReasons: string[];
  linkedInPost: string;
}
