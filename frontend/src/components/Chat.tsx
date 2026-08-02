"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Terminal, BookOpen, TrendingUp, Edit3, Code } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Chat({
  messages,
  isGenerating,
  onSendMessage,
  onViewArtifact,
  model,
  onModelChange,
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

  const samplePrompts = [
    {
      title: "LNO Framework",
      description: "How does Shreyas Doshi define leverage tasks?",
      icon: <BookOpen className="text-yellow-500 w-5 h-5" />,
      prompt: "How does Shreyas Doshi define leverage tasks?",
    },
    {
      title: "B2B PLG Growth",
      description: "What does Elena Verna say about self-serve...",
      icon: <TrendingUp className="text-emerald-500 w-5 h-5" />,
      prompt: "What does Elena Verna say about self-serve PLG growth?",
    },
    {
      title: "Ship30for30 Essay",
      description: "Write a 1250-word essay on product velocity",
      icon: <Edit3 className="text-purple-400 w-5 h-5" />,
      prompt: "Write a 1250-word essay on product velocity in the style of Ship30for30",
    },
    {
      title: "Interactive Artifact",
      description: "Build an HTML growth calculator dashboard",
      icon: <Code className="text-indigo-400 w-5 h-5" />,
      prompt: "Build an HTML growth calculator dashboard",
    },
  ];

  return (
    <div className="flex flex-col h-screen flex-1 bg-[#0A0A10] relative">
      <div className="flex items-center justify-between p-6 w-full">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Active Session
        </div>
        
        <div className="flex items-center bg-[#1C1C24] p-1 rounded-xl border border-[#2B2B36] shadow-sm">
          <button
            onClick={() => onModelChange("gemini")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              model === "gemini"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Gemini
          </button>
          <button
            onClick={() => onModelChange("ollama")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              model === "ollama"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Local Ollama
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div className="p-6 md:p-8 flex flex-col gap-8 w-full max-w-4xl mx-auto pb-36">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full mt-10">
            <div className="bg-[#1C1C24] border border-[#2B2B36] rounded-2xl p-10 w-full text-center mb-8 shadow-xl">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-indigo-400 text-2xl font-bold">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">What would you like to explore today?</h2>
              <p className="text-gray-400 text-sm">
                Ask about product frameworks, growth loops or request a Ship30for30 essay & code artifact.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {samplePrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(item.prompt)}
                  className="flex flex-col items-start p-5 bg-[#14141B] border border-[#2B2B36] rounded-xl hover:bg-[#1C1C24] hover:border-indigo-500/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {item.icon}
                    <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{item.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors line-clamp-1">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg: any, i: number) => {
            const isGeneratingEmpty = isGenerating && i === messages.length - 1 && msg.role === "assistant" && !msg.content;
            if (isGeneratingEmpty) return null;

            return (
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
                      ? "bg-indigo-600 text-white rounded-br-sm shadow-indigo-500/20"
                      : "bg-[#1C1C24] text-gray-200 border border-[#2B2B36] rounded-bl-sm shadow-black/50"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-a:text-indigo-400 hover:prose-a:text-indigo-300">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                  )}

                  {msg.artifact_data && (
                    <button
                      onClick={() => onViewArtifact(msg.artifact_data)}
                      className="mt-4 flex items-center gap-2 bg-[#2B2B36] hover:bg-[#363644] text-indigo-300 px-4 py-2.5 rounded-xl text-sm transition-colors font-semibold border border-[#3E3E4D] shadow-sm w-fit"
                    >
                      <Terminal size={16} className="text-indigo-400" />
                      View generated artifact
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {isGenerating && (
          <div className="flex justify-start w-full">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md mr-3 mt-1 flex-shrink-0">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            <div className="bg-[#1C1C24] border border-[#2B2B36] shadow-sm shadow-black/50 rounded-2xl rounded-bl-sm px-6 py-4 text-gray-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0A0A10] via-[#0A0A10]/80 to-transparent pt-10">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto relative flex items-center shadow-2xl shadow-black/50 rounded-2xl bg-[#1C1C24] border border-[#2B2B36]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Lenny a question or ask for a Ship30for30 essay..."
            className="w-full bg-transparent border-none rounded-2xl pl-6 pr-14 py-4 focus:ring-0 focus:outline-none transition-all text-gray-200 placeholder-gray-500 text-[15px]"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-900/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

