import os
import base64
from fastapi import HTTPException
import httpx

HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
if not HF_TOKEN:
    raise RuntimeError("Missing HF_TOKEN")

HF_HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"}

# 假設這段在 async def generate_video(...) 裡面
async with httpx.AsyncClient(timeout=600) as client:
    if agent_json["type"] == "text-to-video":
        model_id = "ali-vilab/text-to-video-ms-1.7b"  # 更新為最新 repo 名稱
        payload = {
            "inputs": agent_json["optimized_prompt"],
            # 可選: "parameters": {"negative_prompt": agent_json.get("negative_prompt", "")}
        }
        endpoint = f"https://api-inference.huggingface.co/models/{model_id}"

    elif agent_json["type"] == "image-to-video":
        model_id = "stabilityai/stable-video-diffusion-img2vid"  # 或 "-xt" 版本
        image_input = agent_json.get("image_url") or req.image_url  # 防呆
        if not image_input:
            raise HTTPException(400, "Image-to-Video 需要 image_url")

        payload = {
            "inputs": image_input,  # HF 支援 URL
            "parameters": {
                "motion_bucket_id": 127,
                "fps": 7,
                # 可加: "num_inference_steps": 25, "noise_aug_strength": 0.02
            }
        }
        endpoint = f"https://api-inference.huggingface.co/models/{model_id}"

    else:
        raise HTTPException(400, f"不支援類型: {agent_json['type']}")

    try:
        resp = await client.post(endpoint, headers=HF_HEADERS, json=payload, timeout=600)
        resp.raise_for_status()
        video_bytes = resp.content
        video_base64 = base64.b64encode(video_bytes).decode('utf-8')

        return {
            "agent_decision": agent_json,
            "status": "succeed",
            "video_base64": video_base64,
            "note": "生成完成（可能有延遲）"
        }

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 503:
            return {"status": "queued", "note": "HF 忙碌中，請 2-10 分鐘後再試"}
        raise HTTPException(500, f"HF 錯誤: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"生成失敗: {str(e)}")
