// Toolkit curriculum data: module "privacy" (Privacy, Anonymity & Secure Operations)
// Edit this file to change skills, labels, descriptions, prereqs, tools, commands or layout for this module only.
window.TOOLKIT_DATA = window.TOOLKIT_DATA || {};
window.TOOLKIT_DATA["privacy"] = {
 "id": "privacy",
 "num": "07",
 "glyph": "◎",
 "name": "Privacy, Anonymity & Secure Operations",
 "short": "PRIVACY",
 "slug": "privacy",
 "desc": "Learn privacy technologies, secure browsing, network routing, and operational security.",
 "tools": [
  "Tor",
  "Tails",
  "VPN clients",
  "ProxyChains",
  "DNS privacy tools.",
  "Browser privacy settings",
  "Threat models",
  "security checklists",
  "proxy clients",
  "Tor Browser",
  "Tails OS",
  "DoH",
  "DoT",
  "Security checklists"
 ],
 "branches": [
  {
   "id": "privacy.a",
   "letter": "A",
   "name": "FOUNDATIONS",
   "skills": [
    "privacy.privacy",
    "privacy.threat",
    "privacy.proxy",
    "privacy.vpn"
   ]
  },
  {
   "id": "privacy.b",
   "letter": "B",
   "name": "TOR & TAILS",
   "skills": [
    "privacy.tor",
    "privacy.tails"
   ]
  },
  {
   "id": "privacy.c",
   "letter": "C",
   "name": "DNS & OPSEC",
   "skills": [
    "privacy.dns",
    "privacy.operation"
   ]
  }
 ],
 "skills": [
  {
   "id": "privacy.privacy",
   "module": "privacy",
   "branch": "privacy.a",
   "branchLetter": "A",
   "name": "Privacy Fundamentals",
   "label": "privacy",
   "desc": "Understand digital privacy and common online tracking mechanisms.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [],
   "tools": [
    "Browser privacy settings"
   ],
   "commands": [],
   "x": 0.5076,
   "y": 0.3616
  },
  {
   "id": "privacy.threat",
   "module": "privacy",
   "branch": "privacy.a",
   "branchLetter": "A",
   "name": "Threat Modeling",
   "label": "threat",
   "desc": "Identify what information needs protection, potential threats, and security priorities.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [
    "privacy.privacy"
   ],
   "tools": [
    "Threat models",
    "security checklists"
   ],
   "commands": [],
   "x": 0.4884,
   "y": 0.2885
  },
  {
   "id": "privacy.proxy",
   "module": "privacy",
   "branch": "privacy.a",
   "branchLetter": "A",
   "name": "Proxy Fundamentals",
   "label": "proxy",
   "desc": "Understand forward proxies, reverse proxies, and their purposes in network communication.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "privacy.threat"
   ],
   "tools": [
    "ProxyChains",
    "proxy clients"
   ],
   "commands": [],
   "x": 0.5184,
   "y": 0.1651
  },
  {
   "id": "privacy.vpn",
   "module": "privacy",
   "branch": "privacy.a",
   "branchLetter": "A",
   "name": "VPN Fundamentals",
   "label": "vpn",
   "desc": "Understand encrypted tunnels, VPN routing, and their limitations.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "privacy.proxy"
   ],
   "tools": [
    "VPN clients"
   ],
   "commands": [],
   "x": 0.4775,
   "y": 0.092
  },
  {
   "id": "privacy.tor",
   "module": "privacy",
   "branch": "privacy.b",
   "branchLetter": "B",
   "name": "Tor Network",
   "label": "tor",
   "desc": "Understand onion routing and the purpose of Tor relays.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [],
   "tools": [
    "Tor Browser"
   ],
   "commands": [],
   "x": 0.6125,
   "y": 0.5809
  },
  {
   "id": "privacy.tails",
   "module": "privacy",
   "branch": "privacy.b",
   "branchLetter": "B",
   "name": "Tails OS",
   "label": "tails",
   "desc": "Explore a live operating system designed around privacy and amnesic sessions.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "privacy.tor"
   ],
   "tools": [
    "Tails OS"
   ],
   "commands": [],
   "x": 0.6931,
   "y": 0.5871
  },
  {
   "id": "privacy.dns",
   "module": "privacy",
   "branch": "privacy.c",
   "branchLetter": "C",
   "name": "DNS Privacy",
   "label": "dns",
   "desc": "Understand encrypted DNS and potential DNS information leaks.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [],
   "tools": [
    "DoH",
    "DoT"
   ],
   "commands": [],
   "x": 0.3712,
   "y": 0.5512
  },
  {
   "id": "privacy.operation",
   "module": "privacy",
   "branch": "privacy.c",
   "branchLetter": "C",
   "name": "Operational Security",
   "label": "operation",
   "desc": "Learn to minimize sensitive data exposure and maintain secure working practices.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "privacy.dns"
   ],
   "tools": [
    "Security checklists"
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
