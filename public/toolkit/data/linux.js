// Toolkit curriculum data: module "linux" (Linux & Systems Administration)
// Edit this file to change skills, labels, descriptions, prereqs, tools, commands or layout for this module only.
window.TOOLKIT_DATA = window.TOOLKIT_DATA || {};
window.TOOLKIT_DATA["linux"] = {
 "id": "linux",
 "num": "06",
 "glyph": "\u25a3",
 "name": "Linux & Systems Administration",
 "short": "LINUX",
 "slug": "linux",
 "desc": "Master the Linux command line, system administration, permissions, processes, networking, automation, and hardening.",
 "tools": [
  "Kali Linux",
  "Bash",
  "OpenSSH",
  "systemd",
  "iproute2",
  "GNU Core Utilities",
  "Python",
  "Lynis.",
  "APT sources",
  "GPG keys",
  "ufw",
  "nftables",
  "subprocess",
  "os",
  "pathlib",
  "System updates",
  "service configuration",
  "Lynis"
 ],
 "branches": [
  {
   "id": "linux.a",
   "letter": "A",
   "name": "CLI & FILE MANAGEMENT",
   "skills": [
    "linux.linux",
    "linux.fs",
    "linux.file",
    "linux.inspect",
    "linux.find",
    "linux.grep",
    "linux.pipe"
   ]
  },
  {
   "id": "linux.b",
   "letter": "B",
   "name": "PERMISSIONS & USER MANAGEMENT",
   "skills": [
    "linux.rwx",
    "linux.owner",
    "linux.users",
    "linux.sudo",
    "linux.acl",
    "linux.audit"
   ]
  },
  {
   "id": "linux.c",
   "letter": "C",
   "name": "PROCESSES & SERVICES",
   "skills": [
    "linux.ps",
    "linux.kill",
    "linux.systemd",
    "linux.logs",
    "linux.cron"
   ]
  },
  {
   "id": "linux.d",
   "letter": "D",
   "name": "PACKAGES & STORAGE",
   "skills": [
    "linux.apt",
    "linux.repo",
    "linux.disk",
    "linux.mount",
    "linux.tar"
   ]
  },
  {
   "id": "linux.e",
   "letter": "E",
   "name": "LINUX NETWORKING",
   "skills": [
    "linux.iface",
    "linux.ip",
    "linux.route",
    "linux.ports",
    "linux.dns",
    "linux.http",
    "linux.fw"
   ]
  },
  {
   "id": "linux.f",
   "letter": "F",
   "name": "SSH & REMOTE ADMINISTRATION",
   "skills": [
    "linux.ssh",
    "linux.keys",
    "linux.sftp",
    "linux.ssh-sec"
   ]
  },
  {
   "id": "linux.g",
   "letter": "G",
   "name": "BASH & AUTOMATION",
   "skills": [
    "linux.env",
    "linux.bash",
    "linux.if",
    "linux.loop",
    "linux.auto",
    "linux.py"
   ]
  },
  {
   "id": "linux.h",
   "letter": "H",
   "name": "LINUX SECURITY & HARDENING",
   "skills": [
    "linux.harden",
    "linux.ssh-audit",
    "linux.expose",
    "linux.perm-audit",
    "linux.lynis",
    "linux.backup"
   ]
  }
 ],
 "skills": [
  {
   "id": "linux.linux",
   "module": "linux",
   "branch": "linux.a",
   "branchLetter": "A",
   "name": "Linux CLI",
   "label": "linux",
   "desc": "Navigate and interact with Linux using the terminal.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [],
   "tools": [],
   "commands": [
    "pwd",
    "ls",
    "cd"
   ],
   "x": 0.5048,
   "y": 0.413
  },
  {
   "id": "linux.fs",
   "module": "linux",
   "branch": "linux.a",
   "branchLetter": "A",
   "name": "Filesystem Navigation",
   "label": "fs",
   "desc": "Understand the Linux directory structure and absolute versus relative paths.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [
    "linux.linux"
   ],
   "tools": [],
   "commands": [
    "/",
    "/home",
    "/etc",
    "/var",
    "tree"
   ],
   "x": 0.4927,
   "y": 0.367
  },
  {
   "id": "linux.file",
   "module": "linux",
   "branch": "linux.a",
   "branchLetter": "A",
   "name": "File Operations",
   "label": "file",
   "desc": "Create, copy, move, rename, and remove files and directories.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [
    "linux.fs"
   ],
   "tools": [],
   "commands": [
    "touch",
    "mkdir",
    "cp",
    "mv",
    "rm"
   ],
   "x": 0.5116,
   "y": 0.2894
  },
  {
   "id": "linux.inspect",
   "module": "linux",
   "branch": "linux.a",
   "branchLetter": "A",
   "name": "File Inspection",
   "label": "inspect",
   "desc": "Inspect file types, contents, metadata, and hidden files.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [
    "linux.file"
   ],
   "tools": [],
   "commands": [
    "cat",
    "less",
    "file",
    "stat",
    "ls -lah"
   ],
   "x": 0.4859,
   "y": 0.2435
  },
  {
   "id": "linux.find",
   "module": "linux",
   "branch": "linux.a",
   "branchLetter": "A",
   "name": "File Discovery",
   "label": "find",
   "desc": "Locate files, binaries, and configuration files across the system.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.inspect"
   ],
   "tools": [],
   "commands": [
    "find",
    "locate",
    "which",
    "whereis"
   ],
   "x": 0.5184,
   "y": 0.1659
  },
  {
   "id": "linux.grep",
   "module": "linux",
   "branch": "linux.a",
   "branchLetter": "A",
   "name": "Text Processing",
   "label": "grep",
   "desc": "Search, filter, extract, and manipulate text from files and command output.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.find"
   ],
   "tools": [],
   "commands": [
    "grep",
    "sed",
    "awk",
    "cut",
    "sort",
    "uniq",
    "wc"
   ],
   "x": 0.4791,
   "y": 0.1199
  },
  {
   "id": "linux.pipe",
   "module": "linux",
   "branch": "linux.a",
   "branchLetter": "A",
   "name": "Pipes & Redirection",
   "label": "pipe",
   "desc": "Connect commands and redirect standard output, append output, and handle errors.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.grep"
   ],
   "tools": [],
   "commands": [
    "|",
    ">",
    ">>",
    "2>",
    "tee"
   ],
   "x": 0.5252,
   "y": 0.0423
  },
  {
   "id": "linux.rwx",
   "module": "linux",
   "branch": "linux.b",
   "branchLetter": "B",
   "name": "Linux Permissions",
   "label": "rwx",
   "desc": "Understand read, write, and execute permissions for users, groups, and others.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [],
   "tools": [],
   "commands": [
    "chmod",
    "ls -l"
   ],
   "x": 0.5675,
   "y": 0.4448
  },
  {
   "id": "linux.owner",
   "module": "linux",
   "branch": "linux.b",
   "branchLetter": "B",
   "name": "Ownership Management",
   "label": "owner",
   "desc": "Change and inspect file and directory ownership.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.rwx"
   ],
   "tools": [],
   "commands": [
    "chown",
    "chgrp"
   ],
   "x": 0.5843,
   "y": 0.3969
  },
  {
   "id": "linux.users",
   "module": "linux",
   "branch": "linux.b",
   "branchLetter": "B",
   "name": "Users & Groups",
   "label": "users",
   "desc": "Create, inspect, and manage local Linux user accounts and groups.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.owner"
   ],
   "tools": [],
   "commands": [
    "id",
    "whoami",
    "groups",
    "useradd",
    "usermod"
   ],
   "x": 0.6633,
   "y": 0.3665
  },
  {
   "id": "linux.sudo",
   "module": "linux",
   "branch": "linux.b",
   "branchLetter": "B",
   "name": "Sudo & Privileges",
   "label": "sudo",
   "desc": "Understand administrative privileges and controlled privilege escalation.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.users"
   ],
   "tools": [],
   "commands": [
    "sudo",
    "sudo -l",
    "visudo"
   ],
   "x": 0.6626,
   "y": 0.3011
  },
  {
   "id": "linux.acl",
   "module": "linux",
   "branch": "linux.b",
   "branchLetter": "B",
   "name": "ACLs & Capabilities",
   "label": "acl",
   "desc": "Understand advanced file access permissions and Linux process capabilities.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "linux.sudo"
   ],
   "tools": [],
   "commands": [
    "getfacl",
    "setfacl",
    "getcap",
    "setcap"
   ],
   "x": 0.7591,
   "y": 0.2882
  },
  {
   "id": "linux.audit",
   "module": "linux",
   "branch": "linux.b",
   "branchLetter": "B",
   "name": "Privilege Boundary Auditing",
   "label": "audit",
   "desc": "Inspect how users, services, and processes receive permissions and identify unnecessarily broad privileges.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "linux.acl"
   ],
   "tools": [],
   "commands": [
    "namei",
    "getcap",
    "sudo",
    "Linux auditing utilities"
   ],
   "x": 0.741,
   "y": 0.2053
  },
  {
   "id": "linux.ps",
   "module": "linux",
   "branch": "linux.c",
   "branchLetter": "C",
   "name": "Process Management",
   "label": "ps",
   "desc": "Understand running processes, process IDs, and system resource usage.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [],
   "tools": [],
   "commands": [
    "ps",
    "top",
    "htop"
   ],
   "x": 0.5862,
   "y": 0.5126
  },
  {
   "id": "linux.kill",
   "module": "linux",
   "branch": "linux.c",
   "branchLetter": "C",
   "name": "Process Control",
   "label": "kill",
   "desc": "Start, stop, signal, and manage running processes.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.ps"
   ],
   "tools": [],
   "commands": [
    "kill",
    "pkill",
    "pgrep",
    "nice"
   ],
   "x": 0.6318,
   "y": 0.4808
  },
  {
   "id": "linux.systemd",
   "module": "linux",
   "branch": "linux.c",
   "branchLetter": "C",
   "name": "Service Management",
   "label": "systemd",
   "desc": "Manage background services and understand how Linux initializes them.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.kill"
   ],
   "tools": [],
   "commands": [
    "systemctl",
    "systemd"
   ],
   "x": 0.7087,
   "y": 0.5305
  },
  {
   "id": "linux.logs",
   "module": "linux",
   "branch": "linux.c",
   "branchLetter": "C",
   "name": "System Logs",
   "label": "logs",
   "desc": "Inspect system events, service messages, and troubleshooting information.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.systemd"
   ],
   "tools": [],
   "commands": [
    "journalctl",
    "/var/log",
    "dmesg"
   ],
   "x": 0.7542,
   "y": 0.4629
  },
  {
   "id": "linux.cron",
   "module": "linux",
   "branch": "linux.c",
   "branchLetter": "C",
   "name": "Scheduled Tasks",
   "label": "cron",
   "desc": "Automate recurring tasks and understand Linux scheduling.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.logs"
   ],
   "tools": [],
   "commands": [
    "cron",
    "crontab",
    "systemd timers"
   ],
   "x": 0.8311,
   "y": 0.5484
  },
  {
   "id": "linux.apt",
   "module": "linux",
   "branch": "linux.d",
   "branchLetter": "D",
   "name": "Package Management",
   "label": "apt",
   "desc": "Install, update, remove, and inspect software packages.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [],
   "tools": [],
   "commands": [
    "apt",
    "dpkg"
   ],
   "x": 0.5581,
   "y": 0.5649
  },
  {
   "id": "linux.repo",
   "module": "linux",
   "branch": "linux.d",
   "branchLetter": "D",
   "name": "Repository Management",
   "label": "repo",
   "desc": "Understand software repositories, package sources, and package trust.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.apt"
   ],
   "tools": [
    "APT sources",
    "GPG keys"
   ],
   "commands": [],
   "x": 0.5992,
   "y": 0.5888
  },
  {
   "id": "linux.disk",
   "module": "linux",
   "branch": "linux.d",
   "branchLetter": "D",
   "name": "Disk Management",
   "label": "disk",
   "desc": "Inspect storage devices, partitions, and available disk space.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.repo"
   ],
   "tools": [],
   "commands": [
    "lsblk",
    "fdisk",
    "df",
    "du"
   ],
   "x": 0.6407,
   "y": 0.6571
  },
  {
   "id": "linux.mount",
   "module": "linux",
   "branch": "linux.d",
   "branchLetter": "D",
   "name": "Mounting & Filesystems",
   "label": "mount",
   "desc": "Understand how Linux mounts storage devices and manages filesystems.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.disk"
   ],
   "tools": [],
   "commands": [
    "mount",
    "umount",
    "findmnt"
   ],
   "x": 0.6914,
   "y": 0.6714
  },
  {
   "id": "linux.tar",
   "module": "linux",
   "branch": "linux.d",
   "branchLetter": "D",
   "name": "Archives & Checksums",
   "label": "tar",
   "desc": "Compress, extract, and verify files using cryptographic checksums.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.mount"
   ],
   "tools": [],
   "commands": [
    "tar",
    "gzip",
    "zip",
    "sha256sum"
   ],
   "x": 0.7233,
   "y": 0.7493
  },
  {
   "id": "linux.iface",
   "module": "linux",
   "branch": "linux.e",
   "branchLetter": "E",
   "name": "Network Interfaces",
   "label": "iface",
   "desc": "Inspect network adapters, interface states, and assigned addresses.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [],
   "tools": [],
   "commands": [
    "ip link",
    "ip addr"
   ],
   "x": 0.4913,
   "y": 0.5867
  },
  {
   "id": "linux.ip",
   "module": "linux",
   "branch": "linux.e",
   "branchLetter": "E",
   "name": "IP Addressing",
   "label": "ip",
   "desc": "Understand IPv4, IPv6, subnet masks, and CIDR notation.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.iface"
   ],
   "tools": [],
   "commands": [
    "ip addr",
    "CIDR notation"
   ],
   "x": 0.5133,
   "y": 0.6325
  },
  {
   "id": "linux.route",
   "module": "linux",
   "branch": "linux.e",
   "branchLetter": "E",
   "name": "Routing & Gateways",
   "label": "route",
   "desc": "Understand routing tables, default gateways, and network paths.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.ip"
   ],
   "tools": [],
   "commands": [
    "ip route",
    "ip neigh"
   ],
   "x": 0.4789,
   "y": 0.7098
  },
  {
   "id": "linux.ports",
   "module": "linux",
   "branch": "linux.e",
   "branchLetter": "E",
   "name": "Ports & Sockets",
   "label": "ports",
   "desc": "Identify listening ports and active network connections.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.route"
   ],
   "tools": [],
   "commands": [
    "ss",
    "lsof",
    "netstat"
   ],
   "x": 0.5257,
   "y": 0.7556
  },
  {
   "id": "linux.dns",
   "module": "linux",
   "branch": "linux.e",
   "branchLetter": "E",
   "name": "DNS Resolution",
   "label": "dns",
   "desc": "Understand DNS records and how domain names resolve to IP addresses.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.ports"
   ],
   "tools": [],
   "commands": [
    "dig",
    "nslookup",
    "getent"
   ],
   "x": 0.4666,
   "y": 0.833
  },
  {
   "id": "linux.http",
   "module": "linux",
   "branch": "linux.e",
   "branchLetter": "E",
   "name": "HTTP & HTTPS",
   "label": "http",
   "desc": "Inspect HTTP requests, responses, headers, and TLS connections.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.dns"
   ],
   "tools": [],
   "commands": [
    "curl",
    "wget",
    "openssl"
   ],
   "x": 0.538,
   "y": 0.8788
  },
  {
   "id": "linux.fw",
   "module": "linux",
   "branch": "linux.e",
   "branchLetter": "E",
   "name": "Firewall Management",
   "label": "fw",
   "desc": "Understand and manage inbound and outbound network traffic rules.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "linux.http"
   ],
   "tools": [
    "ufw",
    "nftables"
   ],
   "commands": [],
   "x": 0.4542,
   "y": 0.9561
  },
  {
   "id": "linux.ssh",
   "module": "linux",
   "branch": "linux.f",
   "branchLetter": "F",
   "name": "SSH Fundamentals",
   "label": "ssh",
   "desc": "Connect to remote Linux machines securely.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [],
   "tools": [],
   "commands": [
    "ssh"
   ],
   "x": 0.4301,
   "y": 0.5521
  },
  {
   "id": "linux.keys",
   "module": "linux",
   "branch": "linux.f",
   "branchLetter": "F",
   "name": "SSH Key Authentication",
   "label": "keys",
   "desc": "Generate and use public and private key pairs for authentication.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.ssh"
   ],
   "tools": [],
   "commands": [
    "ssh-keygen",
    "ssh-agent"
   ],
   "x": 0.4204,
   "y": 0.6068
  },
  {
   "id": "linux.sftp",
   "module": "linux",
   "branch": "linux.f",
   "branchLetter": "F",
   "name": "Secure File Transfer",
   "label": "sftp",
   "desc": "Transfer files between systems using encrypted connections.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.keys"
   ],
   "tools": [],
   "commands": [
    "scp",
    "sftp",
    "rsync"
   ],
   "x": 0.3309,
   "y": 0.626
  },
  {
   "id": "linux.ssh-sec",
   "module": "linux",
   "branch": "linux.f",
   "branchLetter": "F",
   "name": "SSH Hardening",
   "label": "ssh-sec",
   "desc": "Configure secure SSH access and understand authentication restrictions.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "linux.sftp"
   ],
   "tools": [],
   "commands": [
    "sshd_config",
    "sshd -t"
   ],
   "x": 0.3465,
   "y": 0.706
  },
  {
   "id": "linux.env",
   "module": "linux",
   "branch": "linux.g",
   "branchLetter": "G",
   "name": "Environment Variables",
   "label": "env",
   "desc": "Understand environment variables, shell configuration, and PATH.",
   "difficulty": "foundation",
   "xp": 25,
   "pre": [],
   "tools": [],
   "commands": [
    "env",
    "export",
    "$PATH"
   ],
   "x": 0.413,
   "y": 0.4952
  },
  {
   "id": "linux.bash",
   "module": "linux",
   "branch": "linux.g",
   "branchLetter": "G",
   "name": "Bash Fundamentals",
   "label": "bash",
   "desc": "Write and execute shell scripts using variables and arguments.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.env"
   ],
   "tools": [
    "Bash"
   ],
   "commands": [],
   "x": 0.367,
   "y": 0.5073
  },
  {
   "id": "linux.if",
   "module": "linux",
   "branch": "linux.g",
   "branchLetter": "G",
   "name": "Conditional Logic",
   "label": "if",
   "desc": "Make scripts execute different actions depending on specified conditions.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.bash"
   ],
   "tools": [],
   "commands": [
    "if",
    "else",
    "elif",
    "case"
   ],
   "x": 0.2894,
   "y": 0.4884
  },
  {
   "id": "linux.loop",
   "module": "linux",
   "branch": "linux.g",
   "branchLetter": "G",
   "name": "Loops & Functions",
   "label": "loop",
   "desc": "Automate repetitive tasks using loops and reusable functions.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.if"
   ],
   "tools": [],
   "commands": [
    "for",
    "while",
    "functions"
   ],
   "x": 0.2435,
   "y": 0.5141
  },
  {
   "id": "linux.auto",
   "module": "linux",
   "branch": "linux.g",
   "branchLetter": "G",
   "name": "Command Automation",
   "label": "auto",
   "desc": "Chain Linux tools to create repeatable administrative workflows.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "linux.loop"
   ],
   "tools": [],
   "commands": [
    "Pipes",
    "xargs",
    "find"
   ],
   "x": 0.1659,
   "y": 0.4816
  },
  {
   "id": "linux.py",
   "module": "linux",
   "branch": "linux.g",
   "branchLetter": "G",
   "name": "Python for Linux",
   "label": "py",
   "desc": "Use Python to automate system tasks and process command output.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "linux.auto"
   ],
   "tools": [
    "Python",
    "subprocess",
    "os",
    "pathlib"
   ],
   "commands": [],
   "x": 0.1199,
   "y": 0.5209
  },
  {
   "id": "linux.harden",
   "module": "linux",
   "branch": "linux.h",
   "branchLetter": "H",
   "name": "System Hardening",
   "label": "harden",
   "desc": "Reduce the attack surface through secure configuration and system maintenance.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [],
   "tools": [
    "System updates",
    "service configuration"
   ],
   "commands": [],
   "x": 0.4448,
   "y": 0.4325
  },
  {
   "id": "linux.ssh-audit",
   "module": "linux",
   "branch": "linux.h",
   "branchLetter": "H",
   "name": "SSH Security Audit",
   "label": "ssh-audit",
   "desc": "Review SSH settings and identify weak remote access configurations.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "linux.harden"
   ],
   "tools": [],
   "commands": [
    "sshd -T",
    "sshd -t"
   ],
   "x": 0.3969,
   "y": 0.4157
  },
  {
   "id": "linux.expose",
   "module": "linux",
   "branch": "linux.h",
   "branchLetter": "H",
   "name": "Service Exposure Audit",
   "label": "expose",
   "desc": "Identify unnecessary running services and exposed listening ports.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "linux.ssh-audit"
   ],
   "tools": [],
   "commands": [
    "systemctl",
    "ss -tulpn"
   ],
   "x": 0.3665,
   "y": 0.3367
  },
  {
   "id": "linux.perm-audit",
   "module": "linux",
   "branch": "linux.h",
   "branchLetter": "H",
   "name": "Permission Auditing",
   "label": "perm-audit",
   "desc": "Identify files and directories with overly broad access permissions.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "linux.expose"
   ],
   "tools": [],
   "commands": [
    "find",
    "getfacl",
    "namei"
   ],
   "x": 0.3011,
   "y": 0.3374
  },
  {
   "id": "linux.lynis",
   "module": "linux",
   "branch": "linux.h",
   "branchLetter": "H",
   "name": "Linux Security Auditing",
   "label": "lynis",
   "desc": "Review system configurations and identify potential security weaknesses.",
   "difficulty": "advanced",
   "xp": 75,
   "pre": [
    "linux.perm-audit"
   ],
   "tools": [
    "Lynis"
   ],
   "commands": [],
   "x": 0.2882,
   "y": 0.2409
  },
  {
   "id": "linux.backup",
   "module": "linux",
   "branch": "linux.h",
   "branchLetter": "H",
   "name": "Backup & Recovery",
   "label": "backup",
   "desc": "Create backups and understand basic restoration and recovery procedures.",
   "difficulty": "intermediate",
   "xp": 50,
   "pre": [
    "linux.lynis"
   ],
   "tools": [],
   "commands": [
    "tar",
    "rsync",
    "checksums"
   ],
   "x": 0.2053,
   "y": 0.259
  }
 ],
 "layout": {
  "w": 2020,
  "h": 2020
 }
};
