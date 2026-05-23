# clo-clo-tes-la

Claude voice assistant embedded in the Tesla web browser.

- French push-to-talk interface
- Browser-native speech recognition and synthesis (Web Speech API)
- Minimal FastAPI backend that proxies requests to the Anthropic API
- Exposed over HTTPS through a cloudflared tunnel

> The app itself talks to the driver in French — this README and the architecture docs are in English so the project stays approachable to a wider audience.

## Prerequisites

- Python 3.12 (on macOS: `brew install python@3.12`)
- cloudflared (on macOS: `brew install cloudflared`)
- An Anthropic API key — create an account at [console.anthropic.com](https://console.anthropic.com)

## Installation

```bash
git clone https://github.com/osadey/clo-clo-tes-la.git
cd clo-clo-tes-la
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp .env.example .env
# edit .env and paste your ANTHROPIC_API_KEY
```

## Running the app

In two separate terminals:

**Terminal 1 — backend:**
```bash
cd clo-clo-tes-la
source .venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 — public HTTPS tunnel:**
```bash
cloudflared tunnel --url http://localhost:8000
```

cloudflared prints a public URL such as `https://xxxx-xxxx.trycloudflare.com` — that's the one to open in the Tesla browser.

## Local test (recommended before the Tesla test)

1. Open `http://localhost:8000` in Chrome or Safari on your Mac
2. Grant microphone permission
3. Press the blue button, speak, release
4. Claude replies out loud (in French)

## Tesla test

1. Open the `https://xxxx.trycloudflare.com` URL in the Tesla browser (car parked)
2. Grant microphone permission if prompted
3. Push-to-talk

The #1 known risk is that the Tesla browser (an older Chromium) may not support the Web Speech API. If it doesn't, the fallback is to record audio in the browser (MediaRecorder API) and run STT server-side with Whisper.

## Documentation

- [Detailed architecture](docs/ARCHITECTURE.md) — diagrams, technical choices, security, roadmap
