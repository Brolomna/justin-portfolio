# FieldKit acceptance checks

Tested November 12, 2026 (Asia/Kathmandu).

## Repeatable calculation tests

Run `node tests/fieldkit.mjs` from the repository root with Node 22+. No extra dependencies. 53 assertions passed. The tests cover SHA-256, expected checksum matching/format, file API failures, unsupported crypto, empty file hashing, strict Base64URL/UTF-8/JSON parsing, claims, and subnet arithmetic.

SHA-256 for the five bytes `hello` (no newline):

`2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824`

For 192.168.1.10/24: network 192.168.1.0; broadcast 192.168.1.255; mask 255.255.255.0; wildcard 0.0.0.255; first 192.168.1.1; last 192.168.1.254; total 256; usable 254.

Also checked 10.0.0.5/8, 172.16.10.15/16, 192.168.1.1/30, 192.168.1.0/31, 192.168.1.1/32, 0.0.0.0/0, and 200.0.0.1/1 against explicit expected results. /0 total: 4,294,967,296. /31: both addresses usable for point-to-point links. /32: single host route.

## Browser interaction checks

In Chromium, all three tool flows passed at 320, 390, 768, 1280, and 1440 CSS pixels:

- Navigation, mobile menu, overview return, keyboard navigation, resets.
- hello file hashing; uppercase expected-hash match; mismatch; invalid expected hash; empty selection; 50,000,001-byte rejection.
- Browser file-read failure simulated with a rejected File.arrayBuffer call, and unsupported Web Crypto simulated with that API unavailable. Both display clear errors.
- Real clipboard copy/read-back for checksum, decoded JSON, individual subnet results, and copy-all. Denied clipboard permission path simulated separately and gave a manual-copy instruction.
- Checksum download was read back and matched the exact expected hash.
- DOM file-drop event works. An in-flight hash cleared immediately cannot repopulate the result.
- Safe local JWT fixtures: valid UTF-8 JSON, malformed token, missing segments, invalid Base64URL, invalid JSON, expired exp, future nbf, missing optional claims. The UI explicitly says signature NOT verified. HTML-like payload content remains text, not executable DOM.
- Sensitive token fields/results clear when leaving the tool and on pagehide.
- Every listed subnet and invalid address/prefix cases; binary and /31 explanatory detail.
- Reduced-motion setting and keyboard Enter activation.
- No horizontal overflow, JavaScript exceptions, external service requests, or local/session storage writes during the tests. Only app static assets were requested.
- Visual checks of overview and tool/result layouts across the five widths; readable wrapping, labels, notices, controls, and results.

`npm run build` succeeds and the application is copied into `dist/fieldkit/`. The approved portfolio integration adds FieldKit as card eight, linking relatively to `./fieldkit/`. Back to Portfolio resolves relatively from /justin-portfolio/fieldkit/.

## Scope and limits

These are desktop Chromium tests with responsive/mobile-size emulation, not a claim of physical-device or Safari/Firefox certification. Some error paths intentionally use controlled API failures rather than a damaged real file or revoked OS permission. No production token was used. No signature verification is performed. File size is limited because Web Crypto hashing is not streaming. The app does not scan networks or verify reachability.
