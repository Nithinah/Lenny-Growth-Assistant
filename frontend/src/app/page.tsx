"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Chat from "@/components/Chat";
import ArtifactViewer from "@/components/ArtifactViewer";
import { fetchSessions, createSession, fetchSession, deleteSession, API_BASE_URL } from "@/lib/api";

export default function Home() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeArtifact, setActiveArtifact] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState<"gemini" | "ollama">("gemini");

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewSession = async () => {
    try {
      const session = await createSession();
      setSessions([session, ...sessions]);
      setActiveSessionId(session.id);
      setMessages([]);
      setActiveArtifact(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectSession = async (id: string) => {
    try {
      setActiveSessionId(id);
      const sessionData = await fetchSession(id);
      setMessages(sessionData.messages || []);
      setActiveArtifact(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      // Remove from local state
      setSessions((prev) => prev.filter((s) => s.id !== id));
      // If deleted session was the active one, clear the chat
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setMessages([]);
        setActiveArtifact(null);
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  };

  const handleSendMessage = async (text: string) => {
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const newSess = await createSession();
      currentSessionId = newSess.id;
      setSessions([newSess, ...sessions]);
      setActiveSessionId(newSess.id);
    }

    // Optimistically add user message and empty assistant message
    const userMsg = { role: "user", content: text };
    const assistantMsg = { role: "assistant", content: "", artifact_data: null };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${currentSessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, model: model }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let fullContent = "";
      let buffer = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          // Process complete SSE events from the buffer
          const parts = buffer.split("\n\n");
          // Keep the last part as it may be incomplete
          buffer = parts.pop() || "";

          for (const part of parts) {
            const line = part.trim();
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.chunk) {
                  fullContent += data.chunk;
                  setMessages((prev) => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = {
                      ...newMsgs[newMsgs.length - 1],
                      content: fullContent,
                    };
                    return newMsgs;
                  });
                }
                if (data.done) {
                  // Re-fetch the session to get the parsed artifact_data if any
                  const updatedSession = await fetchSession(currentSessionId!);
                  setMessages(updatedSession.messages);
                  loadSessions(); // To update the title if it changed
                }
              } catch (err) {
                console.warn("SSE parse error:", err);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Chat error", e);
      // Show error to user instead of silent failure
      setMessages((prev) => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === "assistant") {
          newMsgs[newMsgs.length - 1] = {
            ...newMsgs[newMsgs.length - 1],
            content: "Sorry, an error occurred while connecting to the server. Please try again.",
          };
        }
        return newMsgs;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#0A0A10] text-gray-100 font-sans">
      <Sidebar
        sessions={sessions}
        activeSession={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />
      <div className="flex-1 flex w-full relative">
        <Chat
          messages={messages}
          isGenerating={isGenerating}
          onSendMessage={handleSendMessage}
          onViewArtifact={(artifact: any) => setActiveArtifact(artifact)}
          model={model}
          onModelChange={setModel}
        />
        {activeArtifact && (
          <ArtifactViewer
            artifact={activeArtifact}
            onClose={() => setActiveArtifact(null)}
          />
        )}
      </div>
    </main>
  );
}
