import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, FileCode, Folder, AlertCircle, Sun, Moon } from 'lucide-react';
import { adminV2Api, type FileTreeNode, type FileContent, type FileStats } from '@/lib/api';
import { cn } from '@/lib/utils';
import { FileInfoPanel } from './FileInfoPanel';

interface CodeViewerProps {
  selectedFile: FileTreeNode | null;
}

const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.json': 'json',
  '.md': 'markdown',
  '.sql': 'sql',
  '.css': 'css',
  '.scss': 'scss',
  '.html': 'html',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'bash',
  '.env': 'bash',
  '.txt': 'text',
};

const LANGUAGE_DISPLAY: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TSX',
  '.js': 'JavaScript',
  '.jsx': 'JSX',
  '.json': 'JSON',
  '.md': 'Markdown',
  '.sql': 'SQL',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.html': 'HTML',
  '.xml': 'XML',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.sh': 'Shell',
  '.bash': 'Bash',
  '.env': 'Env',
  '.txt': 'Text',
};

export function CodeViewer({ selectedFile }: CodeViewerProps) {
  const [content, setContent] = useState<FileContent | null>(null);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (!selectedFile || selectedFile.type === 'directory') {
      setContent(null);
      setStats(null);
      return;
    }

    const loadContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminV2Api.files.readFile(selectedFile.relativePath);
        if (response.success && response.data) {
          setContent(response.data);
        } else {
          setError(response.error?.message || 'Failed to load file');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const response = await adminV2Api.files.getStats(selectedFile.relativePath);
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch {
        // Stats are optional, ignore errors
      } finally {
        setStatsLoading(false);
      }
    };

    loadContent();
    loadStats();
  }, [selectedFile]);

  const handleCopy = async () => {
    if (content?.content) {
      await navigator.clipboard.writeText(content.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Empty state
  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-700 mb-4">
            <FileCode size={40} className="text-gray-500" />
          </div>
          <p className="text-gray-400 font-medium">Chon mot file de xem noi dung</p>
          <p className="text-sm text-gray-500 mt-1">Click vao file trong cay thu muc ben trai</p>
        </div>
      </div>
    );
  }

  // Directory selected
  if (selectedFile.type === 'directory') {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-yellow-900/30 mb-4">
            <Folder size={40} className="text-yellow-500" />
          </div>
          <p className="text-xl font-semibold text-gray-300">{selectedFile.name}/</p>
          <p className="text-sm text-gray-500 mt-2 max-w-xs">{selectedFile.descriptionVi}</p>
          <p className="text-xs mt-4 text-gray-600">{selectedFile.relativePath}</p>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-400">Đang tải nội dung file...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-red-900/10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-4">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <p className="text-red-400 font-medium">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  const language = LANGUAGE_MAP[selectedFile.extension || ''] || 'text';
  const languageDisplay = LANGUAGE_DISPLAY[selectedFile.extension || ''] || 'Text';

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-850 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <FileCode size={18} className="text-green-400" />
          <div>
            <span className="font-semibold text-gray-200">{selectedFile.name}</span>
            <span className="text-sm text-gray-500 ml-2">
              ({content?.lines.toLocaleString()} dong)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-gray-400 bg-gray-700 px-2.5 py-1 rounded-full">
            {languageDisplay}
          </span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? (
              <Sun size={16} className="text-yellow-400" />
            ) : (
              <Moon size={16} className="text-gray-400" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className={cn(
              'p-2 rounded-lg transition-colors',
              copied ? 'bg-green-600 text-white' : 'hover:bg-gray-700 text-gray-400',
            )}
            title="Copy code"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Description */}
      {selectedFile.descriptionVi && (
        <div className="px-4 py-2.5 bg-green-900/20 border-b border-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-green-400 flex-shrink-0">Mo ta:</span>
            <span className="text-sm text-gray-300">{selectedFile.descriptionVi}</span>
          </div>
        </div>
      )}

      {/* Code with Syntax Highlighting */}
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={darkMode ? oneDark : oneLight}
          showLineNumbers
          wrapLines
          lineNumberStyle={{
            minWidth: '3.5em',
            paddingRight: '1em',
            textAlign: 'right',
            userSelect: 'none',
            color: darkMode ? '#636d83' : '#9ca3af',
          }}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '13px',
            lineHeight: '1.6',
            minHeight: '100%',
            background: darkMode ? '#282c34' : '#fafafa',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
            },
          }}
        >
          {content?.content || ''}
        </SyntaxHighlighter>
      </div>

      {/* File Info Panel */}
      <FileInfoPanel stats={stats} loading={statsLoading} />
    </div>
  );
}
