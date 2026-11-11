// Toolkit curriculum data: module "vuln" (Vulnerability Assessment & Exploitation)
// Edit this file to change skills, labels, descriptions, prereqs, tools, commands or layout for this module only.
window.TOOLKIT_DATA = window.TOOLKIT_DATA || {};
window.TOOLKIT_DATA["vuln"] = {
 "id": "vuln",
 "num": "05",
 "glyph": "\u2316",
 "name": "Vulnerability Assessment & Exploitation",
 "short": "VULN & EXPLOIT",
 "slug": "vuln",
 "desc": "Assess security weaknesses, understand exploit mechanics, validate findings, and learn remediation in controlled labs.",
 "tools": [
  "Metasploit",
  "SearchSploit",
  "Nuclei",
  "OpenVAS",
  "LinPEAS",
  "Nmap",
  "CVE databases.",
  "CVE database",
  "NVD",
  "Controlled lab exercises",
  "Metasploit Framework",
  "Controlled lab environments",
  "manual auditing",
  "Metasploit lab",
  "Markdown",
  "GitHub",
  "security reports"
 ],
 "branches": [
  {
   "id": "vuln.a",
   "letter": "A",
   "name": "ASSESSMENT",
   "skills": [
    "vuln.vulnerabi",
    "vuln.vulnera2",
    "vuln.vulnera3"
   ]
  },
  {
   "id": "vuln.b",
   "letter": "B",
   "name": "EXPLOITATION",
   "skills": [
    "vuln.exploit",
    "vuln.metasploi",
    "vuln.exploit2"
   ]
  },
  {
   "id": "vuln.c",
   "letter": "C",
   "name": "PRIVESC & REPORTING",
   "skills": [
    "vuln.linux",
    "vuln.postexplo",
    "vuln.remediati"
   ]
  }
 ],
 "skills": [
  {
   "id": "vuln.vulnerabi",
   "module": "vuln",
   "branch": "vuln.a",
   "branchLetter": "A",
   "name": "Vulnerability Fundamentals",
   "label": "vulnerabi",
   "desc": "Understand common vulnerability classes, security weaknesses, and their potential impact.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [],
   "tools": [
    "CVE database",
    "NVD"
   ],
   "commands": [],
   "x": 0.5,
   "y": 0.3431
  },
  {
   "id": "vuln.vulnera2",
   "module": "vuln",
   "branch": "vuln.a",
   "branchLetter": "A",
   "name": "Vulnerability Research",
   "label": "vulnera2",
   "desc": "Research known vulnerabilities, affected software versions, and available security advisories.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "vuln.vulnerabi"
   ],
   "tools": [
    "NVD",
    "SearchSploit"
   ],
   "commands": [],
   "x": 0.5,
   "y": 0.2206
  },
  {
   "id": "vuln.vulnera3",
   "module": "vuln",
   "branch": "vuln.a",
   "branchLetter": "A",
   "name": "Vulnerability Scanning",
   "label": "vulnera3",
   "desc": "Identify potential weaknesses in authorized laboratory environments.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "vuln.vulnera2"
   ],
   "tools": [
    "Nuclei",
    "OpenVAS"
   ],
   "commands": [],
   "x": 0.5,
   "y": 0.098
  },
  {
   "id": "vuln.exploit",
   "module": "vuln",
   "branch": "vuln.b",
   "branchLetter": "B",
   "name": "Exploit Fundamentals",
   "label": "exploit",
   "desc": "Understand how software vulnerabilities can lead to unintended system behavior.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [],
   "tools": [
    "Controlled lab exercises"
   ],
   "commands": [],
   "x": 0.6358,
   "y": 0.5784
  },
  {
   "id": "vuln.metasploi",
   "module": "vuln",
   "branch": "vuln.b",
   "branchLetter": "B",
   "name": "Metasploit Fundamentals",
   "label": "metasploi",
   "desc": "Explore the Metasploit Framework, modules, payload concepts, and controlled lab testing.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "vuln.exploit"
   ],
   "tools": [
    "Metasploit Framework"
   ],
   "commands": [],
   "x": 0.742,
   "y": 0.6397
  },
  {
   "id": "vuln.exploit2",
   "module": "vuln",
   "branch": "vuln.b",
   "branchLetter": "B",
   "name": "Exploit Validation",
   "label": "exploit2",
   "desc": "Verify vulnerabilities safely without causing unnecessary system impact.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "vuln.metasploi"
   ],
   "tools": [
    "Controlled lab environments"
   ],
   "commands": [],
   "x": 0.8481,
   "y": 0.701
  },
  {
   "id": "vuln.linux",
   "module": "vuln",
   "branch": "vuln.c",
   "branchLetter": "C",
   "name": "Linux Privilege Assessment",
   "label": "linux",
   "desc": "Examine Linux permissions, configurations, and privilege boundaries for security weaknesses.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [],
   "tools": [
    "LinPEAS",
    "manual auditing"
   ],
   "commands": [],
   "x": 0.3642,
   "y": 0.5784
  },
  {
   "id": "vuln.postexplo",
   "module": "vuln",
   "branch": "vuln.c",
   "branchLetter": "C",
   "name": "Post-Exploitation Concepts",
   "label": "postexplo",
   "desc": "Understand the security impact and system exposure that can follow a successful lab compromise.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "vuln.linux"
   ],
   "tools": [
    "Metasploit lab"
   ],
   "commands": [],
   "x": 0.258,
   "y": 0.6397
  },
  {
   "id": "vuln.remediati",
   "module": "vuln",
   "branch": "vuln.c",
   "branchLetter": "C",
   "name": "Remediation & Reporting",
   "label": "remediati",
   "desc": "Document security findings, assess impact, and recommend practical fixes.",
   "difficulty": "project",
   "xp": 100,
   "pre": [
    "vuln.postexplo"
   ],
   "tools": [
    "Markdown",
    "GitHub",
    "security reports"
   ],
   "commands": [],
   "x": 0.1519,
   "y": 0.701
  }
 ],
 "layout": {
  "w": 1020,
  "h": 1020
 }
};
