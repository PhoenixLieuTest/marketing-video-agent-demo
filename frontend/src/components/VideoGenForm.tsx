import { useState } from "react";
import api from "../services/api";

export default function VideoGenForm() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agentDecision, setAgentDecision] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVideoUrl(null);
    setErrorMessage(null);
    setAgentDecision(null);

    try {
      const res = await api.post("/api/generate-video", {
        prompt,
        image_url: imageUrl.trim() || undefined,
      });

      const data = res.data;
      if (data.status === "succeed") {
        setVideoUrl(data.video_url);
        setAgentDecision(data.agent_decision);
      } else {
        setErrorMessage(data.note || "生成失敗，服務目前繁忙。");
      }
    } catch (err: any) {
      setErrorMessage("無法連接到 AI 生成引擎，請檢查網路或後端狀態。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      {/* 產品標題區 */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1
          style={{
            color: "var(--md-sys-color-primary)",
            fontSize: "var(--md-sys-typescale-title-large-size)",
            fontWeight: "var(--md-sys-typescale-title-large-weight)",
          }}
        >
          AI Marketing Video Agent
        </h1>
        <p
          style={{
            color: "var(--md-sys-color-on-surface-variant)",
            fontSize: "0.875rem",
          }}
        >
          支援 Text-to-Video 及 Image-to-Video 高品質生成
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "var(--md-sys-color-surface)",
          padding: "2rem",
          borderRadius: "var(--md-sys-shape-corner-large)",
          boxShadow: "var(--md-sys-elevation-level2)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          border: "1px solid var(--md-sys-color-outline-variant, #e7e0ec)",
        }}
      >
        {/* Prompt 輸入 */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label
            style={{
              fontSize: "var(--md-sys-typescale-label-large-size)",
              fontWeight: "var(--md-sys-typescale-label-large-weight)",
              color: "var(--md-sys-color-on-surface)",
            }}
          >
            影片場景描述 (Text-to-Video)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="請描述你想生成的影片內容..."
            required
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "var(--md-sys-shape-corner-medium)",
              border: "1px solid var(--md-sys-color-outline)",
              backgroundColor: "transparent",
              color: "var(--md-sys-color-on-surface)",
              minHeight: "120px",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Image URL 輸入 */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label
            style={{
              fontSize: "var(--md-sys-typescale-label-large-size)",
              fontWeight: "var(--md-sys-typescale-label-large-weight)",
              color: "var(--md-sys-color-on-surface)",
            }}
          >
            起始圖片 URL (Image-to-Video 模式)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="貼上圖片網址以根據圖片生成影片..."
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "var(--md-sys-shape-corner-medium)",
              border: "1px solid var(--md-sys-color-outline)",
              backgroundColor: "transparent",
              color: "var(--md-sys-color-on-surface)",
              fontFamily: "inherit",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          style={{
            width: "100%",
            padding: "1rem",
            borderRadius: "var(--md-sys-shape-corner-extra-large)",
            border: "none",
            backgroundColor: loading
              ? "var(--md-sys-color-surface-variant)"
              : "var(--md-sys-color-primary)",
            color: loading
              ? "var(--md-sys-color-on-surface-variant)"
              : "var(--md-sys-color-on-primary)",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "var(--md-sys-elevation-level1)",
            transition: "0.2s opacity",
          }}
        >
          {loading ? "Agent 正在處理請求..." : "立即生成影片"}
        </button>

        {/* 錯誤顯示 */}
        {errorMessage && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--md-sys-color-error-container)",
              color: "var(--md-sys-color-on-error-container)",
              borderRadius: "var(--md-sys-shape-corner-medium)",
              fontSize: "0.875rem",
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}
      </form>

      {/* Agent 決策展示 */}
      {agentDecision && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1.5rem",
            backgroundColor: "var(--md-sys-color-secondary-container)",
            color: "var(--md-sys-color-on-secondary-container)",
            borderRadius: "var(--md-sys-shape-corner-large)",
            border: "1px dashed var(--md-sys-color-outline)",
          }}
        >
          <h3
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.5rem",
              opacity: 0.8,
            }}
          >
            OpenClaw Agent Orchestration Log
          </h3>
          <div
            style={{
              fontSize: "0.875rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <p>
              <strong>偵測模式:</strong> {agentDecision.mode}
            </p>
            <p>
              <strong>優化指令:</strong> {agentDecision.optimized_prompt}
            </p>
          </div>
        </div>
      )}

      {/* 影片播放器 */}
      {videoUrl && (
        <div style={{ marginTop: "2rem" }}>
          <video
            src={videoUrl}
            controls
            style={{
              width: "100%",
              borderRadius: "var(--md-sys-shape-corner-extra-large)",
              boxShadow: "var(--md-sys-elevation-level3)",
              backgroundColor: "#000",
            }}
          />
        </div>
      )}
    </div>
  );
}
