// Toolkit curriculum data: module "automation" (Automation & Security Engineering)
// Edit this file to change skills, labels, descriptions, prereqs, tools, commands or layout for this module only.
window.TOOLKIT_DATA = window.TOOLKIT_DATA || {};
window.TOOLKIT_DATA["automation"] = {
 "id": "automation",
 "num": "08",
 "glyph": "⚙",
 "name": "Automation & Security Engineering",
 "short": "AUTOMATION",
 "slug": "automation",
 "desc": "Build practical utilities, automate technical workflows, manage code, and turn security knowledge into projects.",
 "tools": [
  "Python",
  "Bash",
  "Git",
  "GitHub",
  "curl",
  "Markdown",
  "REST APIs.",
  "grep",
  "awk",
  "JSON"
 ],
 "branches": [
  {
   "id": "automation.a",
   "letter": "A",
   "name": "SCRIPTING",
   "skills": [
    "automation.python",
    "automation.bash"
   ]
  },
  {
   "id": "automation.b",
   "letter": "B",
   "name": "VERSION CONTROL",
   "skills": [
    "automation.git",
    "automation.github"
   ]
  },
  {
   "id": "automation.c",
   "letter": "C",
   "name": "ENGINEERING",
   "skills": [
    "automation.log",
    "automation.security",
    "automation.api",
    "automation.securit2"
   ]
  }
 ],
 "skills": [
  {
   "id": "automation.python",
   "module": "automation",
   "branch": "automation.a",
   "branchLetter": "A",
   "name": "Python Automation",
   "label": "python",
   "desc": "Automate routine system and security tasks using Python scripts.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [],
   "tools": [
    "Python"
   ],
   "commands": [],
   "x": 0.5076,
   "y": 0.3616
  },
  {
   "id": "automation.bash",
   "module": "automation",
   "branch": "automation.a",
   "branchLetter": "A",
   "name": "Bash Automation",
   "label": "bash",
   "desc": "Create repeatable Linux workflows and automate command-line operations.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "automation.python"
   ],
   "tools": [
    "Bash"
   ],
   "commands": [],
   "x": 0.4884,
   "y": 0.2885
  },
  {
   "id": "automation.git",
   "module": "automation",
   "branch": "automation.b",
   "branchLetter": "B",
   "name": "Git Fundamentals",
   "label": "git",
   "desc": "Track changes, manage revisions, and understand version control.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [],
   "tools": [
    "Git"
   ],
   "commands": [],
   "x": 0.6125,
   "y": 0.5809
  },
  {
   "id": "automation.github",
   "module": "automation",
   "branch": "automation.b",
   "branchLetter": "B",
   "name": "GitHub Projects",
   "label": "github",
   "desc": "Publish scripts, documentation, and security lab projects.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [
    "automation.git"
   ],
   "tools": [
    "GitHub"
   ],
   "commands": [],
   "x": 0.6931,
   "y": 0.5871
  },
  {
   "id": "automation.log",
   "module": "automation",
   "branch": "automation.c",
   "branchLetter": "C",
   "name": "Log Analysis",
   "label": "log",
   "desc": "Extract, filter, and organize useful information from system and application logs.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [],
   "tools": [
    "Python",
    "grep",
    "awk"
   ],
   "commands": [],
   "x": 0.3712,
   "y": 0.5512
  },
  {
   "id": "automation.security",
   "module": "automation",
   "branch": "automation.c",
   "branchLetter": "C",
   "name": "Security Reporting",
   "label": "security",
   "desc": "Document vulnerabilities, evidence, impact, and remediation recommendations.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "automation.log"
   ],
   "tools": [
    "Markdown",
    "GitHub"
   ],
   "commands": [],
   "x": 0.3338,
   "y": 0.6313
  },
  {
   "id": "automation.api",
   "module": "automation",
   "branch": "automation.c",
   "branchLetter": "C",
   "name": "API Integration",
   "label": "api",
   "desc": "Interact with APIs and process structured responses.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "automation.security"
   ],
   "tools": [
    "Python",
    "curl",
    "JSON"
   ],
   "commands": [],
   "x": 0.1883,
   "y": 0.624
  },
  {
   "id": "automation.securit2",
   "module": "automation",
   "branch": "automation.c",
   "branchLetter": "C",
   "name": "Security Tool Development",
   "label": "securit2",
   "desc": "Build small utilities that solve practical security and system administration problems.",
   "difficulty": "project",
   "xp": 100,
   "pre": [
    "automation.api"
   ],
   "tools": [
    "Python",
    "Bash"
   ],
   "commands": [],
   "x": 0.1793,
   "y": 0.7533
  }
 ],
 "layout": {
  "w": 1270,
  "h": 1270
 }
};
