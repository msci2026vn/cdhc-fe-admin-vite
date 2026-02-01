import { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ThumbnailUploadProps {
  currentUrl: string | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
  isUploading?: boolean;
}

export function ThumbnailUpload({
  currentUrl,
  onUpload,
  onDelete,
  isUploading,
}: ThumbnailUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh tối đa 5MB');
      return;
    }

    setPreview(URL.createObjectURL(file));
    onUpload(file);
  };

  const displayUrl = preview || currentUrl;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      {displayUrl ? (
        <div className="relative inline-block">
          <img
            src={displayUrl}
            alt="Thumbnail"
            className="h-32 w-48 rounded-lg object-cover border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-7 w-7"
            onClick={() => {
              setPreview(null);
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex h-32 w-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
        >
          <ImagePlus className="h-8 w-8 mb-1" />
          <span className="text-xs">{isUploading ? 'Đang tải...' : 'Chọn ảnh'}</span>
          <span className="text-xs mt-0.5">PNG, JPG, WebP - Max 5MB</span>
        </button>
      )}
    </div>
  );
}
