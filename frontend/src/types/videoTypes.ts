export interface AgentDecision {
  type: "text-to-video" | "image-to-video";
  recommended_model: string;
  optimized_prompt: string;
  negative_prompt: string;
  duration: string;
  aspect_ratio: string;
  image_url?: string;
  reason: string;
}

export interface GenerateResponse {
  agent_decision: AgentDecision;
  task_id: string;
  type: string;
  status: string;
  note: string;
}

export interface PollResponse {
  status: "processing" | "succeed" | "failed";
  video_url?: string;
  message?: string;
}
