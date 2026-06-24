export default function Sidebar({
  knowledgeBases,
  selectedKb,
  onSelectKb,
  sessions,
  selectedSession,
  onSelectSession,
  onNewSession,
}) {
  return (
    <aside className="w-60 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">📚 知识库</h2>
      </div>
      <div className="px-2 py-2 space-y-0.5">
        {knowledgeBases.map(kb => (
          <button
            key={kb.id}
            onClick={() => onSelectKb(kb.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              selectedKb === kb.id
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{selectedKb === kb.id ? '●' : '○'}</span>
            {kb.name}
            <span className="ml-2 text-xs text-gray-400">({kb.docCount})</span>
          </button>
        ))}
        <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
          ＋ 新建知识库
        </button>
      </div>

      <div className="mt-2 px-4 py-3 border-t border-gray-200">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">💬 会话列表</h2>
      </div>
      <div className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {sessions.map(s => (
          <button
            key={s.id}
            onClick={() => onSelectSession(s.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              selectedSession === s.id
                ? 'bg-gray-200 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="px-2 py-3 border-t border-gray-200">
        <button
          onClick={onNewSession}
          className="w-full px-3 py-2 rounded-lg text-sm text-blue-600 hover:bg-blue-50 border border-dashed border-blue-300 transition-colors cursor-pointer"
        >
          ＋ 新建会话
        </button>
      </div>
    </aside>
  )
}
