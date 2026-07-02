import { useState, useEffect } from 'react'

export default function SettingsModal({ kb, onClose, onSave }) {
  const [chunkSize, setChunkSize] = useState(kb.chunk_size ?? 1000)
  const [chunkOverlap, setChunkOverlap] = useState(kb.chunk_overlap ?? 200)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setChunkSize(kb.chunk_size ?? 1000)
    setChunkOverlap(kb.chunk_overlap ?? 200)
  }, [kb])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(kb.id, { chunk_size: chunkSize, chunk_overlap: chunkOverlap })
      onClose()
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          知识库参数设置 - {kb.name}
        </h2>
        <p className="text-xs text-gray-400 mb-4">修改后将影响后续上传文档的切分方式</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              切分大小（chunk_size）
            </label>
            <input
              type="number"
              min={100}
              max={10000}
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              重叠大小（chunk_overlap）
            </label>
            <input
              type="number"
              min={0}
              max={2000}
              value={chunkOverlap}
              onChange={(e) => setChunkOverlap(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
