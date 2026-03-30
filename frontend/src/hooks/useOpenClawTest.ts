import { useState, useEffect } from "react";
import api from "../services/api";

export const useOpenClawTest = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get("/api/test-openclaw")
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message);
      })
      .catch(() => setStatus("error"));
  }, []);

  return { status, message };
};
