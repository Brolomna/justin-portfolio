// Toolkit curriculum data: module "network" (Network Analysis & Traffic Monitoring)
// Edit this file to change skills, labels, descriptions, prereqs, tools, commands or layout for this module only.
window.TOOLKIT_DATA = window.TOOLKIT_DATA || {};
window.TOOLKIT_DATA["network"] = {
 "id": "network",
 "num": "04",
 "glyph": "\u25c9",
 "name": "Network Analysis & Traffic Monitoring",
 "short": "NET ANALYSIS",
 "slug": "network",
 "desc": "Understand network protocols, inspect packets, troubleshoot connections, and recognize unusual network traffic.",
 "tools": [
  "Wireshark",
  "tcpdump",
  "TShark",
  "Zeek",
  "Netcat",
  "OpenSSL.",
  "TCP/IP",
  "networking utilities",
  "Wireshark display filters",
  "dig",
  "OpenSSL",
  "UFW",
  "nftables"
 ],
 "branches": [
  {
   "id": "network.a",
   "letter": "A",
   "name": "CAPTURE",
   "skills": [
    "network.tcpip",
    "network.packet",
    "network.wireshark"
   ]
  },
  {
   "id": "network.b",
   "letter": "B",
   "name": "TRAFFIC ANALYSIS",
   "skills": [
    "network.display",
    "network.dns",
    "network.http"
   ]
  },
  {
   "id": "network.c",
   "letter": "C",
   "name": "DETECTION & RULES",
   "skills": [
    "network.tls",
    "network.network",
    "network.firewall"
   ]
  }
 ],
 "skills": [
  {
   "id": "network.tcpip",
   "module": "network",
   "branch": "network.a",
   "branchLetter": "A",
   "name": "TCP/IP Fundamentals",
   "label": "tcpip",
   "desc": "Understand how devices communicate using network protocols and the TCP/IP model.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [],
   "tools": [
    "TCP/IP",
    "networking utilities"
   ],
   "commands": [],
   "x": 0.1667,
   "y": 0.4545
  },
  {
   "id": "network.packet",
   "module": "network",
   "branch": "network.a",
   "branchLetter": "A",
   "name": "Packet Capture",
   "label": "packet",
   "desc": "Capture network packets for inspection, troubleshooting, and security analysis.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "network.tcpip"
   ],
   "tools": [
    "tcpdump",
    "TShark"
   ],
   "commands": [],
   "x": 0.255,
   "y": 0.6439
  },
  {
   "id": "network.wireshark",
   "module": "network",
   "branch": "network.a",
   "branchLetter": "A",
   "name": "Wireshark Fundamentals",
   "label": "wireshark",
   "desc": "Navigate packet captures and inspect network conversations.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "network.packet"
   ],
   "tools": [
    "Wireshark"
   ],
   "commands": [],
   "x": 0.1096,
   "y": 0.8333
  },
  {
   "id": "network.display",
   "module": "network",
   "branch": "network.b",
   "branchLetter": "B",
   "name": "Display Filters",
   "label": "display",
   "desc": "Filter packet captures by IP addresses, protocols, ports, and TCP flags.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [],
   "tools": [
    "Wireshark display filters"
   ],
   "commands": [],
   "x": 0.5696,
   "y": 0.4545
  },
  {
   "id": "network.dns",
   "module": "network",
   "branch": "network.b",
   "branchLetter": "B",
   "name": "DNS Traffic Analysis",
   "label": "dns",
   "desc": "Inspect DNS queries, responses, and domain resolution behavior.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "network.display"
   ],
   "tools": [
    "Wireshark",
    "dig"
   ],
   "commands": [],
   "x": 0.4187,
   "y": 0.6439
  },
  {
   "id": "network.http",
   "module": "network",
   "branch": "network.b",
   "branchLetter": "B",
   "name": "HTTP Traffic Analysis",
   "label": "http",
   "desc": "Inspect HTTP requests, responses, headers, and unencrypted traffic in lab captures.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "network.dns"
   ],
   "tools": [
    "Wireshark"
   ],
   "commands": [],
   "x": 0.483,
   "y": 0.8333
  },
  {
   "id": "network.tls",
   "module": "network",
   "branch": "network.c",
   "branchLetter": "C",
   "name": "TLS Analysis",
   "label": "tls",
   "desc": "Understand certificates, TLS handshakes, and encrypted network connections.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [],
   "tools": [
    "Wireshark",
    "OpenSSL"
   ],
   "commands": [],
   "x": 0.7406,
   "y": 0.4545
  },
  {
   "id": "network.network",
   "module": "network",
   "branch": "network.c",
   "branchLetter": "C",
   "name": "Network Anomaly Detection",
   "label": "network",
   "desc": "Recognize unusual traffic patterns and potentially suspicious network connections.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "network.tls"
   ],
   "tools": [
    "Wireshark",
    "Zeek"
   ],
   "commands": [],
   "x": 0.8534,
   "y": 0.6439
  },
  {
   "id": "network.firewall",
   "module": "network",
   "branch": "network.c",
   "branchLetter": "C",
   "name": "Firewall & Traffic Rules",
   "label": "firewall",
   "desc": "Understand network filtering, packet rules, and connection restrictions.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "network.network"
   ],
   "tools": [
    "UFW",
    "nftables"
   ],
   "commands": [],
   "x": 0.9131,
   "y": 0.8333
  }
 ],
 "layout": {
  "w": 1440,
  "h": 660
 }
};
