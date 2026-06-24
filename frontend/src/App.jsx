import { useState, useRef, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import MessageBubble from './components/MessageBubble'
import ChatInput from './components/ChatInput'

const API_BASE = 'http://localhost:8000'

const MOCK_KBS = [
  { id: '1', name: '技术文档', docCount: 5 },
  { id: '2', name: '产品手册', docCount: 3 },
]

export default function App() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('create')
  const [selectedKb, setSelectedKb] = useState('1')
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessions, setSessions] = useState([])
  const lastQuestionRef = useRef('')
  const eventSourceRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`)
      const data = await res.json()
      setSessions(data)
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0].id)
      }
    } catch {
      // ignore
    }
  }

  const fetchMessages = useCallback(async (sessionId) => {
    if (!sessionId) return
    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionId}/messages`)
      const data = await res.json()
      setMessages(data)
    } catch {
      setMessages([])
    }
  }, [])

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession)
    } else {
      setMessages([])
    }
  }, [selectedSession, fetchMessages])

  const sendMessage = useCallback(async (question) => {
    if (!question.trim() || loading) return
    lastQuestionRef.current = question

    let sessionId = selectedSession
    if (!sessionId) {
      try {
        const res = await fetch(`${API_BASE}/sessions`, { method: 'POST' })
        const data = await res.json()
        sessionId = data.id
        setSelectedSession(sessionId)
        setSessions(prev => [data, ...prev])
      } catch {
        return
      }
    }

    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)

    if (mode === 'create') {
      try {
        const res = await fetch(`${API_BASE}/chat/create?question=${encodeURIComponent(question)}&session_id=${sessionId}`)
        const text = await res.text()
        setMessages(prev => [...prev, { role: 'assistant', content: text }])
      } catch {
        setMessages(prev => [...prev, { role: 'assistant', content: '请求失败，请检查网络连接或稍后重试。' }])
      } finally {
        setLoading(false)
      }
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      const es = new EventSource(`${API_BASE}/chat/stream?question=${encodeURIComponent(question)}&session_id=${sessionId}`)
      eventSourceRef.current = es

      es.addEventListener('token', (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === 'token') {
            setMessages(prev => {
              const next = [...prev]
              const last = { ...next[next.length - 1], content: next[next.length - 1].content + data.content }
              next[next.length - 1] = last
              return next
            })
          }
        } catch { /* ignore */ }
      })

      es.addEventListener('done', () => {
        es.close()
        eventSourceRef.current = null
        setLoading(false)
      })

      es.onerror = () => {
        es.close()
        eventSourceRef.current = null
        setLoading(false)
      }
    }
  }, [loading, mode, selectedSession])

  const handleRegenerate = useCallback(() => {
    if (!lastQuestionRef.current || loading) return
    setMessages(prev => {
      const next = [...prev]
      next.pop()
      return next
    })
    sendMessage(lastQuestionRef.current)
  }, [loading, sendMessage])

  const clearChat = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setMessages([])
    setLoading(false)
  }

  const handleNewSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`, { method: 'POST' })
      const data = await res.json()
      setSessions(prev => [data, ...prev])
      setSelectedSession(data.id)
      setMessages([])
    } catch {
      // ignore
    }
  }

  const handleSelectSession = (id) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setSelectedSession(id)
    setLoading(false)
  }

  return (
    <div className="flex h-dvh bg-gray-100">
      <Sidebar
        knowledgeBases={MOCK_KBS}
        selectedKb={selectedKb}
        onSelectKb={setSelectedKb}
        sessions={sessions}
        selectedSession={selectedSession}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-800">RAG 知识库问答系统</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${mode === 'stream' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {mode === 'create' ? '一次性回复' : '流式回复'}
            </span>
            <button
              onClick={clearChat}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              title="清空当前对话"
            >
              🗑
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-sm">选择知识库，输入问题开始对话</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              onRegenerate={msg.role === 'assistant' ? handleRegenerate : undefined}
            />
          ))}
          {loading && mode === 'create' && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm animate-pulse">
                思考中...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <ChatInput
          onSend={sendMessage}
          loading={loading}
          mode={mode}
          onModeChange={setMode}
        />
      </div>
    </div>
  )
}
