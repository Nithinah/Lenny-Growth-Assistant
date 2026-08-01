import { X, Code, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ArtifactViewer({ artifact, onClose }: any) {
  if (!artifact) return null;

  const isHtml = artifact.type === "html";

  return (
    <div className="w-[50%] h-[calc(100vh-2rem)] my-4 mr-4 rounded-3xl border border-gray-200/60 bg-white flex flex-col shadow-2xl shadow-indigo-900/5 overflow-hidden transition-all duration-300 ease-out z-30">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3 text-gray-800 font-semibold">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/50">
            {isHtml ? <Code size={16} /> : <FileText size={16} />}
          </div>
          <span className="tracking-tight">{isHtml ? "Preview: HTML/CSS" : "Generated Document"}</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-white p-8 custom-scrollbar">
        {isHtml ? (
          <iframe
            sandbox="allow-scripts allow-same-origin"
            srcDoc={artifact.content}
            className="w-full h-full border border-gray-200 rounded-xl shadow-sm"
            title="Generated UI"
          />
        ) : (
          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-img:rounded-xl">
            <ReactMarkdown>{artifact.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
