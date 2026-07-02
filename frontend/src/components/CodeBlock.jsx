import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false)
  const code = String(children).replace(/\n$/, '')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const ext = language === 'python' ? 'py'
      : language === 'javascript' || language === 'js' ? 'js'
      : language === 'typescript' || language === 'ts' ? 'ts'
      : language === 'jsx' ? 'jsx'
      : language === 'tsx' ? 'tsx'
      : language === 'html' ? 'html'
      : language === 'css' ? 'css'
      : language === 'json' ? 'json'
      : language === 'bash' || language === 'sh' ? 'sh'
      : language === 'sql' ? 'sql'
      : language === 'yaml' || language === 'yml' ? 'yml'
      : language === 'xml' ? 'xml'
      : language === 'rust' ? 'rs'
      : language === 'go' ? 'go'
      : language === 'java' ? 'java'
      : language === 'cpp' || language === 'c' ? language
      : 'txt'

    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const langLabel = language
    ? { python: 'Python', javascript: 'JavaScript', js: 'JavaScript', typescript: 'TypeScript', ts: 'TypeScript', jsx: 'JSX', tsx: 'TSX', html: 'HTML', css: 'CSS', json: 'JSON', bash: 'Bash', sh: 'Shell', sql: 'SQL', yaml: 'YAML', yml: 'YAML', xml: 'XML', rust: 'Rust', go: 'Go', java: 'Java', cpp: 'C++', c: 'C', 'c#': 'C#', cs: 'C#', php: 'PHP', ruby: 'Ruby', r: 'R', swift: 'Swift', kotlin: 'Kotlin', scala: 'Scala', dart: 'Dart', dockerfile: 'Dockerfile', makefile: 'Makefile', tex: 'LaTeX', diff: 'Diff', docker: 'Docker', text: 'Text' }[language]
    : null

  const customStyle = {
    ...oneLight,
    'pre[class*="language-"]': {
      ...oneLight['pre[class*="language-"]'],
      background: '#ffffff',
      margin: 0,
      padding: '16px 20px',
      fontSize: '13px',
      lineHeight: '1.6',
      borderRadius: 0,
    },
    'code[class*="language-"]': {
      ...oneLight['code[class*="language-"]'],
      background: '#ffffff',
      fontSize: '13px',
      lineHeight: '1.6',
      fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Consolas', monospace",
    },
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
          </span>
          {langLabel && (
            <span className="ml-2 text-xs font-medium text-gray-600 bg-gray-200 px-2.5 py-0.5 rounded-md">
              {langLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
            title="下载代码文件"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            下载
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors cursor-pointer ${
              copied
                ? 'text-green-600 bg-green-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
            }`}
            title="复制代码"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                已复制
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                复制
              </>
            )}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={customStyle}
        customStyle={{
          margin: 0,
          padding: '16px 20px',
          background: '#ffffff',
          borderRadius: 0,
        }}
        showLineNumbers={false}
        wrapLines={false}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
