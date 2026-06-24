import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock'

export default function MessageBubble({ message, onRegenerate }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}
      >
        {isUser ? (
          message.content
        ) : message.content ? (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-headings:text-gray-800 prose-strong:text-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:bg-gray-200 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-a:text-blue-600">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  if (match) {
                    return <CodeBlock language={match[1]}>{children}</CodeBlock>
                  }
                  return (
                    <code className="px-1 py-0.5 bg-gray-200 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  )
                },
                pre({ children }) {
                  return <>{children}</>
                },
              }}
            >
              {message.content}
            </Markdown>
          </div>
        ) : (
          <span className="text-gray-400 italic">正在生成...</span>
        )}
      </div>

      {!isUser && message.content && (
        <div className="flex items-center gap-1 mt-1 px-1">
          <button
            onClick={handleCopyAll}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
              copied
                ? 'text-green-600 bg-green-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
            }`}
            title="复制全部"
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            )}
          </button>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors cursor-pointer"
              title="重新生成"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
