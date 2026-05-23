const pttButton = document.getElementById("ptt");
const resetButton = document.getElementById("reset");
const statusEl = document.getElementById("status");
const userBubble = document.getElementById("user-bubble");
const claudeBubble = document.getElementById("claude-bubble");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let history = [];
let recognition = null;
let isListening = false;

function setStatus(text, state) {
    statusEl.textContent = text;
    statusEl.className = state || "";
}

function showUser(text) {
    userBubble.textContent = text;
    userBubble.classList.remove("hidden");
}

function showClaude(text) {
    claudeBubble.textContent = text;
    claudeBubble.classList.remove("hidden");
}

function speak(text) {
    return new Promise((resolve) => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "fr-FR";
        utter.rate = 1.05;
        utter.onend = resolve;
        utter.onerror = resolve;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
    });
}

async function sendToClaude(userText) {
    history.push({ role: "user", content: userText });
    setStatus("Clo-clo réfléchit…", "thinking");
    try {
        const r = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: history }),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const reply = data.reply || "(pas de réponse)";
        history.push({ role: "assistant", content: reply });
        showClaude(reply);
        setStatus("Clo-clo parle…", "speaking");
        await speak(reply);
        setStatus("Prêt");
    } catch (err) {
        setStatus(`Erreur : ${err.message}`, "error");
    }
}

function setupRecognition() {
    if (!SpeechRecognition) {
        setStatus("Reconnaissance vocale non supportée par ce navigateur", "error");
        pttButton.disabled = true;
        return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        if (transcript) {
            showUser(transcript);
            sendToClaude(transcript);
        } else {
            setStatus("Je n'ai rien entendu", "error");
        }
    };
    recognition.onerror = (event) => {
        setStatus(`Erreur micro : ${event.error}`, "error");
        stopListening();
    };
    recognition.onend = () => {
        if (isListening) stopListening();
    };
}

function startListening() {
    if (!recognition || isListening) return;
    window.speechSynthesis.cancel();
    try {
        recognition.start();
        isListening = true;
        pttButton.classList.add("active");
        setStatus("J'écoute…", "listening");
    } catch (err) {
        setStatus(`Impossible de démarrer : ${err.message}`, "error");
    }
}

function stopListening() {
    if (!recognition) return;
    if (isListening) {
        try { recognition.stop(); } catch (_) {}
        isListening = false;
        pttButton.classList.remove("active");
    }
}

pttButton.addEventListener("pointerdown", (e) => { e.preventDefault(); startListening(); });
pttButton.addEventListener("pointerup",   (e) => { e.preventDefault(); stopListening(); });
pttButton.addEventListener("pointerleave",(e) => { if (isListening) stopListening(); });
pttButton.addEventListener("pointercancel",()=> stopListening());

resetButton.addEventListener("click", () => {
    history = [];
    userBubble.classList.add("hidden");
    claudeBubble.classList.add("hidden");
    userBubble.textContent = "";
    claudeBubble.textContent = "";
    window.speechSynthesis.cancel();
    setStatus("Nouvelle conversation");
});

setupRecognition();
setStatus("Prêt");
