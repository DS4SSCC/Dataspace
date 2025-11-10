const logElem = document.getElementById("log");
const catalogElem = document.getElementById("catalog");

function appendLog(msg) {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}\n`;
    logElem.textContent += line;
    logElem.scrollTop = logElem.scrollHeight;
}

function flash(id) {
    const el = document.getElementById(id);
    el.classList.add("active");
    setTimeout(() => el.classList.remove("active"), 1000);
}

function animateArrow(id, type = "ldn") {
    const el = document.getElementById(id);
    el.classList.add("active", type);
    setTimeout(() => el.classList.remove("active", type), 1200);
}

function produce(port) {
    appendLog(`→ Producer triggered on port ${port} (LDES)`);
    flash(port === "3001" ? "providerA" : "providerB");

    fetch(`http://localhost:${port}/produce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notify: "http://localhost:4000/inbox" }),
    }).then(() => {
        appendLog(`→ LDN notification sent from Provider ${port === "3001" ? "A" : "B"}`);
        animateArrow(port === "3001" ? "arrowA" : "arrowB", "ldn");
    });
}

async function loadCatalog() {
    const resp = await fetch("/catalog");
    const data = await resp.json();
    catalogElem.textContent = JSON.stringify(data, null, 2);
    flash("registry");
    appendLog(`📚 Registry catalog updated (${data.length} items)`);
}

// Live log via Server-Sent Events (SSE)
const evtSource = new EventSource("/events");
evtSource.onmessage = (e) => appendLog(e.data);
