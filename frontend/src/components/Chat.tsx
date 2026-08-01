"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Chat({
  messages,
  isGenerating,
  onSendMessage,
  onViewArtifact,
}: any) {
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen flex-1 bg-transparent relative">
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 w-full max-w-4xl mx-auto custom-scrollbar pb-36">
        {messages.map((msg: any, i: number) => (
          <div
            key={i}
            className={`flex w-full ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md mr-3 mt-1 flex-shrink-0">
                <span className="text-white text-xs font-bold">L</span>
              </div>
            )}
            
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-6 py-4 shadow-sm ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-br-sm shadow-indigo-500/20"
                  : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-gray-200/50"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-slate prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
              )}

              {msg.artifact_data && (
                <button
                  onClick={() => onViewArtifact(msg.artifact_data)}
                  className="mt-4 flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm transition-colors font-semibold border border-indigo-100 shadow-sm w-fit"
                >
                  <Terminal size={16} className="text-indigo-500" />
                  View generated artifact
                </button>
              )}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start w-full">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md mr-3 mt-1 flex-shrink-0">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm shadow-gray-200/50 rounded-2xl rounded-bl-sm px-6 py-4 text-gray-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent pt-10">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto relative flex items-center shadow-xl shadow-gray-200/50 rounded-2xl bg-white border border-gray-100"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Lenny a question or ask for a Ship30for30 essay..."
            className="w-full bg-transparent border-none rounded-2xl pl-6 pr-14 py-4 focus:ring-0 focus:outline-none transition-all text-gray-800 placeholder-gray-400 text-[15px]"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-500/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
