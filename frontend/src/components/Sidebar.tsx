import { PlusCircle, MessageSquare, Trash2 } from "lucide-react";

export default function Sidebar({
  sessions,
  activeSession,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: any) {
  return (
    <div className="w-72 bg-gradient-to-b from-gray-950 to-gray-900 text-gray-300 h-screen flex flex-col p-5 border-r border-gray-800 shadow-2xl relative z-20">
      <div className="mb-8 flex items-center gap-3 font-bold text-lg text-white">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="text-white text-sm">L</span>
        </div>
        Lenny Assistant
      </div>

      <button
        onClick={onNewSession}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 font-semibold mb-8 group"
      >
        <PlusCircle size={18} className="transition-transform group-hover:rotate-90" />
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">
          Chat History
        </h3>
        <div className="flex flex-col gap-1.5">
          {sessions.map((session: any) => (
            <div
              key={session.id}
              className={`group flex items-center gap-3 text-left px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeSession === session.id
                  ? "bg-gray-800/80 text-white shadow-inner border border-gray-700/50"
                  : "text-gray-400 hover:bg-gray-800/40 hover:text-gray-200 border border-transparent"
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare size={16} className={`flex-shrink-0 ${activeSession === session.id ? "text-indigo-400" : ""}`} />
              <span className="truncate text-sm flex-1 font-medium">
                {session.title || "New Chat"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0 p-1 hover:bg-red-400/10 rounded-md"
                title="Delete chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
