# incident-analyzer


# 🚨 Incident Analyzer Web Tool

This is a lightweight, browser-based tool to analyze common networking incidents. It's designed for use in restricted environments (such as AVDs) and runs fully client-side — no backend or API calls required.

---

## 🔍 Features

### 🧰 Case 1: Devices Down (Ping)
- Paste incident descriptions containing device IPs.
- Generates ping commands.
- Paste ping results to auto-detect which devices are up or down.
- Provides clear summaries and status breakdowns.

### ⚙️ Case 2: Interface Down
- Parses incident descriptions to extract device/interface mappings.
- Generates relevant diagnostic CLI commands.
- Accepts CLI output to analyze interface status.
- Copies interface summary to clipboard.

### 🌐 Case 3: BGP Neighbor Down
- Extracts neighbor IPs from incident descriptions.
- Accepts BGP summary & optional SD-WAN control output.
- Detects session status, uptime, and suggests Next Plan of Action (NPOA).


---

## 🚫 Privacy & Security
## 🔐 Compliance & Disclaimer

> ⚠️ **Internal Use Only**

This tool is intended for **internal use by network support engineers** or authorized IT personnel within the organization. It is designed to automate and simplify routine diagnostic tasks (ping checks, interface/bgp status analysis) in a secure, client-side environment.

### ✅ Security Assurances:
- No data is transmitted to any external server.
- All operations occur locally in the browser.
- No external API keys are used or stored (AI features are disabled).
- Does **not log**, **store**, or **transmit** incident data.

### ⚖️ Responsibility & Usage

By using this tool, you acknowledge:
- You are authorized to perform diagnostics on the systems being analyzed.
- You remain responsible for validating the output before taking action.
- This tool is provided “as is” with no warranties or guarantees.
- Use must comply with your organization's IT and security policies.

### 🏢 Company Policy Notice

Ensure this tool is:
- Reviewed by your team lead or IT security before widespread use.
- Used only on approved devices/networks.
- Not used to analyze any **confidential**, **customer**, or **personal** data unless explicitly permitted.

If you are unsure whether this tool complies with your company’s usage policies, consult your compliance or InfoSec team before proceeding.

- Originally supported OpenAI for AI analysis, but that feature has been **disabled** for security & compliance.

---


## 📁 File Structure

```plaintext
/
├── index.html        # Main HTML interface
├── style.css         # All layout, theme and style rules
├── script.js         # JavaScript logic for parsing, generation, and analysis
├── README.md         # Project overview and instructions 


