import { useState, useEffect, useRef } from 'react'

const API_BASE = 'http://localhost:8000'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentPanel({ kbId, kbName, onBack }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const fetchDocuments = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/upload?kb_id=${kbId}`)
      if (!res.ok) throw new Error('获取文档列表失败')
      const data = await res.json()
      setDocuments(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (kbId) fetchDocuments()
  }, [kbId])

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'txt', 'docx'].includes(ext)) {
      setError('仅支持 PDF、TXT、DOCX 格式')
      return
    }

    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch(`${API_BASE}/upload?kb_id=${kbId}`, {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || '上传失败')
      }

      await fetchDocuments()
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (docId, filename) => {
    if (!confirm(`确定删除 "${filename}"？\n对应向量数据也将被清除。`)) return

    try {
      const res = await fetch(`${API_BASE}/upload/${docId}?kb_id=${kbId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('删除失败')
      await fetchDocuments()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          返回
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{kbName} - 文档管理</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {error && (
          <div className="mb-4 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
            {error}
            <button onClick={() => setError('')} className="ml-2 font-bold cursor-pointer">&times;</button>
          </div>
        )}

        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors">
          <label className="flex flex-col items-center gap-2 cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-sm text-gray-500">
              {uploading ? '上传中...' : '点击上传文件（PDF / TXT / DOCX）'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <h3 className="text-sm font-semibold text-gray-500 mb-3">文档列表 ({documents.length})</h3>

        {loading ? (
          <div className="text-center py-8 text-sm text-gray-400 animate-pulse">加载中...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">暂无文档，请上传</div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">
                    {doc.file_type === 'pdf' ? '📄' : doc.file_type === 'docx' ? '📝' : '📃'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.filename}</p>
                    <p className="text-xs text-gray-400">
                      {formatSize(doc.file_size)} · {doc.chunk_count} 分块
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id, doc.filename)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
