# MalachKit

Practical tools. Clear results.

MalachKit is a small browser workbench built by Justin as a portfolio project. It brings file integrity checks, JWT inspection, and IPv4 subnet arithmetic into one local interface. The point is to make common technical tasks useful while demonstrating how they work, not to claim that decoding or calculating something establishes trust.

## Tools

### HashCheck

Choose or drop a file, generate its SHA-256 checksum, and compare a known expected checksum. The File API reads the local bytes; `crypto.subtle.digest('SHA-256', buffer)` returns a 256-bit digest rendered as 64 hexadecimal characters. Comparisons ignore letter case and validate the expected format. Copy the hash or download it as a text file.

Web Crypto digest is not streaming: the entire file is read into memory. The release limit is 50 MB (50,000,000 bytes). A secure context (HTTPS or localhost) and a modern browser are required. A hash match proves byte equality against that expected value, not that the file is harmless or that the expected value came from a trusted source.

### TokenLens

Paste a compact three-segment JWT. Base64URL translates the URL-safe `-` and `_` alphabet to standard Base64 and restores omitted padding. The decoded header and payload bytes must be valid UTF-8 JSON objects. The inspector rejects malformed encoding, padding, JSON, missing segments, and a missing algorithm field. It shows the signature segment as encoded bytes only. Correct optional padding is accepted for inspection; it does not establish standards compliance or authenticity.

Common registered claims: issuer (`iss`), subject (`sub`), audience (`aud`), expiration (`exp`), not before (`nbf`), issued at (`iat`), and token ID (`jti`). Numeric timestamp claims are Unix seconds; local and UTC dates are displayed. Expiration and not-before comparisons use the device clock without clock-skew allowance. Nonnumeric or unsupported timestamps are flagged. Optional claims need not be present. Unsecured `alg: none` tokens with an empty signature are labeled unsecured.

**Decoding is NOT signature verification.** No signature or key is checked; no issuer, audience, or algorithm is trusted. Encrypted five-segment tokens are unsupported. Input is capped at 100,000 characters to keep parsing manageable. Don't paste production credentials or secrets into an environment you don't trust. Input and decoded output are cleared when leaving the tool or page, including cached-page restoration. Clipboard copies are outside MalachKit's control.

### NetCalc

Enter a dotted-decimal IPv4 address and a CIDR prefix from 0 to 32. BigInt arithmetic avoids JavaScript's signed 32-bit bitwise behavior:

- Total addresses = 2^(32 - prefix).
- Wildcard = total - 1; subnet mask = 0xffffffff XOR wildcard.
- Network = IP AND mask; high endpoint = network + wildcard.
- Ordinary subnets reserve network and broadcast, leaving total - 2 usable hosts.
- /31 uses the RFC 3021 point-to-point exception: two usable addresses, no directed broadcast.
- /32 is a single host route: one address, no subnet broadcast.

The UI distinguishes range endpoints from broadcast addresses for /31 and /32. It includes dotted-binary forms and individual/copy-all actions. Leading-zero octets are rejected to avoid ambiguous interpretation. The calculator is IPv4-only and does not scan, probe, check routes, validate device configuration, or account for all reserved/special-purpose address restrictions.

## Architecture and privacy

- `index.html`: semantic views, form labels, navigation, safety notices.
- `styles.css`: responsive dark workbench, focus states, reduced-motion support.
- `js/app.js`: hash-based view routing, mobile navigation, sensitive-state cleanup.
- `js/utils.js`: safe DOM helpers, JSON text highlighting, clipboard, notifications, downloads, formatting.
- `js/hashcheck.js`: pure hash/comparison logic and file UI.
- `js/tokenlens.js`: Base64URL/UTF-8 decoding and claim UI.
- `js/netcalc.js`: pure BigInt subnet calculations and result UI.

Native ES modules, HTML and CSS only. No new npm packages, framework, backend, account, database, external API, analytics, or tracking. No localStorage or persisted input history. Files, hashes, tokens, and network inputs stay in memory. No input is sent over the network or logged to the console. Loading the app fetches its own static assets; reference links open only when clicked. Clipboard and download actions are explicit.

Business functions are exported separately from UI setup for testing. Untrusted input is rendered with `textContent`/text nodes, never interpolated HTML. The hash UI uses a generation counter so a cleared/replaced file cannot display a late hash result. No scripts or network commands are executed from user input.

## Run and deploy

From the existing justin-portfolio repository, run `npm run dev` and open `/malachkit/`. Alternatively serve `public/` with a local HTTP server and open `/malachkit/`. Do not use `file://` because ES modules and Web Crypto need a suitable browser origin.

`npm run build` copies `public/malachkit/` unchanged into `dist/malachkit/`. The existing GitHub Actions workflow deploys `dist`; it is not replaced. All internal paths are relative, including `../` back to the portfolio. Production path: `https://brolomna.github.io/justin-portfolio/malachkit/`.

MalachKit is linked as card eight in the portfolio carousel. The app is indexable. The existing carousel behavior, other projects, and Howlfall code are preserved.

## References

- https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
- https://developer.mozilla.org/en-US/docs/Glossary/Base64
- https://www.rfc-editor.org/rfc/rfc7519
- https://www.rfc-editor.org/rfc/rfc3021

## Acceptance checks

See [TESTING.md](./TESTING.md) for tested cases and limitations. Repeat the 53 business-logic assertions with `node tests/malachkit.mjs` from the repository root (Node 22+). Browser interaction checks used safe local fixtures at the five requested widths; no production secrets were used.
