import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  Fade,
  Grid,
  LinearProgress,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GitHubIcon from '@mui/icons-material/GitHub';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InsightsIcon from '@mui/icons-material/Insights';
import { theme } from './theme';
import { analyzeRepository } from './analyze';
import { fetchLanguages, fetchReadme, fetchRepositories } from './github';
import type { GitHubRepository, RepositoryAnalysis } from './types';
import './styles.css';

function RepoSkeletons() {
  return (
    <Stack spacing={1.5} data-testid="repo-skeletons">
      {[0, 1, 2].map((item) => (
        <Card key={item} variant="outlined">
          <CardContent>
            <Skeleton width="42%" height={26} />
            <Skeleton width="86%" />
            <Skeleton width="58%" />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

function AnalysisSkeleton() {
  return (
    <Card data-testid="analysis-skeleton">
      <CardContent>
        <Skeleton variant="rounded" width={84} height={84} />
        <Skeleton sx={{ mt: 2 }} width="65%" height={30} />
        <Skeleton width="88%" />
        <Skeleton width="92%" />
        <Skeleton width="70%" />
      </CardContent>
    </Card>
  );
}

function App() {
  const [username, setUsername] = useState('');
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [analysis, setAnalysis] = useState<RepositoryAnalysis | null>(null);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const visibleRepos = useMemo(() => repositories.slice(0, 12), [repositories]);

  async function loadRepos(event?: React.FormEvent) {
    event?.preventDefault();
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('Bitte gib einen GitHub-Username ein.');
      return;
    }

    setIsLoadingRepos(true);
    setError(null);
    setRepositories([]);
    setSelectedRepo(null);
    setAnalysis(null);

    try {
      const repos = await fetchRepositories(trimmedUsername);
      setRepositories(repos);

      if (repos.length === 0) {
        setError('Keine öffentlichen Non-Fork-Repositories gefunden.');
      }
    } catch {
      setError('Repositories konnten nicht geladen werden. Prüfe Username oder GitHub-Limit.');
    } finally {
      setIsLoadingRepos(false);
    }
  }

  async function selectRepo(repo: GitHubRepository) {
    setSelectedRepo(repo);
    setAnalysis(null);
    setIsAnalyzing(true);
    setError(null);

    try {
      const [languages, readme] = await Promise.all([fetchLanguages(repo.full_name), fetchReadme(repo.full_name)]);
      setAnalysis(analyzeRepository(repo, readme, languages));
    } catch {
      setError('Repository-Analyse konnte nicht geladen werden.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function copyPost() {
    if (!analysis) return;
    await navigator.clipboard.writeText(analysis.linkedInPost);
    setCopied(true);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e5e7eb' }}>
        <Toolbar sx={{ gap: 1.5 }}>
          <Box className="brand-mark">DS</Box>
          <Typography variant="h6" fontWeight={700}>DevSignal</Typography>
          <Chip size="small" label="Prototype" variant="outlined" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Box>
                <Chip icon={<AutoAwesomeIcon />} label="GitHub → LinkedIn" sx={{ mb: 2 }} />
                <Typography variant="h1" fontSize={{ xs: 40, md: 56 }} lineHeight={1.02}>
                  Portfolio-Texte aus deinen Repositories.
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2, fontSize: 17 }}>
                  DevSignal analysiert öffentliche GitHub-Repos und erstellt daraus Skills, Score und einen kopierbaren LinkedIn-Projektpost.
                </Typography>
              </Box>

              <Card>
                <CardContent>
                  <Box component="form" onSubmit={loadRepos}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <TextField
                        fullWidth
                        label="GitHub Username"
                        placeholder="z. B. HendrikD2005"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        inputProps={{ 'data-testid': 'username-input' }}
                      />
                      <Button
                        variant="contained"
                        size="large"
                        type="submit"
                        disabled={isLoadingRepos}
                        startIcon={isLoadingRepos ? <CircularProgress color="inherit" size={18} /> : <GitHubIcon />}
                        data-testid="load-repos-button"
                      >
                        Laden
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>

              {error && <Alert severity="warning" data-testid="error-alert">{error}</Alert>}

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">Repositories</Typography>
                  {repositories.length > 0 && <Chip size="small" label={`${repositories.length} gefunden`} />}
                </Stack>

                {isLoadingRepos ? (
                  <RepoSkeletons />
                ) : (
                  <Stack spacing={1.5} data-testid="repo-list">
                    {visibleRepos.map((repo) => {
                      const isActive = selectedRepo?.id === repo.id;

                      return (
                        <Card key={repo.id} className={isActive ? 'active-card' : ''}>
                          <CardActionArea onClick={() => selectRepo(repo)} data-testid={`repo-card-${repo.name}`}>
                            <CardContent>
                              <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Typography fontWeight={700}>{repo.name}</Typography>
                                <Chip size="small" label={repo.language ?? 'Mixed'} />
                              </Stack>
                              <Typography color="text.secondary" sx={{ mt: 0.8 }}>
                                {repo.description ?? 'Keine Beschreibung vorhanden.'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                ★ {repo.stargazers_count} · Forks {repo.forks_count}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              {isAnalyzing && <AnalysisSkeleton />}

              {!isAnalyzing && !analysis && (
                <Card className="empty-state">
                  <CardContent>
                    <InsightsIcon sx={{ fontSize: 42, color: 'text.secondary' }} />
                    <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>
                      Wähle ein Repository aus.
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Danach erscheinen Score, Skills und ein LinkedIn-Post-Entwurf.
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <Fade in={!!analysis} unmountOnExit>
                <Stack spacing={3}>
                  {analysis && selectedRepo && (
                    <>
                      <Card data-testid="analysis-card">
                        <CardContent>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
                            <Box className="score-ring">
                              <Typography variant="h4" fontWeight={800}>{analysis.score}</Typography>
                              <Typography variant="caption" color="text.secondary">/100</Typography>
                            </Box>
                            <Box flex={1}>
                              <Typography variant="h5" fontWeight={800}>{selectedRepo.name}</Typography>
                              <Typography color="text.secondary" sx={{ mt: 0.7 }}>{selectedRepo.description ?? 'Keine Beschreibung vorhanden.'}</Typography>
                              <LinearProgress variant="determinate" value={analysis.score} sx={{ mt: 2, height: 8, borderRadius: 999 }} />
                            </Box>
                          </Stack>

                          <Divider sx={{ my: 3 }} />

                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Erkannte Skills</Typography>
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {analysis.skills.map((skill) => <Chip key={skill} label={skill} />)}
                          </Stack>

                          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>Warum dieser Score?</Typography>
                          <Stack spacing={0.7}>
                            {analysis.scoreReasons.map((reason) => (
                              <Typography key={reason} variant="body2">• {reason}</Typography>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>

                      <Card data-testid="post-card">
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Box>
                              <Typography variant="h6" fontWeight={800}>LinkedIn-Entwurf</Typography>
                              <Typography color="text.secondary" variant="body2">Manuell prüfen, anpassen und posten.</Typography>
                            </Box>
                            <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyPost} data-testid="copy-post-button">
                              Kopieren
                            </Button>
                          </Stack>
                          <Box component="pre" className="post-preview" data-testid="post-preview">
                            {analysis.linkedInPost}
                          </Box>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </Stack>
              </Fade>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={copied} autoHideDuration={2200} onClose={() => setCopied(false)}>
        <Alert severity="success" variant="filled">LinkedIn-Text kopiert.</Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
