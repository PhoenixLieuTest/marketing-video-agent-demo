import os
import json
import asyncio
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Marketing Video Agent - OpenClaw + Haiper")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GATEWAY_URL = os.getenv("GATEWAY_URL", "http://127.0.0.1:18789")
OPENCLAW_TOKEN = os.getenv("OPENCLAW_GATEWAY_TOKEN")
HAIPER_API_KEY = os.getenv("HAIPER_API_KEY")

if not HAIPER_API_KEY:
    raise RuntimeError("Missing HAIPER_API_KEY in .env")

HAIPER_HEADERS = {
    "Authorization": f"Bearer {HAIPER_API_KEY}",
    "Content-Type": "application/json",
}

HAIPER_BASE = "https://api.haiper.ai/v1"


class GenerateRequest(BaseModel):
    prompt: str
    image_url: str = None


@app.post("/api/generate-video")
async def generate_video(req: GenerateRequest):
    # 1. 呼叫 OpenClaw 優化 Prompt (保持 Agent 屬性)
    system_prompt = f"你是一個影片行銷專家。請根據用戶需求：'{req.prompt}'，輸出一個適合 AI 生成影片的英文詳細描述。只輸出 JSON: {{\"optimized_prompt\": \"...\", \"mode\": \"text-to-video\"}}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            agent_resp = await client.post(
                f"{GATEWAY_URL}/v1/chat/completions",
                json={"model": "openclaw:main", "messages": [
                    {"role": "system", "content": system_prompt}]},
                headers={"Authorization": f"Bearer {OPENCLAW_TOKEN}"}
            )
            agent_json = json.loads(
                agent_resp.json()["choices"][0]["message"]["content"])
        except:
            agent_json = {"optimized_prompt": req.prompt,
                          "mode": "text-to-video"}

    # 2. 構造 JSON2Video Payload
    # JSON2Video 使用 ai-video 元素來處理生成
    video_element = {
        "type": "ai-video",
        "prompt": agent_json["optimized_prompt"],
        "duration": 5  # 免費版建議設短一點
    }

    # 如果有圖片，則轉為 Image-to-Video
    if req.image_url:
        video_element["extra"] = {"image": req.image_url}

    payload = {
        "scenes": [{"elements": [video_element]}]
    }

    headers = {"x-api-key": JSON2VIDEO_API_KEY,
               "Content-Type": "application/json"}

    # 3. 提交任務並輪詢
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Step A: 提交渲染
        submit_res = await client.post(JSON2VIDEO_URL, json=payload, headers=headers)
        project_id = submit_res.json().get("project")

        if not project_id:
            raise HTTPException(500, "JSON2Video 提交失敗")

        # Step B: 輪詢狀態 (最多等 3 分鐘)
        for _ in range(36):
            status_res = await client.get(f"{JSON2VIDEO_URL}?project={project_id}", headers=headers)
            data = status_res.json()

            if data.get("status") == "completed":
                return {
                    "status": "succeed",
                    "video_url": data.get("url"),
                    "agent_decision": agent_json
                }
            elif data.get("status") == "error":
                raise HTTPException(500, "JSON2Video 渲染出錯")

            await asyncio.sleep(5)

        raise HTTPException(504, "生成超時")


@app.get("/api/test-openclaw")
async def test_openclaw():
    return {"message": "OpenClaw gateway OK" if OPENCLAW_TOKEN else "Token missing"}
