window.QUIZ_BANK = [
  {
    "q": "Which command lists files in a directory, including hidden ones?",
    "opts": [
      "ls -a",
      "ls -l",
      "dir -h",
      "show --all"
    ],
    "a": 0,
    "why": "-a shows all entries, including dotfiles. -l only changes the format to a long listing.",
    "level": "beginner",
    "topic": "Linux & Systems"
  },
  {
    "q": "What does <code>chmod 755 script.sh</code> do?",
    "opts": [
      "Owner: read/write/execute, group and others: read/execute",
      "Everyone gets full permissions",
      "Owner read-only, others execute",
      "Deletes write permission for everyone"
    ],
    "a": 0,
    "why": "7 = rwx for the owner, 5 = r-x for group and others. A common setting for scripts.",
    "level": "intermediate",
    "topic": "Linux & Systems"
  },
  {
    "q": "How do you search for the word \"error\" inside syslog, case-insensitive?",
    "opts": [
      "grep -i \"error\" /var/log/syslog",
      "find \"error\" syslog",
      "cat syslog | error",
      "search -i error syslog"
    ],
    "a": 0,
    "why": "grep filters text; -i makes it case-insensitive. find selects filesystem entries; by itself it does not search their text.",
    "level": "beginner",
    "topic": "Linux & Systems"
  },
  {
    "q": "Which command shows running processes in a live, updating view?",
    "opts": [
      "top",
      "ps --once",
      "ls /proc -f",
      "jobs -l"
    ],
    "a": 0,
    "why": "top refreshes continuously. ps shows a single snapshot; jobs reports jobs managed by the current shell.",
    "level": "beginner",
    "topic": "Linux & Systems"
  },
  {
    "q": "What does <code>sudo !!</code> do?",
    "opts": [
      "Re-runs the previous command through sudo",
      "Cancels the last command",
      "Prints the sudo version",
      "Opens the sudoers file"
    ],
    "a": 0,
    "why": "In an interactive Bash shell with history expansion enabled, !! expands to the previous command. Check the expanded command before running it with sudo.",
    "level": "intermediate",
    "topic": "Linux & Systems"
  },
  {
    "q": "How do you send a command's output into a file, replacing its contents?",
    "opts": [
      "command > file.txt",
      "command | file.txt",
      "command >> file.txt",
      "command < file.txt"
    ],
    "a": 0,
    "why": "> overwrites, >> appends, | pipes to another command, < reads input from a file.",
    "level": "beginner",
    "topic": "Linux & Systems"
  },
  {
    "q": "Which command asks process 4321 to terminate?",
    "opts": [
      "kill 4321",
      "stop 4321",
      "ps -k 4321",
      "endproc 4321"
    ],
    "a": 0,
    "why": "kill sends SIGTERM by default. The process can handle or ignore it. SIGKILL is a last resort because it prevents normal cleanup.",
    "level": "intermediate",
    "topic": "Linux & Systems"
  },
  {
    "q": "What does <code>df -h</code> show?",
    "opts": [
      "Disk space usage per filesystem, human-readable",
      "Memory usage",
      "Open files",
      "Directory sizes"
    ],
    "a": 0,
    "why": "df reports mounted filesystem space; -h prints sizes as MB/GB. du is the one for directory sizes.",
    "level": "beginner",
    "topic": "Linux & Systems"
  },
  {
    "q": "How do you copy a folder \"logs\" (and its contents) to /backup?",
    "opts": [
      "cp -r logs /backup",
      "cp logs /backup",
      "mv logs /backup",
      "copy -all logs /backup"
    ],
    "a": 0,
    "why": "cp needs -r for directories. mv would move it instead of copying.",
    "level": "beginner",
    "topic": "Linux & Systems"
  },
  {
    "q": "What does <code>systemctl status ssh</code> tell you?",
    "opts": [
      "The SSH service state, plus recent log lines",
      "Your SSH keys",
      "Open SSH connections",
      "The SSH config file"
    ],
    "a": 0,
    "why": "On systems using systemd with a unit named ssh, this shows its state and recent logs. Some distributions call the unit sshd instead.",
    "level": "intermediate",
    "topic": "Linux & Systems"
  },
  {
    "topic": "Recon & Enumeration",
    "level": "beginner",
    "q": "In Nmap output, what does an open port mean?",
    "opts": [
      "An application is accepting connections or packets there",
      "The host is definitely compromised",
      "The service has no password",
      "The port can never be firewalled"
    ],
    "a": 0,
    "why": "Open describes an observed service state. It is not proof of a vulnerability.",
    "source": "https://nmap.org/book/port-scanning.html"
  },
  {
    "topic": "Recon & Enumeration",
    "level": "beginner",
    "q": "What does a closed port usually indicate?",
    "opts": [
      "The port is reachable, but no application is listening",
      "The target must be offline",
      "Nmap found a password",
      "Every packet was filtered"
    ],
    "a": 0,
    "why": "Closed ports respond to probes but have no listener for that port.",
    "source": "https://nmap.org/book/port-scanning.html"
  },
  {
    "topic": "Recon & Enumeration",
    "level": "intermediate",
    "q": "Why can a port look open from one network and filtered from another?",
    "opts": [
      "Filtering and the network path affect what Nmap observes",
      "A port state can never differ",
      "Only the scanner clock matters",
      "Open means universally reachable"
    ],
    "a": 0,
    "why": "Nmap states describe its view from a particular scan location and technique.",
    "source": "https://nmap.org/book/port-scanning.html"
  },
  {
    "topic": "Recon & Enumeration",
    "level": "intermediate",
    "q": "What does open|filtered mean?",
    "opts": [
      "The scan cannot distinguish open from filtered",
      "The port is confirmed open",
      "The service is confirmed safe",
      "The host is definitely down"
    ],
    "a": 0,
    "why": "Some scan types get no response both from an open port and from filtering, so the result remains uncertain.",
    "source": "https://nmap.org/book/port-scanning.html"
  },
  {
    "topic": "Web & API Security",
    "level": "beginner",
    "q": "What is SQL injection?",
    "opts": [
      "Untrusted data changes the structure or logic of a SQL query",
      "Any slow SQL query",
      "A database backup",
      "A browser caching issue"
    ],
    "a": 0,
    "why": "Injection happens when data is interpreted as part of SQL syntax.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
  },
  {
    "topic": "Web & API Security",
    "level": "beginner",
    "q": "Which database account is safer for a read-only feature?",
    "opts": [
      "One with only the required read permissions",
      "A database administrator account",
      "A shared root account",
      "Any account with the longest password"
    ],
    "a": 0,
    "why": "Least privilege limits the damage if the feature is compromised.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
  },
  {
    "topic": "Web & API Security",
    "level": "intermediate",
    "q": "Which is the preferred way to include a user-provided value in SQL?",
    "opts": [
      "A parameterized query with bound values",
      "String concatenation",
      "Removing only quote characters",
      "Trusting values from another API"
    ],
    "a": 0,
    "why": "Keep SQL structure separate from data values with parameter binding.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
  },
  {
    "topic": "Web & API Security",
    "level": "intermediate",
    "q": "How should a user-selectable SQL sort direction be handled?",
    "opts": [
      "Map it to a strict allow-list of fixed choices",
      "Append the raw text to SQL",
      "Base64-encode it and append it",
      "Assume all query structure can be bound as a value"
    ],
    "a": 0,
    "why": "Structural choices such as ASC or DESC need fixed application-owned choices, rather than raw user text.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
  },
  {
    "topic": "Identity & Authentication",
    "level": "beginner",
    "q": "What does authentication establish?",
    "opts": [
      "An identity",
      "Permission for every action",
      "A secure network path",
      "A vulnerability score"
    ],
    "a": 0,
    "why": "Authentication verifies identity. Authorization checks whether a particular action is allowed.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
  },
  {
    "topic": "Identity & Authentication",
    "level": "beginner",
    "q": "Does a successful login authorize every action?",
    "opts": [
      "No, access still needs authorization checks",
      "Yes, login grants administrator rights",
      "Only if HTTPS is used",
      "Only with a long password"
    ],
    "a": 0,
    "why": "A logged-in user may still be forbidden from accessing another user's data.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
  },
  {
    "topic": "Identity & Authentication",
    "level": "intermediate",
    "q": "Which is suitable for storing application passwords?",
    "opts": [
      "A dedicated password-hashing algorithm such as Argon2id",
      "Plain text",
      "Reversible Base64",
      "A fast unsalted SHA-256 hash alone"
    ],
    "a": 0,
    "why": "Use a dedicated password hash with an appropriate cost and a unique salt, not plaintext or a fast general-purpose hash.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
  },
  {
    "topic": "Identity & Authentication",
    "level": "intermediate",
    "q": "What is a password salt for?",
    "opts": [
      "Making each password hash distinct to resist precomputed attacks",
      "Keeping passwords recoverable",
      "Replacing a password entirely",
      "Making all users share a hash"
    ],
    "a": 0,
    "why": "A unique salt defeats reuse of precomputed hash tables. It does not need to be secret.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
  },
  {
    "topic": "Network & Traffic",
    "level": "beginner",
    "q": "What does a Wireshark display filter do?",
    "opts": [
      "Controls which captured packets are shown",
      "Deletes matching packets from the network",
      "Blocks a remote host",
      "Changes packets in transit"
    ],
    "a": 0,
    "why": "A display filter selects packets for viewing; it is not a firewall.",
    "source": "https://www.wireshark.org/docs/man-pages/wireshark-filter.html"
  },
  {
    "topic": "Network & Traffic",
    "level": "beginner",
    "q": "Which display filter tests for the IP protocol?",
    "opts": [
      "ip",
      "show ip now",
      "protocol = all",
      "capture-ip"
    ],
    "a": 0,
    "why": "A protocol or field name alone tests whether it exists in a packet.",
    "source": "https://www.wireshark.org/docs/man-pages/wireshark-filter.html"
  },
  {
    "topic": "Network & Traffic",
    "level": "intermediate",
    "q": "Are capture-filter and display-filter syntax interchangeable?",
    "opts": [
      "No, they use different syntax",
      "Yes, always",
      "Only if the capture has TCP",
      "Only with administrator permissions"
    ],
    "a": 0,
    "why": "Wireshark documents display filtering separately from pcap capture-filter syntax.",
    "source": "https://www.wireshark.org/docs/man-pages/wireshark-filter.html"
  },
  {
    "topic": "Network & Traffic",
    "level": "intermediate",
    "q": "What does == mean in a Wireshark display filter?",
    "opts": [
      "Equality comparison",
      "Assignment to a packet field",
      "Delete a field",
      "Start a new capture"
    ],
    "a": 0,
    "why": "The == operator compares a field against a value; it does not edit packets.",
    "source": "https://www.wireshark.org/docs/man-pages/wireshark-filter.html"
  },
  {
    "topic": "Vulnerability Assessment",
    "level": "beginner",
    "q": "An automated tool flags a possible vulnerability. What next?",
    "opts": [
      "Validate it within the approved scope before reporting it as confirmed",
      "Report it as proven immediately",
      "Publish all captured data",
      "Assume every alert is false"
    ],
    "a": 0,
    "why": "Tool output is a lead, not proof. Validate the finding and its impact safely.",
    "source": "https://wstg.owasp.org/latest/3-The_OWASP_Testing_Framework/2-Human-AI_Collaborative_Testing/"
  },
  {
    "topic": "Vulnerability Assessment",
    "level": "beginner",
    "q": "Who sets the scope of a security test?",
    "opts": [
      "The authorized testing agreement and responsible people",
      "The scanner alone",
      "Any public search result",
      "The largest list of targets available"
    ],
    "a": 0,
    "why": "Tools cannot grant permission or expand the rules of engagement.",
    "source": "https://wstg.owasp.org/latest/3-The_OWASP_Testing_Framework/2-Human-AI_Collaborative_Testing/"
  },
  {
    "topic": "Vulnerability Assessment",
    "level": "intermediate",
    "q": "Why combine manual review with automated triage?",
    "opts": [
      "Tools can miss context or produce false positives",
      "Manual review guarantees every issue is found",
      "Automation makes scope irrelevant",
      "A tool score is always a business priority"
    ],
    "a": 0,
    "why": "Human review checks evidence, intended behavior and impact before treating output as a finding.",
    "source": "https://wstg.owasp.org/latest/3-The_OWASP_Testing_Framework/2-Human-AI_Collaborative_Testing/"
  },
  {
    "topic": "Vulnerability Assessment",
    "level": "intermediate",
    "q": "An AI-generated finding has no reproducible evidence. How should it be handled?",
    "opts": [
      "Keep it unconfirmed and validate it before reporting",
      "Increase its severity",
      "Invent reproduction steps",
      "Treat fluent wording as proof"
    ],
    "a": 0,
    "why": "AI output can be wrong. Findings need validation, not confidence based on wording.",
    "source": "https://wstg.owasp.org/latest/3-The_OWASP_Testing_Framework/2-Human-AI_Collaborative_Testing/"
  },
  {
    "topic": "Privacy & Secure Operations",
    "level": "beginner",
    "q": "Does Tor Browser automatically protect every app on your computer?",
    "opts": [
      "No, apps must be configured to use Tor",
      "Yes, all network traffic is covered",
      "Only when a tab is closed",
      "Only after clearing cookies"
    ],
    "a": 0,
    "why": "Tor protects applications configured to route their traffic through it, not the whole computer by default.",
    "source": "https://support.torproject.org/tor-browser/security/using-tb-safely/"
  },
  {
    "topic": "Privacy & Secure Operations",
    "level": "beginner",
    "q": "Can signing into your personal account identify you to a site over Tor?",
    "opts": [
      "Yes, the account can identify you",
      "No, Tor removes account identities",
      "Only on mobile",
      "Only without a VPN"
    ],
    "a": 0,
    "why": "Tor can hide the network address while the account still tells the site who you are.",
    "source": "https://support.torproject.org/tor-browser/security/using-tb-safely/"
  },
  {
    "topic": "Privacy & Secure Operations",
    "level": "intermediate",
    "q": "Why still use HTTPS when browsing through Tor?",
    "opts": [
      "Encryption to the destination site still depends on HTTPS",
      "Tor makes HTTPS unnecessary",
      "HTTPS prevents every phishing attack",
      "HTTPS hides everything from the destination"
    ],
    "a": 0,
    "why": "Tor encrypts traffic inside its network. HTTPS protects the connection to a supporting destination site.",
    "source": "https://support.torproject.org/tor-browser/security/using-tb-safely/"
  },
  {
    "topic": "Privacy & Secure Operations",
    "level": "intermediate",
    "q": "Why be cautious opening downloaded documents in an external app?",
    "opts": [
      "The app may fetch network resources outside Tor",
      "All documents are always malicious",
      "External apps cannot access the internet",
      "PDF files reveal every saved password"
    ],
    "a": 0,
    "why": "External document handlers may make direct connections and expose a non-Tor address.",
    "source": "https://support.torproject.org/tor-browser/security/using-tb-safely/"
  },
  {
    "topic": "Automation & Security Engineering",
    "level": "beginner",
    "q": "Which should not be written directly into application logs?",
    "opts": [
      "Authentication passwords and access tokens",
      "A generic error category",
      "An event timestamp",
      "A non-sensitive event identifier"
    ],
    "a": 0,
    "why": "Logs can leak secrets. Remove or mask passwords, tokens and other sensitive data.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
  },
  {
    "topic": "Automation & Security Engineering",
    "level": "beginner",
    "q": "Why log authentication failures?",
    "opts": [
      "To help detect suspicious patterns and investigate incidents",
      "To store the attempted password for later reuse",
      "To replace access controls",
      "To guarantee no account is compromised"
    ],
    "a": 0,
    "why": "Failure events support monitoring and investigation, but the submitted secret should not be logged.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
  },
  {
    "topic": "Automation & Security Engineering",
    "level": "intermediate",
    "q": "Why sanitize untrusted text before putting it into logs?",
    "opts": [
      "It may contain line breaks that forge apparent log entries",
      "It always changes the server clock",
      "It replaces encryption",
      "It makes passwords public by design"
    ],
    "a": 0,
    "why": "Log injection can insert misleading records. Validate, sanitize and encode untrusted event data.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
  },
  {
    "topic": "Automation & Security Engineering",
    "level": "intermediate",
    "q": "Should an unexpected invalid input alone prove an attack?",
    "opts": [
      "No, evaluate repetition and surrounding context",
      "Yes, every invalid input is malicious",
      "Only if the input is short",
      "Only if the request uses HTTPS"
    ],
    "a": 0,
    "why": "Client defects and mistakes can also cause invalid input. Correlate events instead of treating one signal as proof.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
  },
  {
    "topic": "Linux & Systems",
    "level": "beginner",
    "q": "What is grep primarily used for?",
    "opts": [
      "Printing lines that match a text pattern",
      "Changing file permissions",
      "Creating user accounts",
      "Showing free disk space"
    ],
    "a": 0,
    "why": "grep searches input and prints matching lines by default.",
    "source": "https://man7.org/linux/man-pages/man1/grep.1.html"
  },
  {
    "topic": "Linux & Systems",
    "level": "beginner",
    "q": "Which permission letter means write?",
    "opts": [
      "w",
      "r",
      "x",
      "s"
    ],
    "a": 0,
    "why": "Basic permission letters are r for read, w for write and x for execute or directory search.",
    "source": "https://man7.org/linux/man-pages/man1/chmod.1.html"
  },
  {
    "topic": "Linux & Systems",
    "level": "intermediate",
    "q": "What does chmod u+x script.sh add?",
    "opts": [
      "Execute permission for the owner",
      "Write permission for everyone",
      "Read permission for the group only",
      "A new user account"
    ],
    "a": 0,
    "why": "u selects the owner, + adds a permission and x is execute.",
    "source": "https://man7.org/linux/man-pages/man1/chmod.1.html"
  },
  {
    "topic": "Linux & Systems",
    "level": "intermediate",
    "q": "In a numeric file mode, what does the digit 6 represent?",
    "opts": [
      "Read and write",
      "Read and execute",
      "Write and execute",
      "Execute only"
    ],
    "a": 0,
    "why": "Read is 4, write is 2 and execute is 1. 6 = 4 + 2.",
    "source": "https://man7.org/linux/man-pages/man1/chmod.1.html"
  },
  {
    "topic": "Recon & Enumeration",
    "level": "beginner",
    "q": "Does finding an open port prove a security flaw?",
    "opts": [
      "No, it shows a service is available from that scan",
      "Yes, every listener is exploitable",
      "Yes, if the port is TCP",
      "No, because open ports are always safe"
    ],
    "a": 0,
    "why": "An open port is an exposed service, not proof of an exploitable weakness.",
    "source": "https://nmap.org/book/port-scanning.html"
  },
  {
    "topic": "Recon & Enumeration",
    "level": "beginner",
    "q": "What does filtered tell you about a port?",
    "opts": [
      "Filtering prevents Nmap from determining whether it is open",
      "It has a confirmed listener",
      "It has no listener",
      "It requires a password"
    ],
    "a": 0,
    "why": "Filtering limits what the scan can determine. Do not turn uncertainty into an open or closed verdict.",
    "source": "https://nmap.org/book/port-scanning.html"
  },
  {
    "topic": "Recon & Enumeration",
    "level": "intermediate",
    "q": "Which Nmap state is specifically associated with ACK scans?",
    "opts": [
      "unfiltered",
      "authenticated",
      "patched",
      "encrypted"
    ],
    "a": 0,
    "why": "An ACK scan may show that a port is reachable but cannot decide whether it is open or closed.",
    "source": "https://nmap.org/book/port-scanning.html"
  },
  {
    "topic": "Recon & Enumeration",
    "level": "intermediate",
    "q": "A port is unfiltered in an ACK scan. Can you conclude a service is listening?",
    "opts": [
      "No, both open and closed ports can return the relevant response",
      "Yes, every unfiltered port has a listener",
      "Only for port 443",
      "Only if DNS resolves"
    ],
    "a": 0,
    "why": "Unfiltered means accessible to the ACK probe, not confirmed open.",
    "source": "https://nmap.org/book/port-scanning.html"
  },
  {
    "topic": "Web & API Security",
    "level": "beginner",
    "q": "Can data from another API cause SQL injection if concatenated into SQL?",
    "opts": [
      "Yes, external API data is still untrusted",
      "No, APIs guarantee safe SQL",
      "Only if it is JSON",
      "Only on a public network"
    ],
    "a": 0,
    "why": "The source of the data does not make raw SQL concatenation safe.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
  },
  {
    "topic": "Web & API Security",
    "level": "beginner",
    "q": "Why avoid giving the application a database administrator account?",
    "opts": [
      "A compromised app could do more damage",
      "Administrator accounts cannot use SQL",
      "Read queries require root access",
      "It automatically encrypts every query"
    ],
    "a": 0,
    "why": "Give each database account only the rights its feature needs.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
  },
  {
    "topic": "Web & API Security",
    "level": "intermediate",
    "q": "Can parameter binding generally replace a dynamic table name?",
    "opts": [
      "No, map table choices to fixed allowed identifiers",
      "Yes, placeholders work for every SQL syntax element",
      "Only if Base64-encoded",
      "Only when using HTTPS"
    ],
    "a": 0,
    "why": "Parameters represent data values. Dynamic SQL structure needs fixed application-owned choices.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
  },
  {
    "topic": "Web & API Security",
    "level": "intermediate",
    "q": "Should previously stored user data be trusted when building a new SQL query?",
    "opts": [
      "No, bind it as data again",
      "Yes, storage makes it trusted",
      "Only if it is shorter than 20 characters",
      "Only if it has no spaces"
    ],
    "a": 0,
    "why": "Stored data can still contain malicious syntax. Keep structure and values separate on every use.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"
  },
  {
    "topic": "Identity & Authentication",
    "level": "beginner",
    "q": "What does authorization check?",
    "opts": [
      "Whether an identity may perform a particular action",
      "Whether a password has uppercase letters",
      "Whether a TCP port is open",
      "Whether a page loads quickly"
    ],
    "a": 0,
    "why": "Authentication asks who you are; authorization asks what you may do.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
  },
  {
    "topic": "Identity & Authentication",
    "level": "beginner",
    "q": "Should an application save login passwords as plain text?",
    "opts": [
      "No, use a dedicated password-hashing method",
      "Yes, if the database is private",
      "Yes, if the password is long",
      "Only for administrators"
    ],
    "a": 0,
    "why": "A database compromise should not immediately expose everyone's passwords.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
  },
  {
    "topic": "Identity & Authentication",
    "level": "intermediate",
    "q": "A user changes an invoice ID and reads another user's invoice. What check is missing?",
    "opts": [
      "Authorization for that specific resource",
      "A longer session ID alone",
      "DNS caching",
      "A display filter"
    ],
    "a": 0,
    "why": "Being logged in does not grant access to another user's resources. Check access to each requested object.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
  },
  {
    "topic": "Identity & Authentication",
    "level": "intermediate",
    "q": "How does a pepper differ from a per-password salt?",
    "opts": [
      "A pepper is secret and stored separately from the password database",
      "A pepper must be public",
      "A pepper is the plaintext password",
      "A pepper makes hashing reversible"
    ],
    "a": 0,
    "why": "A pepper adds a shared secret outside the database; a salt is unique per password and need not be secret.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
  },
  {
    "topic": "Network & Traffic",
    "level": "beginner",
    "q": "Which display-filter operator means greater than?",
    "opts": [
      ">",
      "==",
      "<",
      "!="
    ],
    "a": 0,
    "why": "Wireshark supports C-like comparisons such as > and their word equivalents such as gt.",
    "source": "https://www.wireshark.org/docs/man-pages/wireshark-filter.html"
  },
  {
    "topic": "Network & Traffic",
    "level": "beginner",
    "q": "Does a display filter edit a captured packet?",
    "opts": [
      "No, it selects which packets are displayed",
      "Yes, it rewrites its header",
      "Only if the filter uses ==",
      "Only for TCP traffic"
    ],
    "a": 0,
    "why": "Display filtering is a view of captured data, not packet modification.",
    "source": "https://www.wireshark.org/docs/man-pages/wireshark-filter.html"
  },
  {
    "topic": "Network & Traffic",
    "level": "intermediate",
    "q": "What does tcp.port == 443 select?",
    "opts": [
      "Packets with a TCP port field equal to 443",
      "Only packets proved to contain HTTPS",
      "Every encrypted packet",
      "Only packets sent by the local machine"
    ],
    "a": 0,
    "why": "A port-number match is not proof of the application protocol or encryption.",
    "source": "https://www.wireshark.org/docs/man-pages/wireshark-filter.html"
  },
  {
    "topic": "Network & Traffic",
    "level": "intermediate",
    "q": "Which operator tests whether a suitable field contains a sequence?",
    "opts": [
      "contains",
      "assign",
      "capture",
      "rewrite"
    ],
    "a": 0,
    "why": "contains can search strings or byte sequences in suitable fields; it is not used on atomic numeric or IP-address fields.",
    "source": "https://www.wireshark.org/docs/man-pages/wireshark-filter.html"
  },
  {
    "topic": "Vulnerability Assessment",
    "level": "beginner",
    "q": "Does being able to access a resource mean you are authorized to use it?",
    "opts": [
      "No, technical access and permission are different",
      "Yes, access is always consent",
      "Only on weekends",
      "Only if there is no password"
    ],
    "a": 0,
    "why": "A missing access control does not grant permission. Check the approved scope.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
  },
  {
    "topic": "Vulnerability Assessment",
    "level": "beginner",
    "q": "Is a closed port the same as a secure application?",
    "opts": [
      "No, a scan state alone does not establish overall security",
      "Yes, it proves the host is secure",
      "Only if all ports use TCP",
      "Only on a private network"
    ],
    "a": 0,
    "why": "Port state is one observation. It cannot establish the security of a whole system.",
    "source": "https://nmap.org/book/port-scanning.html"
  },
  {
    "topic": "Vulnerability Assessment",
    "level": "intermediate",
    "q": "When checking object-level access control, what is the key comparison?",
    "opts": [
      "Whether each authorized role can access only its permitted resources",
      "Whether every request has the same byte length",
      "Whether all users share a password",
      "Whether the object ID looks random"
    ],
    "a": 0,
    "why": "Authorization applies to actions and resources, even after login. Testing must stay in the agreed scope.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
  },
  {
    "topic": "Vulnerability Assessment",
    "level": "intermediate",
    "q": "Should the same service scan result be assumed from every network location?",
    "opts": [
      "No, network paths and filtering can change the observation",
      "Yes, port states are immutable",
      "Only for UDP",
      "Only if the host has DNS"
    ],
    "a": 0,
    "why": "Nmap states reflect a particular view and scan. Preserve that context when describing a finding.",
    "source": "https://nmap.org/book/port-scanning.html"
  },
  {
    "topic": "Privacy & Secure Operations",
    "level": "beginner",
    "q": "Can Tor guarantee perfect anonymity?",
    "opts": [
      "No, behavior and other information can still identify you",
      "Yes, in every situation",
      "Only with more tabs open",
      "Only if JavaScript is enabled"
    ],
    "a": 0,
    "why": "Tor reduces some risks, but cannot promise perfect anonymity.",
    "source": "https://support.torproject.org/tor-browser/security/using-tb-safely/"
  },
  {
    "topic": "Privacy & Secure Operations",
    "level": "beginner",
    "q": "What happens if you give a site your name and address over Tor?",
    "opts": [
      "The site receives those details",
      "Tor removes them from the form",
      "They become a random identity",
      "They are hidden from the destination"
    ],
    "a": 0,
    "why": "Tor cannot undo information you voluntarily disclose to a site.",
    "source": "https://support.torproject.org/tor-browser/security/using-tb-safely/"
  },
  {
    "topic": "Privacy & Secure Operations",
    "level": "intermediate",
    "q": "Can a network observer normally see that you use Tor?",
    "opts": [
      "Yes, Tor use may be visible even when destinations are hidden",
      "No, Tor always looks like ordinary direct browsing",
      "Only if you log in",
      "Only if cookies are enabled"
    ],
    "a": 0,
    "why": "Tor does not hide its use by default. Bridges may reduce this risk where that matters.",
    "source": "https://support.torproject.org/tor-browser/security/using-tb-safely/"
  },
  {
    "topic": "Privacy & Secure Operations",
    "level": "intermediate",
    "q": "Why does Tor advise against torrenting over Tor?",
    "opts": [
      "Torrent clients may make direct connections and expose your IP",
      "Torrents are always encrypted with Tor automatically",
      "Tor cannot carry any packets",
      "Torrenting makes every other app anonymous"
    ],
    "a": 0,
    "why": "Torrent software can ignore proxy settings or expose addresses, and it burdens the Tor network.",
    "source": "https://support.torproject.org/tor-browser/security/using-tb-safely/"
  },
  {
    "topic": "Automation & Security Engineering",
    "level": "beginner",
    "q": "Should an access token be printed in a debugging log?",
    "opts": [
      "No, it is a secret",
      "Yes, if the log is named debug",
      "Only when Base64-encoded",
      "Only for a short token"
    ],
    "a": 0,
    "why": "Avoid logging tokens directly. Debug output can become a source of credential leaks.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
  },
  {
    "topic": "Automation & Security Engineering",
    "level": "beginner",
    "q": "Why record authorization failures?",
    "opts": [
      "They help detect and investigate access violations",
      "They automatically prevent every attack",
      "They replace permission checks",
      "They make private resources public"
    ],
    "a": 0,
    "why": "Logs support detection and investigation, but do not replace enforcement.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
  },
  {
    "topic": "Automation & Security Engineering",
    "level": "intermediate",
    "q": "Why include consistent timestamps and context in security logs?",
    "opts": [
      "To correlate events during analysis",
      "To make passwords reversible",
      "To avoid checking access controls",
      "To guarantee no false positives"
    ],
    "a": 0,
    "why": "Useful event records support reconstruction and correlation across systems.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
  },
  {
    "topic": "Automation & Security Engineering",
    "level": "intermediate",
    "q": "What risk can arise from logging too much sensitive information?",
    "opts": [
      "The logs themselves can expose private data",
      "It grants better access control automatically",
      "It prevents all injection",
      "It makes tokens expire"
    ],
    "a": 0,
    "why": "Minimize sensitive data in logs and protect access to the logs themselves.",
    "source": "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
  }
];
