import { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  FolderTree,
  Code2,
  Loader2,
  X,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { FileTree } from '@/components/file-manager/FileTree';
import { CodeViewer } from '@/components/file-manager/CodeViewer';
import { Breadcrumb } from '@/components/file-manager/Breadcrumb';
import { CodeHealthReport } from '@/components/file-manager/CodeHealthReport';
import { adminV2Api, type FileTreeNode } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function FileManagerPage() {
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileTreeNode[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHealthReport, setShowHealthReport] = useState(true);

  // Load tree on mount
  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminV2Api.files.getTree(undefined, 4);
      if (response.success && response.data) {
        setTree(response.data);
      } else {
        setError(response.error?.message || 'Failed to load file tree');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file tree');
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    try {
      const response = await adminV2Api.files.search(searchQuery);
      if (response.success && response.data) {
        setSearchResults(response.data.files || []);
      } else {
        setError(response.error?.message || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  // Handle file selection from health report
  const handleSelectFromReport = (filePath: string) => {
    const ext = '.' + filePath.split('.').pop();
    setSelectedFile({
      name: filePath.split('/').pop() || filePath,
      path: `/home/cdhc/apps/cdhc-be/${filePath}`,
      relativePath: filePath,
      type: 'file',
      descriptionVi: 'File tu bao cao suc khoe code',
      extension: ext,
    });
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = (path: string) => {
    if (!path) {
      setSelectedFile(null);
      loadTree();
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
            <FolderTree className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">File Manager</h1>
            <p className="text-sm text-gray-500">Quản lý và xem mã nguồn Backend</p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 py-2.5 w-72 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-800 text-gray-200 placeholder-gray-500 text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
              searching || !searchQuery.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm',
            )}
          >
            {searching ? <Loader2 size={16} className="animate-spin" /> : 'Tim'}
          </button>
          {searchResults && (
            <button
              onClick={clearSearch}
              className="px-3 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-xl transition-colors"
              title="Xóa kết quả tìm kiếm"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={loadTree}
            disabled={loading}
            className="p-2.5 hover:bg-gray-800 rounded-xl text-gray-400 transition-colors"
            title="Lam moi"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-green-400' : ''} />
          </button>
          <button
            onClick={() => setShowHealthReport(!showHealthReport)}
            className={cn(
              'p-2.5 rounded-xl transition-colors',
              showHealthReport
                ? 'bg-green-900/30 text-green-400'
                : 'hover:bg-gray-800 text-gray-500',
            )}
            title="Báo cáo sức khỏe code"
          >
            <Activity size={18} />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb path={selectedFile?.relativePath || ''} onNavigate={handleBreadcrumbNavigate} />

      {/* Error Banner */}
      {error && (
        <div className="px-6 py-3 bg-red-900/20 border-b border-red-800 flex items-center gap-2 text-red-400">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tree & Health Report */}
        <div className="w-80 border-r border-gray-800 bg-gray-900 overflow-hidden flex flex-col">
          {/* Tree Header */}
          <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">
              {searchResults ? 'Kết quả tìm kiếm' : 'Cấu trúc thư mục'}
            </span>
            {searchResults && (
              <span className="text-xs text-gray-500">{searchResults.length} files</span>
            )}
          </div>

          {/* Tree Content */}
          <div className="flex-1 overflow-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 size={24} className="animate-spin text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Dang tai...</p>
                </div>
              </div>
            ) : searchResults ? (
              searchResults.length > 0 ? (
                <FileTree
                  nodes={searchResults}
                  onSelectFile={setSelectedFile}
                  selectedPath={selectedFile?.path}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Khong tim thay ket qua</p>
                </div>
              )
            ) : (
              <FileTree
                nodes={tree}
                onSelectFile={setSelectedFile}
                selectedPath={selectedFile?.path}
              />
            )}
          </div>

          {/* Health Report */}
          {showHealthReport && (
            <div className="border-t border-gray-700 p-3 bg-gray-800/30 max-h-[400px] overflow-auto">
              <CodeHealthReport onSelectFile={handleSelectFromReport} />
            </div>
          )}
        </div>

        {/* Right Panel - Code Viewer */}
        <div className="flex-1 overflow-hidden">
          <CodeViewer selectedFile={selectedFile} />
        </div>
      </div>

      {/* Footer - Stats */}
      <div className="px-6 py-2.5 border-t border-gray-800 bg-gray-900 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Code2 size={12} />
            Backend: /home/cdhc/apps/cdhc-be
          </span>
          <span className="text-gray-700">|</span>
          <span>Chi doc (Read-only)</span>
          <span className="text-gray-700">|</span>
          <span>Mo ta tieng Viet co san</span>
        </div>
        <div className="text-gray-600">File Manager v2.0</div>
      </div>
    </div>
  );
}
