import { useState, useRef } from 'react'

const API_BASE = 'http://localhost:8000'

export default function FileUploadModal({ knowledgeBases, onClose, onSuccess }) {
  const [selectedKb, setSelectedKb] = useState(knowledgeBases[0]?.id || '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedKb) return

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

      const res = await fetch(`${API_BASE}/upload?kb_id=${selectedKb}`, {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || '上传失败')
      }

      onSuccess?.()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">上传文件</h2>

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">目标知识库</label>
            <select
              value={selectedKb}
              onChange={(e) => setSelectedKb(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors bg-white"
            >
              {knowledgeBases.length === 0 && (
                <option value="">暂无知识库</option>
              )}
              {knowledgeBases.map((kb) => (
                <option key={kb.id} value={kb.id}>
                  {kb.name} ({kb.doc_count} 文档)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">选择文件</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors cursor-pointer text-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block text-gray-400 mb-1">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-sm text-gray-500">
                {uploading ? '上传中...' : '点击选择文件（PDF / TXT / DOCX）'}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
