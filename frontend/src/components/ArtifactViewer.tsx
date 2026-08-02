import { X, Code, FileText, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

export default function ArtifactViewer({ artifact, onClose }: any) {
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");

  if (!artifact) return null;

  const isHtml = artifact.type === "html";

  return (
    <div className="w-1/2 min-w-[400px] h-screen bg-[#FDFDFD] flex flex-col border-l border-gray-200/80 shadow-2xl transition-all duration-300 ease-in-out z-30 flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/80 bg-white">
        <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
          {isHtml ? <Code size={16} /> : <FileText size={16} />}
          <span>{isHtml ? "HTML/CSS Artifact" : "Markdown Document"}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200/50">
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === "preview"
                  ? "bg-white text-gray-800 shadow-sm border border-gray-200/60"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Eye size={14} /> Preview
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === "code"
                  ? "bg-white text-gray-800 shadow-sm border border-gray-200/60"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Code size={14} /> Code
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white custom-scrollbar">
        {viewMode === "preview" ? (
          <div className="h-full p-8">
            {isHtml ? (
              <iframe
                sandbox="allow-scripts allow-same-origin"
                srcDoc={artifact.content}
                className="w-full h-full border border-gray-200 rounded-xl shadow-sm bg-white"
                title="Generated UI"
              />
            ) : (
              <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-img:rounded-xl">
                <ReactMarkdown>{artifact.content}</ReactMarkdown>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full p-6 bg-[#1E1E1E]">
            <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
              <code>{artifact.content}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
