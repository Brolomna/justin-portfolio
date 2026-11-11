// Toolkit curriculum data: module "identity" (Identity & Authentication Security)
// Edit this file to change skills, labels, descriptions, prereqs, tools, commands or layout for this module only.
window.TOOLKIT_DATA = window.TOOLKIT_DATA || {};
window.TOOLKIT_DATA["identity"] = {
 "id": "identity",
 "num": "03",
 "glyph": "\u2311",
 "name": "Identity & Authentication Security",
 "short": "IDENTITY",
 "slug": "identity",
 "desc": "Explore password storage, authentication mechanisms, credential security, and access control.",
 "tools": [
  "John the Ripper",
  "Hashcat",
  "HashID",
  "Hydra",
  "OpenSSL",
  "OpenSSH.",
  "Password managers",
  "password auditing utilities",
  "Lab applications",
  "TOTP applications",
  "Burp Suite",
  "OpenSSH",
  "ssh-keygen"
 ],
 "branches": [
  {
   "id": "identity.a",
   "letter": "A",
   "name": "PASSWORDS & HASHES",
   "skills": [
    "identity.password",
    "identity.hashing",
    "identity.hash",
    "identity.offline"
   ]
  },
  {
   "id": "identity.b",
   "letter": "B",
   "name": "AUTH MECHANISMS",
   "skills": [
    "identity.authentic",
    "identity.mfa"
   ]
  },
  {
   "id": "identity.c",
   "letter": "C",
   "name": "CREDENTIAL TESTING",
   "skills": [
    "identity.credentia",
    "identity.ssh"
   ]
  }
 ],
 "skills": [
  {
   "id": "identity.password",
   "module": "identity",
   "branch": "identity.a",
   "branchLetter": "A",
   "name": "Password Security",
   "label": "password",
   "desc": "Understand password strength, password reuse, secure storage, and password management.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [],
   "tools": [
    "Password managers",
    "password auditing utilities"
   ],
   "commands": [],
   "x": 0.1667,
   "y": 0.3822
  },
  {
   "id": "identity.hashing",
   "module": "identity",
   "branch": "identity.a",
   "branchLetter": "A",
   "name": "Hashing Fundamentals",
   "label": "hashing",
   "desc": "Understand cryptographic hashing, salts, and the differences between hashing and encryption.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [
    "identity.password"
   ],
   "tools": [
    "OpenSSL"
   ],
   "commands": [],
   "x": 0.255,
   "y": 0.5414
  },
  {
   "id": "identity.hash",
   "module": "identity",
   "branch": "identity.a",
   "branchLetter": "A",
   "name": "Hash Identification",
   "label": "hash",
   "desc": "Recognize common hash formats and understand their characteristics.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [
    "identity.hashing"
   ],
   "tools": [
    "HashID"
   ],
   "commands": [],
   "x": 0.1096,
   "y": 0.7006
  },
  {
   "id": "identity.offline",
   "module": "identity",
   "branch": "identity.a",
   "branchLetter": "A",
   "name": "Offline Password Auditing",
   "label": "offline",
   "desc": "Evaluate password strength by auditing intentionally provided test hashes.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "identity.hash"
   ],
   "tools": [
    "John the Ripper",
    "Hashcat"
   ],
   "commands": [],
   "x": 0.1153,
   "y": 0.8599
  },
  {
   "id": "identity.authentic",
   "module": "identity",
   "branch": "identity.b",
   "branchLetter": "B",
   "name": "Authentication Mechanisms",
   "label": "authentic",
   "desc": "Understand authentication flows, credential verification, and common implementation weaknesses.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [],
   "tools": [
    "Lab applications"
   ],
   "commands": [],
   "x": 0.5696,
   "y": 0.3822
  },
  {
   "id": "identity.mfa",
   "module": "identity",
   "branch": "identity.b",
   "branchLetter": "B",
   "name": "MFA Security",
   "label": "mfa",
   "desc": "Explore multifactor authentication, TOTP, recovery codes, and authentication security.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "identity.authentic"
   ],
   "tools": [
    "TOTP applications"
   ],
   "commands": [],
   "x": 0.4187,
   "y": 0.5414
  },
  {
   "id": "identity.credentia",
   "module": "identity",
   "branch": "identity.c",
   "branchLetter": "C",
   "name": "Credential Security Testing",
   "label": "credentia",
   "desc": "Evaluate login protections, rate limiting, and account lockout mechanisms in authorized environments.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [],
   "tools": [
    "Hydra",
    "Burp Suite"
   ],
   "commands": [],
   "x": 0.7406,
   "y": 0.3822
  },
  {
   "id": "identity.ssh",
   "module": "identity",
   "branch": "identity.c",
   "branchLetter": "C",
   "name": "SSH Authentication",
   "label": "ssh",
   "desc": "Understand password-based and public-key authentication for secure remote access.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "identity.credentia",
    "linux.ssh",
    "linux.keys"
   ],
   "tools": [
    "OpenSSH",
    "ssh-keygen"
   ],
   "commands": [],
   "x": 0.8534,
   "y": 0.5414
  }
 ],
 "layout": {
  "w": 1440,
  "h": 785
 }
};
