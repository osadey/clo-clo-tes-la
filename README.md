# clo-clo-tes-la

Assistant vocal Claude embarqué dans le navigateur d'une Tesla.

- Push-to-talk en français
- Reconnaissance et synthèse vocale natives du navigateur (Web Speech API)
- Backend FastAPI minimaliste qui relaye vers l'API Claude
- Exposé en HTTPS via un tunnel cloudflared

## Prérequis

- Python 3.12 (sur macOS : `brew install python@3.12`)
- cloudflared (sur macOS : `brew install cloudflared`)
- Une clé API Anthropic — créer un compte sur [console.anthropic.com](https://console.anthropic.com)

## Installation

```bash
git clone https://github.com/osadey/clo-clo-tes-la.git
cd clo-clo-tes-la
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp .env.example .env
# éditer .env et coller ta clé ANTHROPIC_API_KEY
```

## Lancement

Dans deux terminaux séparés :

**Terminal 1 — backend :**
```bash
cd clo-clo-tes-la
source .venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 — tunnel HTTPS public :**
```bash
cloudflared tunnel --url http://localhost:8000
```

cloudflared affiche une URL publique du type `https://xxxx-xxxx.trycloudflare.com` — c'est celle à ouvrir dans le navigateur de la Tesla.

## Test local (recommandé avant la Tesla)

1. Ouvre `http://localhost:8000` dans Chrome ou Safari sur ton Mac
2. Autorise l'accès au micro
3. Appuie sur le bouton bleu, parle, relâche
4. Claude répond à l'oral

## Test dans la Tesla

1. Ouvre l'URL `https://xxxx.trycloudflare.com` dans le navigateur Tesla (voiture à l'arrêt)
2. Autorise l'accès au micro si demandé
3. Push-to-talk

Le risque #1 est que le navigateur Tesla (Chromium ancien) ne supporte pas Web Speech API. Si c'est le cas, on basculera sur Whisper côté backend (audio enregistré dans le navigateur, envoyé au serveur).

## Documentation

- [Architecture détaillée](docs/ARCHITECTURE.md) — diagrammes, choix techniques, sécurité, feuille de route

## Licence

[MIT](LICENSE)
