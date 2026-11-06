/**
 * Content data for the autonomous hero presentation.
 * Animation logic lives in CSS (index.css) and the visual components;
 * this file is content only. Durations sum to ~86 seconds for one full loop.
 */

export type SceneId =
  | 'identity'
  | 'python'
  | 'ai'
  | 'linux'
  | 'security'
  | 'webdev'
  | 'projects'
  | 'teaching'
  | 'closing';

export interface Scene {
  id: SceneId;
  nav: string;
  kicker: string;
  title: string;
  body: string;
  duration: number; // seconds on screen
}

export const scenes: Scene[] = [
  {
    id: 'identity',
    nav: 'Intro',
    kicker: 'Identity',
    title: 'Justin — developer building practical software with AI.',
    body: 'I design, build and test websites, apps and automation using AI-assisted workflows — clean, working products, shipped fast from Nepal to anywhere.',
    duration: 11,
  },
  {
    id: 'python',
    nav: 'Python',
    kicker: 'Python & Automation',
    title: 'Automation that moves data from input to output.',
    body: 'Python scripts that parse messy input, branch on conditions, transform data and produce clean, structured output — no manual steps in between.',
    duration: 10,
  },
  {
    id: 'ai',
    nav: 'AI',
    kicker: 'Artificial Intelligence',
    title: 'AI-assisted development, end to end.',
    body: 'I use AI tools across the whole build loop — from prompt to structured output to tested product — which is how quality ships this fast.',
    duration: 10,
  },
  {
    id: 'linux',
    nav: 'Linux',
    kicker: 'Linux & Systems',
    title: 'Comfortable where the systems live.',
    body: 'Daily Linux use, system troubleshooting, Git and the command line — the unglamorous skills that keep software running.',
    duration: 10,
  },
  {
    id: 'security',
    nav: 'Security',
    kicker: 'Cybersecurity',
    title: 'Security fundamentals, applied to real traffic.',
    body: 'Web penetration-testing fundamentals and CTF practice: reading network traffic, spotting what looks wrong, and thinking about boundaries.',
    duration: 10,
  },
  {
    id: 'webdev',
    nav: 'Web',
    kicker: 'Web Development',
    title: 'Interfaces assembled, styled and made responsive.',
    body: 'HTML, CSS, JavaScript and React — layouts that come together component by component and hold up on any screen size.',
    duration: 10,
  },
  {
    id: 'projects',
    nav: 'Projects',
    kicker: 'Projects',
    title: 'Real projects, shipped and public.',
    body: 'Moonfall — a local-multiplayer werewolf web game — plus automation tools and community software. Every repo is public on GitHub.',
    duration: 11,
  },
  {
    id: 'teaching',
    nav: 'Teaching',
    kicker: 'Teaching & Communication',
    title: 'Complex ideas, explained in plain language.',
    body: 'A background as a computer instructor and English teacher means I can take a dense technical concept and make it understandable.',
    duration: 8,
  },
  {
    id: 'closing',
    nav: 'Contact',
    kicker: 'Closing',
    title: "Let's build something useful.",
    body: 'Have a project in mind, or a role to fill? Email me or find every project on GitHub.',
    duration: 6,
  },
];
