// Toolkit curriculum data: module "recon" (Reconnaissance & Enumeration)
// Edit this file to change skills, labels, descriptions, prereqs, tools, commands or layout for this module only.
window.TOOLKIT_DATA = window.TOOLKIT_DATA || {};
window.TOOLKIT_DATA["recon"] = {
 "id": "recon",
 "num": "01",
 "glyph": "⌁",
 "name": "Reconnaissance & Enumeration",
 "short": "RECON",
 "slug": "recon",
 "desc": "Discover hosts, services, technologies, and exposed resources. Understand what is visible before conducting security assessments.",
 "tools": [
  "Nmap",
  "Gobuster",
  "FFUF",
  "Netcat",
  "Amass",
  "Subfinder",
  "WHOIS",
  "DNSRecon",
  "WhatWeb",
  "Wappalyzer",
  "arp-scan.",
  "Scope documentation",
  "testing checklists",
  "public DNS records",
  "dig",
  "nslookup",
  "arp-scan",
  "Nmap -sV"
 ],
 "branches": [
  {
   "id": "recon.a",
   "letter": "A",
   "name": "PASSIVE",
   "skills": [
    "recon.scope",
    "recon.passive",
    "recon.dns",
    "recon.subdomain"
   ]
  },
  {
   "id": "recon.b",
   "letter": "B",
   "name": "ACTIVE SCANNING",
   "skills": [
    "recon.host",
    "recon.port",
    "recon.service"
   ]
  },
  {
   "id": "recon.c",
   "letter": "C",
   "name": "WEB DISCOVERY",
   "skills": [
    "recon.directory",
    "recon.technolog"
   ]
  }
 ],
 "skills": [
  {
   "id": "recon.scope",
   "module": "recon",
   "branch": "recon.a",
   "branchLetter": "A",
   "name": "Scope & Authorization",
   "label": "scope",
   "desc": "Define permitted targets, testing boundaries, and rules before conducting security assessments.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [],
   "tools": [
    "Scope documentation",
    "testing checklists"
   ],
   "commands": [],
   "x": 0.5076,
   "y": 0.3616
  },
  {
   "id": "recon.passive",
   "module": "recon",
   "branch": "recon.a",
   "branchLetter": "A",
   "name": "Passive Reconnaissance",
   "label": "passive",
   "desc": "Collect publicly available information about domains, organizations, and infrastructure without directly probing target systems.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [
    "recon.scope"
   ],
   "tools": [
    "WHOIS",
    "public DNS records"
   ],
   "commands": [],
   "x": 0.4884,
   "y": 0.2885
  },
  {
   "id": "recon.dns",
   "module": "recon",
   "branch": "recon.a",
   "branchLetter": "A",
   "name": "DNS Enumeration",
   "label": "dns",
   "desc": "Identify DNS records and understand how domain infrastructure is configured.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "recon.passive"
   ],
   "tools": [
    "dig",
    "nslookup",
    "DNSRecon"
   ],
   "commands": [],
   "x": 0.5184,
   "y": 0.1651
  },
  {
   "id": "recon.subdomain",
   "module": "recon",
   "branch": "recon.a",
   "branchLetter": "A",
   "name": "Subdomain Discovery",
   "label": "subdomain",
   "desc": "Discover subdomains within an authorized assessment scope.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "recon.dns"
   ],
   "tools": [
    "Amass",
    "Subfinder"
   ],
   "commands": [],
   "x": 0.4775,
   "y": 0.092
  },
  {
   "id": "recon.host",
   "module": "recon",
   "branch": "recon.b",
   "branchLetter": "B",
   "name": "Host Discovery",
   "label": "host",
   "desc": "Identify active devices and hosts within an authorized network.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [],
   "tools": [
    "Nmap",
    "arp-scan"
   ],
   "commands": [],
   "x": 0.6125,
   "y": 0.5809
  },
  {
   "id": "recon.port",
   "module": "recon",
   "branch": "recon.b",
   "branchLetter": "B",
   "name": "Port Scanning",
   "label": "port",
   "desc": "Identify open, closed, and filtered network ports on authorized target systems.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "recon.host",
    "linux.ip",
    "linux.ports",
    "network.tcpip"
   ],
   "tools": [
    "Nmap"
   ],
   "commands": [],
   "x": 0.6931,
   "y": 0.5871,
   "obj": [
    "Understand how Nmap works.",
    "Identify active hosts.",
    "Scan TCP ports.",
    "Understand common scan results.",
    "Identify running services.",
    "Save scan output."
   ],
   "exercise": "Perform a scan against your own lab machine and identify the services running on it.",
   "unlock": [
    "Complete the prerequisite skills.",
    "Perform an authorized lab scan.",
    "Identify the discovered ports.",
    "Explain the scan results.",
    "Save evidence of the exercise."
   ],
   "evidenceNote": "A terminal screenshot and a short GitHub lab report."
  },
  {
   "id": "recon.service",
   "module": "recon",
   "branch": "recon.b",
   "branchLetter": "B",
   "name": "Service Enumeration",
   "label": "service",
   "desc": "Identify running services, software versions, and exposed network services.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "recon.port"
   ],
   "tools": [
    "Nmap -sV"
   ],
   "commands": [],
   "x": 0.7723,
   "y": 0.6959
  },
  {
   "id": "recon.directory",
   "module": "recon",
   "branch": "recon.c",
   "branchLetter": "C",
   "name": "Directory Discovery",
   "label": "directory",
   "desc": "Discover publicly accessible directories, endpoints, and files in test web applications.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [],
   "tools": [
    "Gobuster",
    "FFUF"
   ],
   "commands": [],
   "x": 0.3712,
   "y": 0.5512
  },
  {
   "id": "recon.technolog",
   "module": "recon",
   "branch": "recon.c",
   "branchLetter": "C",
   "name": "Technology Fingerprinting",
   "label": "technolog",
   "desc": "Identify web servers, application frameworks, CMS platforms, and technologies.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [
    "recon.directory"
   ],
   "tools": [
    "WhatWeb",
    "Wappalyzer"
   ],
   "commands": [],
   "x": 0.3338,
   "y": 0.6313
  }
 ],
 "layout": {
  "w": 1270,
  "h": 1270
 }
};
