# 🏹 EdgeIQ Subdomain Hunter

**Passive subdomain enumeration via Certificate Transparency logs, DNS checks, and takeover detection.**

Reconnaissance-grade discovery without sending active probes. Passive subdomain enumeration for security assessment reconnaissance.

[![Project Stage](https://img.shields.io/badge/Stage-Beta-blue)](https://edgeiqlabs.com)
[![Python](https://img.shields.io/badge/Python-3.8+-green)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-orange)](LICENSE)

---

## What It Does

Enumerates subdomains passively using Certificate Transparency logs (crt.sh), DNS zone transfer checks, common subdomain wordlist brute-forcing, and takeover detection (identifying subdomains pointing to unclaimed services).

> ⚠️ **Legal Notice:** Only enumerate domains you own or have explicit written permission to audit.

---

## Key Features

- **Certificate Transparency enumeration** — scrape crt.sh for subdomain history
- **DNS zone transfer check** — attempt AXFR with common NS records
- **Takeover detection** — identify subdomains pointing to inactive services
- **Common subdomain bruteforce** — lightweight wordlist scan
- **Subdomain resolution** — verify discovered subdomains resolve
- **JSON export** — structured output for integration

---

## Prerequisites

- Python 3.8+
- **Pure stdlib** — no external dependencies

---

## Installation

```bash
git clone https://github.com/snipercat69/edgeiq-subdomain-hunter.git
cd edgeiq-subdomain-hunter
# No pip install needed!
```

---

## Quick Start

```bash
# Enumerate subdomains for a domain
python3 subdomain_hunter.py --domain example.com

# Include takeover detection
python3 subdomain_hunter.py --domain example.com --check-takeover

# Export as JSON
python3 subdomain_hunter.py --domain example.com --output subdomains.json
```

---

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 50 results, basic wordlist |
| **Pro** | $19/mo | Unlimited results, takeover detection, larger wordlist |
| **Lifetime** | $39 one-time | All Pro features, forever |

---

## Integration with EdgeIQ Tools

- **[EdgeIQ Network Scanner](https://github.com/snipercat69/edgeiq-network-scanner)** — scan discovered subdomains
- **[EdgeIQ SSL Watcher](https://github.com/snipercat69/edgeiq-ssl-watcher)** — monitor TLS on discovered subdomains

---

## Support

Open an issue at: https://github.com/snipercat69/edgeiq-subdomain-hunter/issues

---

*Part of EdgeIQ Labs — [edgeiqlabs.com](https://edgeiqlabs.com)*
