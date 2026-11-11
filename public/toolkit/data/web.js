// Toolkit curriculum data: module "web" (Web Application & API Security)
// Edit this file to change skills, labels, descriptions, prereqs, tools, commands or layout for this module only.
window.TOOLKIT_DATA = window.TOOLKIT_DATA || {};
window.TOOLKIT_DATA["web"] = {
 "id": "web",
 "num": "02",
 "glyph": "\u25c8",
 "name": "Web Application & API Security",
 "short": "WEB & API",
 "slug": "web",
 "desc": "Understand how websites and APIs operate, inspect HTTP traffic, and identify common application security vulnerabilities.",
 "tools": [
  "Burp Suite",
  "OWASP ZAP",
  "Postman",
  "DVWA",
  "OWASP Juice Shop",
  "Browser Developer Tools",
  "curl.",
  "Browser DevTools",
  "curl",
  "Burp Suite Proxy",
  "Burp Suite Repeater",
  "OpenSSL"
 ],
 "branches": [
  {
   "id": "web.a",
   "letter": "A",
   "name": "HTTP & PROXY",
   "skills": [
    "web.http",
    "web.request",
    "web.proxy",
    "web.cookies"
   ]
  },
  {
   "id": "web.b",
   "letter": "B",
   "name": "AUTH & ACCESS",
   "skills": [
    "web.authentic",
    "web.access"
   ]
  },
  {
   "id": "web.c",
   "letter": "C",
   "name": "APP & API TESTING",
   "skills": [
    "web.input",
    "web.injection",
    "web.api",
    "web.security"
   ]
  }
 ],
 "skills": [
  {
   "id": "web.http",
   "module": "web",
   "branch": "web.a",
   "branchLetter": "A",
   "name": "HTTP Fundamentals",
   "label": "http",
   "desc": "Understand HTTP methods, status codes, headers, requests, and responses.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [],
   "tools": [
    "Browser DevTools",
    "curl"
   ],
   "commands": [],
   "x": 0.1667,
   "y": 0.3822
  },
  {
   "id": "web.request",
   "module": "web",
   "branch": "web.a",
   "branchLetter": "A",
   "name": "Request Interception",
   "label": "request",
   "desc": "Capture and inspect HTTP requests and responses between a browser and server.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "web.http"
   ],
   "tools": [
    "Burp Suite Proxy",
    "OWASP ZAP"
   ],
   "commands": [],
   "x": 0.255,
   "y": 0.5414
  },
  {
   "id": "web.proxy",
   "module": "web",
   "branch": "web.a",
   "branchLetter": "A",
   "name": "Proxy & Repeater",
   "label": "proxy",
   "desc": "Modify, inspect, and resend HTTP requests to understand application behavior.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "web.request"
   ],
   "tools": [
    "Burp Suite Repeater"
   ],
   "commands": [],
   "x": 0.1096,
   "y": 0.7006
  },
  {
   "id": "web.cookies",
   "module": "web",
   "branch": "web.a",
   "branchLetter": "A",
   "name": "Cookies & Sessions",
   "label": "cookies",
   "desc": "Understand session identifiers, cookie attributes, session management, and session security.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "web.proxy"
   ],
   "tools": [
    "Burp Suite"
   ],
   "commands": [],
   "x": 0.1153,
   "y": 0.8599
  },
  {
   "id": "web.authentic",
   "module": "web",
   "branch": "web.b",
   "branchLetter": "B",
   "name": "Authentication Testing",
   "label": "authentic",
   "desc": "Assess login, registration, and account recovery mechanisms in authorized lab applications.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [],
   "tools": [
    "Burp Suite",
    "OWASP ZAP"
   ],
   "commands": [],
   "x": 0.5696,
   "y": 0.3822
  },
  {
   "id": "web.access",
   "module": "web",
   "branch": "web.b",
   "branchLetter": "B",
   "name": "Access Control Testing",
   "label": "access",
   "desc": "Identify improper permissions, authorization failures, and insecure direct object references.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "web.authentic"
   ],
   "tools": [
    "Burp Suite"
   ],
   "commands": [],
   "x": 0.4187,
   "y": 0.5414
  },
  {
   "id": "web.input",
   "module": "web",
   "branch": "web.c",
   "branchLetter": "C",
   "name": "Input Validation",
   "label": "input",
   "desc": "Understand how applications validate, sanitize, and process user-supplied input.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [],
   "tools": [
    "Burp Suite",
    "OWASP ZAP"
   ],
   "commands": [],
   "x": 0.7406,
   "y": 0.3822
  },
  {
   "id": "web.injection",
   "module": "web",
   "branch": "web.c",
   "branchLetter": "C",
   "name": "Injection Vulnerabilities",
   "label": "injection",
   "desc": "Study SQL injection, cross-site scripting, and other injection vulnerability classes.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "web.input"
   ],
   "tools": [
    "DVWA",
    "OWASP Juice Shop",
    "Burp Suite"
   ],
   "commands": [],
   "x": 0.8534,
   "y": 0.5414
  },
  {
   "id": "web.api",
   "module": "web",
   "branch": "web.c",
   "branchLetter": "C",
   "name": "API Security Testing",
   "label": "api",
   "desc": "Inspect REST APIs, JSON requests, authentication, authorization, and API security weaknesses.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "web.injection"
   ],
   "tools": [
    "Postman",
    "Burp Suite",
    "curl"
   ],
   "commands": [],
   "x": 0.9131,
   "y": 0.7006
  },
  {
   "id": "web.security",
   "module": "web",
   "branch": "web.c",
   "branchLetter": "C",
   "name": "Security Configuration",
   "label": "security",
   "desc": "Review security headers, CORS policies, TLS configuration, and common deployment weaknesses.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "web.api"
   ],
   "tools": [
    "curl",
    "OWASP ZAP",
    "OpenSSL"
   ],
   "commands": [],
   "x": 0.7617,
   "y": 0.8599
  }
 ],
 "layout": {
  "w": 1440,
  "h": 785
 }
};
