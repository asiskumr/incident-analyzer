
// 🔐 Store API key in session storage
// function storeApiKey() {
//     const key = document.getElementById("apiKeyInput").value.trim();
//     sessionStorage.setItem("openai_api_key", key);
// }

// function getApiKey() {
//     return sessionStorage.getItem("openai_api_key") || "";
// }

// 🚀 Toggle AI usage
// function toggleAi() {
//     const isEnabled = document.getElementById("enableAiToggle").checked;
//     sessionStorage.setItem("ai_enabled", isEnabled);
// }

// function isAiEnabled() {
//     return sessionStorage.getItem("ai_enabled") === "true";
// }

// 🧠 Fetch from OpenAI
// async function callOpenAi(prompt) {
//     const apiKey = getApiKey();
//     if (!apiKey) {
//         alert("OpenAI API key not set.");
//         return "";
//     }

//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//         method: "POST",
//         headers: {
//             "Authorization": `Bearer ${apiKey}`,
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//             model: "gpt-3.5-turbo", // or "gpt-4o" if your key supports it
//             messages: [
//                 { role: "system", content: "You are a helpful assistant extracting network incident data for Cisco switch interface monitoring." },
//                 { role: "user", content: prompt }
//             ],
//             temperature: 0.3
//         })
//     });

//     const data = await response.json();
//     if (data.error) {
//         console.error("OpenAI Error:", data.error);
//         alert("OpenAI API error: " + data.error.message);
//         return "";
//     }

//     return data.choices?.[0]?.message?.content || "";
// }



// ------------------------
// Case Selector Logic
// ------------------------
function showCase(caseId) {
    const cases = ["case1", "case2", "case3"];
    cases.forEach(id => {
        document.getElementById(id).style.display = (id === caseId) ? "block" : "none";
    });
}

function autoCopy(text, successMsg = "✅ Copied to clipboard!") {
    navigator.clipboard.writeText(text)
        .then(() => alert(successMsg))
        .catch(() => alert("⚠️ Failed to copy to clipboard."));
}


// ------------------------
// Theme Toggle
// ------------------------
let isDark = false;

// function toggleTheme() {
//     document.body.style.backgroundColor = isDark ? "#f7f9fc" : "#1e1e1e";
//     document.body.style.color = isDark ? "#333" : "#e6e6e6";

//     const textareas = document.querySelectorAll("textarea");
//     const preTags = document.querySelectorAll("pre");

//     textareas.forEach(el => {
//         el.style.backgroundColor = isDark ? "#fff" : "#2c2c2c";
//         el.style.color = isDark ? "#000" : "#f1f1f1";
//     });

//     preTags.forEach(el => {
//         el.style.backgroundColor = isDark ? "#eef2f6" : "#2b2b2b";
//         el.style.color = isDark ? "#000" : "#f1f1f1";
//     });

//     isDark = !isDark;
// }


// ------------------------
// Clipboard Utility
// ------------------------
function copyToClipboard(id) {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard!");
    });
}

// ------------------------
// Case 1: Ping Command Generator
// ------------------------
function generatePingCommands() {
    const input = document.getElementById("case1Input").value;
    const lines = input.split("\n");

    const ipRegex = /\b(\d{1,3}\.){3}\d{1,3}\b/;
    const seen = new Set();
    let commands = [];

    for (let line of lines) {
        const match = line.match(ipRegex);
        if (match) {
            const ip = match[0];
            if (!seen.has(ip)) {
                seen.add(ip);
                commands.push(`ping ${ip}`);
            }
        }
    }

    document.getElementById("case1Output").textContent = commands.join("\n");
    autoCopy(commands.join("\n"), "✅ Unique ping commands copied!");
}



// ------------------------
// Case 1: Ping Result Analyzer
// ------------------------
function analyzePingResults() {

    const input = document.getElementById("pingResultInput").value;
    const incidentText = document.getElementById("case1Input").value;

    // Extract name-IP pairs from incident description
    const deviceMap = {};
    const deviceLines = incidentText.split("\n");
    for (let line of deviceLines) {
        const match = line.match(/([\w\-]+)-(\d{1,3}(?:\.\d{1,3}){3})/);
        if (match) {
            const name = match[1];
            const ip = match[2];
            deviceMap[ip] = name;
        }
    }

    const blocks = input.trim().split(/(?=ps.*ping \d{1,3}(?:\.\d{1,3}){3})/gi);
    let upList = [];
    let downList = [];

    for (let block of blocks) {
        const ipMatch = block.match(/ping (\d{1,3}(?:\.\d{1,3}){3})/i);
        const ip = ipMatch ? ipMatch[1] : null;
        if (!ip) continue;

        const blockLower = block.toLowerCase();

        const isUnreachableFromDifferentIP = blockLower.includes("destination host unreachable");
        const isRequestTimedOut = blockLower.includes("request timed out");
        const isAllLost = blockLower.includes("lost = 4") || blockLower.includes("received = 0");
        const is100PercentLoss = blockLower.includes("100% loss");

        const isDown = isUnreachableFromDifferentIP || isRequestTimedOut || isAllLost || is100PercentLoss;

        const name = deviceMap[ip] || "Unknown";
        const label = `${ip} - ${name}`;

        if (isDown) {
            downList.push({ ip, name, label });
        } else {
            upList.push({ ip, name, label });
        }
    }

    const total = upList.length + downList.length;
    document.getElementById("deviceCountSummary").textContent = `Total Devices: ${total} | Up: ${upList.length} | Down: ${downList.length}`;

    const upText = "Up Devices:\n" + upList.map(d => d.label).join("\n");
    const downText = "Down Devices:\n" + downList.map(d => d.label).join("\n");

    document.getElementById("upDevicesOutput").textContent = upText;
    document.getElementById("downDevicesOutput").textContent = downText;

    let copyText = `${upText}\n\n${downText}`;

    // If any down devices found, generate professional resolution notes
    if (downList.length > 0) {
        const count = downList.length;
        const deviceLines = downList.map(d => `${d.ip} - ${d.name}`).join("\n");

        copyText += "\n\n=== Resolution Notes ===\n";
        copyText += `\n Cause:\nThe affected device(s) are currently unreachable via ICMP ping. This is commonly due to power loss (input power unavailable) or complete link failure upstream.\n`;
        copyText += `\n Current Status:\nThe following ${count} switch(es) are not reachable:\n${deviceLines}\n`;
        copyText += `\n NPOA:\nMonitoring will continue for the next interval. If the device(s) remain unreachable, upstream investigation or physical engagement of Field staff may be required.\n`;
    }

    autoCopy(copyText, "Device status + resolution copied to clipboard!");
}


// Case 2:

// =====================
// Case 2 JavaScript Full Code
// =====================

// Regex for common Cisco interfaces (case insensitive)
const interfaceRegex = /\b(GigabitEthernet|FastEthernet|TenGigabitEthernet|TwentyFiveGigE|Vlan|Port-channel)\d+([\/\d]*)\b/gi;

// Global store for parsed device data
window.case2ParsedMap = {};

// --- Parse Incident Description (Case 2) ---
async function parseCase2Description() {
    const input = document.getElementById("case2DescriptionInput").value.trim();
    if (!input) {
        alert("Please paste the incident description.");
        return;
    }

    let parsedMap = {};

//     if (isAiEnabled()) {
//         const prompt = `
// Extract device names, IPs, and interfaces from this incident description and return JSON like:
// {
//   "DEVICE_NAME": {
//     "ip": "x.x.x.x",
//     "interfaces": ["Interface1", "Interface2"]
//   }
// }
// Text:
// ${input}
//         `.trim();

//         try {
//             const aiResponse = await callOpenAi(prompt);
//             parsedMap = JSON.parse(aiResponse);
//         } catch (e) {
//             console.error("AI returned invalid JSON:", e);
//             alert("AI output could not be parsed. Try disabling AI or rephrase input.");
//             return;
//         }
//     } else
//      {
        parsedMap = parseWithFallback(input);
    // }

    window.case2ParsedMap = parsedMap;
    displayDeviceButtons(parsedMap);
}

// fall back function : handle both interface description patterns (old & new)
function parseWithFallback(input) {
    const devicePattern = /^[\w\-]+-\d{1,3}(\.\d{1,3}){3}(?:-\d+)?$/gim;
    // const oldPatternRegex = /Interface\s*:\s*([\w\d\/\-.]+).*?on Node:\s*([\w\-]+)\s*is Down/gi;
    // const newPatternRegex = /Interface\s+([\w\d\/\-.]+)\s+on Node\s+([\w\-]+)\s+is Down/gi;
    
    const oldPatternRegex = /Interface\s*:\s*([\w\d\/\-.]+)(?:\s*[·\w\d ]*)?\s+on Node:\s*([\w\-]+)\s*is Down/gi;
    const newPatternRegex = /Interface\s+([\w\d\/\-.]+)(?:\s*[·\w\d ]*)?\s+on Node\s+([\w\-]+)\s+is Down/gi;

    let devices = {};

    // Extract devices from "Device details" section
    const deviceLines = input.match(devicePattern) || [];
    for (const line of deviceLines) {
        const ipMatch = line.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/);
        const ip = ipMatch ? ipMatch[0] : "";

        if (!ip) continue;

        const parts = line.split("-");
        const ipIndex = parts.findIndex(p => p === ip);
        if (ipIndex === -1) continue;

        const maybePort = parts[ipIndex + 1];
        const portIsPresent = maybePort && /^\d+$/.test(maybePort);

        const hostnameParts = parts.slice(0, ipIndex);
        const hostname = hostnameParts.join("-").trim().toUpperCase();

        devices[hostname] = { ip, interfaces: [] };
    }

    // Helper to assign interface to correct device
    const assignInterface = (intf, hostname) => {
        const key = hostname.toUpperCase();
        if (devices[key]) {
            devices[key].interfaces.push(intf);
        } else {
            if (!devices[key]) {
                devices[key] = { ip: "", interfaces: [] };
            }
            devices[key].interfaces.push(intf);
        }
    };

    // Handle both patterns
    let match;
    while ((match = oldPatternRegex.exec(input)) !== null) {
        const [, intf, hostname] = match;
        assignInterface(intf, hostname);
    }

    while ((match = newPatternRegex.exec(input)) !== null) {
        const [, intf, hostname] = match;
        assignInterface(intf, hostname);
    }

    return devices;
}


// --- Display Device Buttons ---
function displayDeviceButtons(deviceMap) {
    const container = document.getElementById("deviceButtonsContainer");
    container.innerHTML = "";

    for (const [deviceName, { ip, interfaces }] of Object.entries(deviceMap)) {
        const button = document.createElement("button");
        button.classList.add("device-button");
        button.textContent = `${deviceName} (${ip}) — ${interfaces.length} interfaces`;

        button.onclick = () => {
            copyCase2CommandsToClipboard(deviceName, interfaces);
            alert(`Commands copied for ${deviceName}`);
        };

        container.appendChild(button);
    }
}

// --- Copy CLI Commands for device interfaces ---
function copyCase2CommandsToClipboard(deviceName, interfaces) {
    let commands = `terminal length 0\n`;
    for (const intf of interfaces) {
        commands += `show interface ${intf}\nshow run interface ${intf}\nshow logging | include ${intf}\n\n`;
    }
    commands += `show clock\n`;

    navigator.clipboard.writeText(commands).catch(() => {
        alert("Failed to copy commands to clipboard");
    });
}

// --- Manual CLI Output Parser ---
function runManualCase2CliParser(cliText) {
    if (!cliText) return null;

    const causes = [];
    const currentStatus = [];
    const nextPlanOfAction = [];
    const logsPerInterface = {};
    const seenInterfaces = new Set();

    const lines = cliText.split(/\r?\n/);

    let hasDownInterface = false;
    let hasAccessMode = false;
    let hasTrunkMode = false;
    let hasRoutedMode = false;
    let sfpDetected = false;
    let copperOnly = false;

    // --- STEP 1: Extract log sections ---
    const loggingSections = cliText.split(/#show logging \| include (\S+)/i);
    for (let i = 1; i < loggingSections.length; i += 2) {
        const intf = loggingSections[i];
        const logs = (loggingSections[i + 1] || "").split(/\r?\n/).filter(line =>
            line.includes(intf) &&
            /%LINK-3-UPDOWN|%LINEPROTO-5-UPDOWN/.test(line)
        );

        const summary = [];
        for (let j = logs.length - 1; j >= 0 && summary.length < 2; j--) {
            const logLine = logs[j];
            const timestampMatch = logLine.match(/\*?([A-Z][a-z]{2} +\d+ \d+:\d+:\d+)/);
            const eventMatch = logLine.match(/%(\w+)-\d+-(\w+): Interface (\S+), changed state to (up|down)/i);
            if (timestampMatch && eventMatch) {
                const time = timestampMatch[1];
                const type = eventMatch[2];
                const state = eventMatch[4];
                if (type === "UPDOWN") {
                    if (eventMatch[1] === "LINK") {
                        summary.push(`Interface ${state} at ${time}`);
                    } else if (eventMatch[1] === "LINEPROTO") {
                        summary.push(`Protocol ${state} at ${time}`);
                    }
                }
            }
        }

        if (summary.length) {
            logsPerInterface[intf] = summary;
        }
    }

    // --- STEP 2: Parse interface blocks ---
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const intfStatusMatch = line.match(/^\s*(\S+) is (up|down|administratively down)(?: \(([^)]+)\))?(?:, line protocol is (up|down|administratively down))?/i);
        if (intfStatusMatch) {
            const intfName = intfStatusMatch[1];
            const linkStatus = intfStatusMatch[2];
            const statusDetail = intfStatusMatch[3] || "";
            const protocolStatus = intfStatusMatch[4] || "";

            seenInterfaces.add(intfName);
            if (linkStatus.toLowerCase() !== "up") hasDownInterface = true;

            let adminState = "unknown";
            for (let j = i + 1; j < i + 6 && j < lines.length; j++) {
                const adminMatch = lines[j].match(/admin state is (up|down)/i);
                if (adminMatch) {
                    adminState = adminMatch[1];
                    break;
                }
            }

            if (/media type is.*BaseTX/i.test(cliText) || /10\/100\/1000BaseTX/i.test(cliText)) {
                copperOnly = true;
            }

            if (/SFP not inserted/i.test(statusDetail)) {
                sfpDetected = true;
            }

            let statusSummary = `${intfName} - Link: ${linkStatus}`;
            if (statusDetail) statusSummary += ` (${statusDetail})`;
            if (protocolStatus) statusSummary += `, Protocol: ${protocolStatus}`;
            statusSummary += `, Admin: ${adminState}`;

            currentStatus.push(statusSummary);

            if (logsPerInterface[intfName]) {
                logsPerInterface[intfName].forEach(log => {
                    currentStatus.push(`↪ Log: ${log}`);
                });
            }
        }

        if (/switchport mode access/i.test(line)) {
            hasAccessMode = true;
        } else if (/switchport mode trunk/i.test(line)) {
            hasTrunkMode = true;
        } else if (/no switchport/i.test(line)) {
            hasRoutedMode = true;
        }
    }

    // --- STEP 3: Detect switchport mode ---
    if (hasAccessMode) {
        currentStatus.push("Interface mode: Access");
    } else if (hasTrunkMode) {
        currentStatus.push("Interface mode: Trunk");
    } else if (hasRoutedMode) {
        currentStatus.push("Interface mode: Routed (Layer 3)");
    }

    // --- STEP 4: Utilization stats ---
    const inputMatch = cliText.match(/(?:\d+ seconds?) input rate (\d+) bits\/sec/i);
    const outputMatch = cliText.match(/(?:\d+ seconds?) output rate (\d+) bits\/sec/i);
    currentStatus.push(`Interface utilization — Input: ${inputMatch ? inputMatch[1] : "N/A"} bps, Output: ${outputMatch ? outputMatch[1] : "N/A"} bps`);

    // --- STEP 5: Root cause analysis ---
    if (hasDownInterface) {
        causes.push("One or more interfaces are down or administratively disabled.");
        if (sfpDetected && !copperOnly) {
            causes.push("SFP not inserted (based on interface detail).");
        }
        causes.push("Possible cable issue, peer device offline, or intentional shutdown.");
    } else {
        causes.push("All interfaces are up.");
    }

    // --- STEP 6: Next Plan of Action ---
    if (!hasDownInterface || hasAccessMode) {
        nextPlanOfAction.push("Since the interface is either up or in access mode, we can close this incident.");
    } else {
        nextPlanOfAction.push("Monitor the interface for additional flaps or persistent downtime.");
        nextPlanOfAction.push("If issue persists, raise TASK/1SAP to engage FS to physically check on-site.");
    }

    return {
        causes,
        currentStatus,
        nextPlanOfAction,
        rawCliOutput: cliText,
        interfaces: [...seenInterfaces],
        logsPerInterface
    };
}





// // --- AI-powered CLI Output Parser ---
// async function runAiCase2CliParser(cliText) {
//     const prompt = `
// You are a senior network engineer. Analyze the following CLI output related to interface issues on LAN switches.

// Your task:
// - Provide a resolution summary using the following three technical categories.
// - Each category should be clear, professional, and concise.

// Categories:
// Causes:
// - Mention likely physical/logical causes based on the CLI, interface status, logs, etc.

// Current Status:
// - Mention interface state (up/down), switchport mode (access/trunk/L3), and interface utilization if visible.

// NPOA:
// - Provide specific next steps like cable checks, SFP swap, coordination with remote side, raising TASK/SAP, etc.

// CLI Output:
// ${cliText}
// `;

//     const aiResponse = await callOpenAi(prompt);
//     return aiResponse;
// }

// --- Analyze CLI output and display result ---
async function analyzeCase2CliOutput() {
    const cliText = document.getElementById("case2CliOutputInput").value.trim();
    if (!cliText) {
        alert("Please paste combined CLI output first.");
        return;
    }

    let analysisResultText = "";

    // if (isAiEnabled()) {
    //     try {
    //         analysisResultText = await runAiCase2CliParser(cliText);
    //     } catch (e) {
    //         console.error("AI parser failed:", e);
    //         alert("AI analysis failed. Try manual analysis.");
    //         return;
    //     }
    // } else {

        const analysis = runManualCase2CliParser(cliText);
        if (!analysis) return;

        analysisResultText += "Causes:\n";
        analysis.causes.forEach(c => analysisResultText += `- ${c}\n`);
        analysisResultText += "\nCurrent Status:\n";
        analysis.currentStatus.forEach(s => analysisResultText += `- ${s}\n`);
        analysisResultText += "\nNPOA:\n";
        analysis.nextPlanOfAction.forEach(n => analysisResultText += `- ${n}\n`);

        analysisResultText += `\n\nRaw CLI Output:\n${analysis.rawCliOutput}`;
    // }

    document.getElementById("case2AnalysisResult").textContent = analysisResultText;

    try {
        await navigator.clipboard.writeText(analysisResultText);
        console.log("Analysis result copied to clipboard.");
    } catch {
        console.warn("Failed to copy analysis result to clipboard.");
    }
}

// --- Copy Interface Summary to Clipboard ---
function copyInterfaceListSummary() {
    const deviceMap = window.case2ParsedMap || {};
    if (!Object.keys(deviceMap).length) {
        alert("No device/interface data found. Please parse first.");
        return;
    }

    let summaryText = " Interface Count Summary:\n";
    for (const [deviceKey, entry] of Object.entries(deviceMap)) {
        summaryText += `- Device ${deviceKey} (${entry.ip}): ${entry.interfaces.length} interfaces\n`;
        entry.interfaces.forEach(iface => {
            summaryText += `   • ${iface}\n`;
        });
    }

    navigator.clipboard.writeText(summaryText).then(() => {
        alert("Interface summary copied to clipboard!");
    }).catch(() => {
        alert("Failed to copy summary to clipboard.");
    });
}

// --- Check if AI mode enabled ---
// function isAiEnabled() {
//     const checkbox = document.getElementById("enableAi");
//     return checkbox ? checkbox.checked : false;
// }

// --- Call OpenAI API ---
// Replace YOUR_API_KEY below with your actual OpenAI API key
// async function callOpenAi(prompt) {
//     const apiKey = "";  // add my api key

//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${apiKey}`
//         },
//         body: JSON.stringify({
//             model: "gpt-4o-mini",
//             messages: [{ role: "user", content: prompt }],
//             temperature: 0.2,
//             max_tokens: 800
//         })
//     });

//     if (!response.ok) {
//         throw new Error(`OpenAI API error: ${response.statusText}`);
//     }

//     const data = await response.json();
//     const content = data.choices[0].message.content.trim();

//     return content;
// }



// Case 3: SDWAN

// Case 3: SDWAN BGP + optional control connections

function uptimeToSeconds(uptime) {
    uptime = uptime.trim();
    if (!uptime || uptime.toLowerCase() === 'never') return 0;

    let seconds = 0;

    let yearMatch = uptime.match(/(\d+)y/);
    if (yearMatch) seconds += parseInt(yearMatch[1]) * 365 * 24 * 3600;

    let monthMatch = uptime.match(/(\d+)mo?/);
    if (monthMatch) seconds += parseInt(monthMatch[1]) * 30 * 24 * 3600;

    let weekMatch = uptime.match(/(\d+)w/);
    if (weekMatch) seconds += parseInt(weekMatch[1]) * 7 * 24 * 3600;

    let dayMatch = uptime.match(/(\d+)d/);
    if (dayMatch) seconds += parseInt(dayMatch[1]) * 24 * 3600;

    let hourMatch = uptime.match(/(\d+)h/);
    if (hourMatch) seconds += parseInt(hourMatch[1]) * 3600;

    let minMatch = uptime.match(/(\d+)m(?!o)/);
    if (minMatch) seconds += parseInt(minMatch[1]) * 60;

    let secMatch = uptime.match(/(\d+)s/);
    if (secMatch) seconds += parseInt(secMatch[1]);

    if (/^\d{1,2}:\d{2}:\d{2}$/.test(uptime)) {
        let parts = uptime.split(':').map(Number);
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    if (seconds === 0 && /^\d+$/.test(uptime)) {
        seconds = parseInt(uptime);
    }

    return seconds;
}


function parseNeighborsFromDescription(desc) {
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    const ips = desc.match(ipRegex);
    return ips ? [...new Set(ips)] : [];
}

function parseBgpSummary(cliText) {
    const lines = cliText.split('\n');
    const neighbors = [];
    let startIndex = lines.findIndex(line => /^Neighbor\s+V\s+AS\s+MsgRcvd/.test(line));
    if (startIndex === -1) return neighbors;

    for (let i = startIndex + 1; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) break;

        let cols = line.split(/\s+/);
        if (cols.length < 9) continue;

        neighbors.push({
            ip: cols[0],
            version: cols[1],
            asn: cols[2],
            msgRcvd: cols[3],
            msgSent: cols[4],
            tblVer: cols[5],
            inQ: cols[6],
            outQ: cols[7],
            upDown: cols[8],
            statePfxRcd: cols.slice(9).join(' ') || ''
        });
    }

    return neighbors;
}

function parseSdwanControlConnections(cliText) {
    const lines = cliText.split('\n');
    const sdwanConns = {};
    const startIndex = lines.findIndex(line => line.includes('PEER') && line.includes('STATE') && line.includes('UPTIME'));

    if (startIndex === -1) return sdwanConns;

    for (let i = startIndex + 2; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        let cols = line.split(/\s+/);
        if (cols.length >= 15) {
            let privIp = cols[5];
            let pubIp = cols[7];
            let state = cols[14]?.toLowerCase();
            if (privIp && state) sdwanConns[privIp] = state;
            if (pubIp && state) sdwanConns[pubIp] = state;
        }
    }

    return sdwanConns;
}

function extractDeviceIp(desc) {
    let ipRegex = /(\d{1,3}(?:\.\d{1,3}){3})/g;
    let ips = desc.match(ipRegex);
    return ips ? ips[ips.length - 1] : null;
}

function analyzeBGP() {
    const descriptionText = document.getElementById('case3Input').value;
    const cliText = document.getElementById('case3CliOutputInput').value;

    if (!descriptionText.trim()) {
        alert('Please paste the BGP incident description (with neighbor IPs)!');
        return;
    }
    if (!cliText.trim()) {
        alert('Please paste the CLI output (sh ip bgp all sum and optionally sh sdwan control connections)!');
        return;
    }

    const deviceIp = extractDeviceIp(descriptionText);
    const neighborsInDesc = parseNeighborsFromDescription(descriptionText).filter(ip => ip !== deviceIp);
    if (neighborsInDesc.length === 0) {
        alert('No valid BGP neighbor IPs found in description after filtering device IP!');
        return;
    }

    const bgpNeighbors = parseBgpSummary(cliText);
    const sdwanConns = parseSdwanControlConnections(cliText);

    let output = `Analyzing BGP Neighbor(s) Mentioned in Description (excluding device IP ${deviceIp}):\n\n`;
    let unresolved = [];

    neighborsInDesc.forEach(ip => {
        const bgp = bgpNeighbors.find(n => n.ip === ip);
        output += `Neighbor ${ip}:\n`;

        if (!bgp) {
            output += `  Cause: Neighbor not found in BGP summary.\n`;
            output += `  Current Status: No BGP session info.\n`;
            output += `  NPOA: Verify config and connectivity.\n\n`;
            unresolved.push(ip);
            return;
        }

        const uptimeStr = bgp.upDown;
        const stateStr = bgp.statePfxRcd;
        const uptimeSeconds = uptimeToSeconds(uptimeStr);
        const isUp = uptimeSeconds > 0;
        const isDown = /Idle|Active|Connect/i.test(uptimeStr) || /Idle|Active|Connect/i.test(stateStr);
        const sdwanState = sdwanConns[ip];

        if (isUp) {
            output += `  Cause: Neighbor is UP with uptime ${uptimeStr}.\n`;
            output += `  Current Status: Established BGP session with ${bgp.msgRcvd} messages received, ${bgp.msgSent} sent.\n`;
            output += uptimeSeconds > 3600
                ? `  NPOA: Session stable. Incident can be closed.\n\n`
                : uptimeSeconds > 60
                    ? `  NPOA: Monitor session for stability over next 1 hour.\n\n`
                    : `  NPOA: Session recently established. Monitor closely.\n\n`;
        } else if (isDown) {
            output += `  Cause: BGP session DOWN with state '${uptimeStr}'.\n`;
            if (sdwanState) {
                output += `  SDWAN Control Connection State: ${sdwanState.toUpperCase()}.\n`;
                if (sdwanState === 'up') {
                    output += `  Current Status: Control connection is UP, but BGP is DOWN - possible routing/BGP config issue.\n`;
                    output += `  NPOA: Investigate BGP configuration and routing.\n\n`;
                } else {
                    output += `  Current Status: Control connection is DOWN.\n`;
                    output += `  NPOA: Check WAN transport, control connection logs.\n\n`;
                }
            } else {
                output += `  Current Status: No SDWAN control connection info found for this neighbor.\n`;
                output += `  NPOA: Verify physical/WAN reachability and control connection if applicable.\n\n`;
            }
        } else {
            output += `  Cause: Unable to determine precise BGP state.\n`;
            output += `  Current Status: Raw info: '${uptimeStr}' / '${stateStr}'.\n`;
            output += `  NPOA: Manual investigation required.\n\n`;
        }
    });

    if (unresolved.length) {
        output += `Note: Some neighbors from description were not found in BGP summary output.\n`;
    }

    document.getElementById('case3Output').textContent = output;
}
// Case 3 ended


// Reset ALL

function resetAll() {
  const confirmed = confirm("Are you sure you want to delete all inputs and outputs?");
  if (!confirmed) return;

  // Case 1
  document.getElementById('case1Input').value = '';
  document.getElementById('case1Output').textContent = '';
  document.getElementById('pingResultInput').value = '';
  document.getElementById('deviceCountSummary').textContent = 'Total Devices: 0 | Up: 0 | Down: 0';
  document.getElementById('upDevicesOutput').textContent = 'Up Devices:';
  document.getElementById('downDevicesOutput').textContent = 'Down Devices:';

  // Case 2
  document.getElementById('case2DescriptionInput').value = '';
  document.getElementById('deviceButtonsContainer').innerHTML = '';
  document.getElementById('case2CliOutputInput').value = '';
  document.getElementById('case2AnalysisResult').textContent = '';

  // Case 3
  document.getElementById('case3Input').value = '';
  document.getElementById('case3CliOutputInput').value = '';
  document.getElementById('case3Output').textContent = '';

  // AI Settings (optional, if still exists — can remove if no longer needed)
//   const aiToggle = document.getElementById('enableAiToggle');
//   const apiKeyField = document.getElementById('apiKeyInput');
//   if (aiToggle) aiToggle.checked = false;
//   if (apiKeyField) apiKeyField.value = '';

  alert('All inputs and outputs have been reset.');
}


function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark-theme');

  // Optional: save preference
  if (body.classList.contains('dark-theme')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
}

// To apply saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
});

// highlight selected case
function showCase(caseId) {
  const cases = ['case1', 'case2', 'case3'];

  // Hide all sections
  cases.forEach(id => {
    document.getElementById(id).style.display = (id === caseId) ? 'block' : 'none';
  });

  // Update active button
  const buttons = document.querySelectorAll('#case-selector button');
  buttons.forEach(btn => {
    btn.classList.remove('active');
  });

  const activeButton = Array.from(buttons).find(btn =>
    btn.textContent.toLowerCase().includes(caseId.replace('case', 'case '))
  );
  if (activeButton) {
    activeButton.classList.add('active');
  }
}
