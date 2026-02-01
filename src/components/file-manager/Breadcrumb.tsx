

import { ChevronRight, Home, Folder, FileCode } from 'lucide-react';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  if (!path) return null;

  const parts = path.split('/').filter(Boolean);
  const isFile = path.includes('.');

  return (
    <div className="flex items-center gap-1 px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-850 border-b border-gray-700 text-sm overflow-x-auto">
      {/* Home/Root */}
      <button
        onClick={() => onNavigate('')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-gray-700 text-gray-400 transition-colors"
        title="Ve thu muc goc"
      >
        <Home size={14} />
        <span className="font-medium">root</span>
      </button>

      {parts.map((part, index) => {
        const currentPath = parts.slice(0, index + 1).join('/');
        const isLast = index === parts.length - 1;
        const isFolder = !isLast || !isFile;

        return (
          <div key={currentPath} className="flex items-center">
            <ChevronRight size={14} className="text-gray-600 mx-0.5 flex-shrink-0" />
            <button
              onClick={() => !isLast && onNavigate(currentPath)}
              disabled={isLast}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                isLast
                  ? 'font-semibold text-green-400 bg-green-900/30 cursor-default'
                  : 'hover:bg-gray-700 text-gray-400 cursor-pointer'
              }`}
              title={isLast ? 'File hien tai' : `Mo thu muc ${part}`}
            >
              {isFolder ? (
                <Folder size={14} className="text-yellow-500 flex-shrink-0" />
              ) : (
                <FileCode size={14} className="text-green-400 flex-shrink-0" />
              )}
              <span className="truncate max-w-[150px]">{part}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
