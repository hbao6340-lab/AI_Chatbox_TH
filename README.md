# Chatbot Widget - UBND Phu?ng T�n Hung

Widget chatbot c� th? nh�ng v�o b?t k? website n�o, s? d?ng c�ng backend AI v� co s? tri th?c v? Phu?ng T�n Hung.

## C?u tr�c

- `index.html` - HTML ch�nh c?a widget
- `widget.css` - Styles cho widget
- `widget.js` - Logic JavaScript c?a widget
- `embed.html` - Single-file embeddable version
- `demo.html` - Demo page with instructions
- `frontend_chatbox_server.py` - FastAPI server for local/Vercel
- `vercel.json` - Vercel deployment config
- `pyproject.toml` - Python project config for Vercel
- `requirements.txt` - Python dependencies
- `avatar.png` - Bot avatar image

## C�ch s? d?ng

### Local development

```bash
cd frontend_chatbox
uvicorn frontend_chatbox_server:app --reload --port 8000
# Open http://localhost:8000
```

### Nh�ng v�o website

```html
<link rel="stylesheet" href="widget.css">
<script src="widget.js"></script>
<!-- HTML structure from index.html -->
```

## Vercel Deployment

- `pyproject.toml` has `[project]` table for `uv lock`
- `vercel.json` routes `/api/chat` to `frontend_chatbox_server.py`
- Entrypoint: `frontend_chatbox_server.py:app`

## T�ch h?p Backend

- `/api/chat` - Fast text-only responses
- `/api/audio` - Audio retrieval endpoint
- Knowledge base: 1049 chunks from 28 documents about Phu?ng T�n Hung
