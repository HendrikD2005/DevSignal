export const LOCALES = ['de', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

type TranslationValue = string;
type TranslationParams = Record<string, string | number>;

const translations = {
  de: {
    'app.brand': 'DevSignal',
    'app.badgePrototype': 'Prototype',
    'hero.badge': 'GitHub -> LinkedIn',
    'hero.title': 'Portfolio-Texte aus deinen Repositories.',
    'hero.subtitle': 'DevSignal analysiert oeffentliche GitHub-Repos und erstellt daraus Skills, Score und einen kopierbaren LinkedIn-Projektpost.',
    'form.usernameLabel': 'GitHub Username',
    'form.usernamePlaceholder': 'z. B. HendrikD2005',
    'form.loadButton': 'Laden',
    'repo.heading': 'Repositories',
    'repo.countFound': '{count} gefunden',
    'repo.languageMixed': 'Mixed',
    'repo.noDescription': 'Keine Beschreibung vorhanden.',
    'repo.stats': '★ {stars} · Forks {forks}',
    'empty.title': 'Waehle ein Repository aus.',
    'empty.subtitle': 'Danach erscheinen Score, Skills und ein LinkedIn-Post-Entwurf.',
    'analysis.scoreOutOfHundred': '/100',
    'analysis.skillsHeading': 'Erkannte Skills',
    'analysis.reasonsHeading': 'Warum dieser Score?',
    'post.heading': 'LinkedIn-Entwurf',
    'post.subtitle': 'Manuell pruefen, anpassen und posten.',
    'post.copyButton': 'Kopieren',
    'toast.copied': 'LinkedIn-Text kopiert.',
    'errors.emptyUsername': 'Bitte gib einen GitHub-Username ein.',
    'errors.noRepos': 'Keine oeffentlichen Non-Fork-Repositories gefunden.',
    'errors.loadReposFailed': 'Repositories konnten nicht geladen werden. Pruefe Username oder GitHub-Limit.',
    'errors.analysisFailed': 'Repository-Analyse konnte nicht geladen werden.',
    'language.label': 'Sprache',
    'language.de': 'Deutsch',
    'language.en': 'English',
    'analysis.reason.hasDescription': 'Repository hat eine Beschreibung.',
    'analysis.reason.readmeDetailed': 'README wirkt aussagekraeftig.',
    'analysis.reason.skillsDetected': 'Mehrere relevante Skills erkannt.',
    'analysis.reason.publicResonance': 'Repository hat oeffentliche Resonanz.',
    'analysis.reason.readmePresentation': 'README enthaelt praesentationsnahe Inhalte.',
    'analysis.post.defaultTechStack': 'moderne Web-Technologien',
    'analysis.post.defaultDescription': 'ein eigenes Softwareprojekt zur Verbesserung meines Entwicklerportfolios',
    'analysis.post.line1': 'Ich habe mein Projekt "{repoName}" weiter ausgearbeitet.',
    'analysis.post.line3': 'Dabei geht es um {description}.',
    'analysis.post.line5': 'Technisch spannend daran: {techStack}.',
    'analysis.post.line7': 'Fuer mein Portfolio ist das Projekt besonders wertvoll, weil es nicht nur Code zeigt, sondern auch Produktdenken, technische Umsetzung und klare Dokumentation verbindet.',
    'analysis.post.line9': 'Portfolio-Score: {score}/100',
    'analysis.post.line11': 'GitHub: {url}',
  },
  en: {
    'app.brand': 'DevSignal',
    'app.badgePrototype': 'Prototype',
    'hero.badge': 'GitHub -> LinkedIn',
    'hero.title': 'Portfolio copy from your repositories.',
    'hero.subtitle': 'DevSignal analyzes public GitHub repos and creates skills, a score, and a copy-ready LinkedIn project draft.',
    'form.usernameLabel': 'GitHub Username',
    'form.usernamePlaceholder': 'e.g. HendrikD2005',
    'form.loadButton': 'Load',
    'repo.heading': 'Repositories',
    'repo.countFound': '{count} found',
    'repo.languageMixed': 'Mixed',
    'repo.noDescription': 'No description available.',
    'repo.stats': '★ {stars} · Forks {forks}',
    'empty.title': 'Select a repository.',
    'empty.subtitle': 'Then the score, skills, and a LinkedIn post draft will appear.',
    'analysis.scoreOutOfHundred': '/100',
    'analysis.skillsHeading': 'Detected skills',
    'analysis.reasonsHeading': 'Why this score?',
    'post.heading': 'LinkedIn draft',
    'post.subtitle': 'Review, adjust, and post manually.',
    'post.copyButton': 'Copy',
    'toast.copied': 'LinkedIn text copied.',
    'errors.emptyUsername': 'Please enter a GitHub username.',
    'errors.noRepos': 'No public non-fork repositories found.',
    'errors.loadReposFailed': 'Could not load repositories. Check the username or GitHub rate limit.',
    'errors.analysisFailed': 'Repository analysis could not be loaded.',
    'language.label': 'Language',
    'language.de': 'Deutsch',
    'language.en': 'English',
    'analysis.reason.hasDescription': 'Repository has a description.',
    'analysis.reason.readmeDetailed': 'README looks informative.',
    'analysis.reason.skillsDetected': 'Multiple relevant skills detected.',
    'analysis.reason.publicResonance': 'Repository has public traction.',
    'analysis.reason.readmePresentation': 'README contains presentation-ready content.',
    'analysis.post.defaultTechStack': 'modern web technologies',
    'analysis.post.defaultDescription': 'a personal software project to strengthen my developer portfolio',
    'analysis.post.line1': 'I further developed my project "{repoName}".',
    'analysis.post.line3': 'It is about {description}.',
    'analysis.post.line5': 'Technically exciting: {techStack}.',
    'analysis.post.line7': 'For my portfolio, this project is especially valuable because it demonstrates not only code, but also product thinking, technical execution, and clear documentation.',
    'analysis.post.line9': 'Portfolio score: {score}/100',
    'analysis.post.line11': 'GitHub: {url}',
  },
} as const;

export type TranslationKey = keyof (typeof translations)['de'];

function format(template: TranslationValue, params: TranslationParams = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, token: string) => String(params[token] ?? `{${token}}`));
}

export function createTranslator(locale: Locale) {
  return (key: TranslationKey, params: TranslationParams = {}): string => {
    const entry = translations[locale][key] ?? translations.de[key];
    return format(entry, params);
  };
}
