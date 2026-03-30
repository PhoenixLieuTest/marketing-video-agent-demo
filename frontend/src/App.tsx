import VideoGenForm from "./components/VideoGenForm";

function App() {
  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-[var(--md-sys-typescale-title-large-weight)] text-center mb-4 text-[var(--md-sys-color-primary)]">
          Marketing Video Agent
        </h1>
        <p className="text-center text-[var(--md-sys-color-on-surface-variant)] mb-10">
          OpenClaw 智能選擇最佳影片生成方式（Text / Image to Video）
        </p>

        <VideoGenForm />
      </div>
    </div>
  );
}

export default App;
