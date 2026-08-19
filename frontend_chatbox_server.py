"""
Simple FastAPI server for the chatbot widget.
Serves static files for Vercel deployment.
"""

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

app = FastAPI(title="Chatbot Widget")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

WIDGET_DIR = project_root


@app.get("/widget.css")
async def serve_css():
    return FileResponse(os.path.join(WIDGET_DIR, "widget.css"))


@app.get("/widget.js")
async def serve_js():
    return FileResponse(os.path.join(WIDGET_DIR, "widget.js"))


@app.get("/avatar.png")
async def serve_avatar():
    avatar_path = os.path.join(WIDGET_DIR, "avatar.png")
    if not os.path.exists(avatar_path):
        for name in os.listdir(WIDGET_DIR):
            if name.lower().endswith(".png"):
                avatar_path = os.path.join(WIDGET_DIR, name)
                break
    if os.path.exists(avatar_path):
        return FileResponse(avatar_path)
    return JSONResponse({"error": "avatar not found"}, status_code=404)


@app.get("/")
async def serve_index():
    index_path = os.path.join(project_root, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"message": "Chatbot Widget is running"})
