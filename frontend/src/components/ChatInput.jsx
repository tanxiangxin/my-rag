import { useState } from 'react'

export default function ChatInput({ onSend, loading }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!loading) {
      onSend(input)
      setInput('')
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder="输入您的问题... (Enter 发送, Shift+Enter 换行)"
            rows={1}
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
            style={{ minHeight: '42px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? '...' : '发送'}
          </button>
        </div>
      </form>
    </div>
  )
}
