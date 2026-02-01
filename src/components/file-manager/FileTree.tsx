

import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  File,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileTreeNode } from '@/lib/api';

interface FileTreeProps {
  nodes: FileTreeNode[];
  onSelectFile: (node: FileTreeNode) => void;
  selectedPath?: string;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  '.ts': FileCode,
  '.tsx': FileCode,
  '.js': FileCode,
  '.jsx': FileCode,
  '.json': FileJson,
  '.md': FileText,
  '.sql': FileCode,
  '.css': FileCode,
  '.html': FileCode,
  '.yaml': FileText,
  '.yml': FileText,
  '.env': FileText,
};

export function FileTree({ nodes, onSelectFile, selectedPath }: FileTreeProps) {
  return (
    <div className="text-sm">
      {nodes.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          onSelectFile={onSelectFile}
          selectedPath={selectedPath}
          level={0}
        />
      ))}
    </div>
  );
}

interface TreeItemProps {
  node: FileTreeNode;
  onSelectFile: (node: FileTreeNode) => void;
  selectedPath?: string;
  level: number;
}

function TreeItem({ node, onSelectFile, selectedPath, level }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const isSelected = selectedPath === node.path;
  const isDirectory = node.type === 'directory';

  const IconComponent = isDirectory
    ? isOpen
      ? FolderOpen
      : Folder
    : FILE_ICONS[node.extension || ''] || File;

  const handleClick = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 py-1.5 px-2 cursor-pointer rounded-md hover:bg-gray-800 group transition-colors',
          isSelected && 'bg-green-900/30 text-green-400'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {/* Expand/Collapse icon */}
        {isDirectory && (
          <span className="w-4 h-4 flex items-center justify-center text-gray-500">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        {!isDirectory && <span className="w-4" />}

        {/* File/Folder icon */}
        <IconComponent
          size={16}
          className={cn(
            isDirectory ? 'text-yellow-500' : 'text-gray-400',
            isSelected && 'text-green-400'
          )}
        />

        {/* Name */}
        <span className="flex-1 truncate font-medium text-gray-200">
          {node.name}
        </span>

        {/* Vietnamese description - show on hover */}
        {node.descriptionVi && (
          <span className="hidden group-hover:inline text-xs text-gray-500 truncate max-w-[180px]">
            {node.descriptionVi}
          </span>
        )}
      </div>

      {/* Children */}
      {isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              onSelectFile={onSelectFile}
              selectedPath={selectedPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
