import { useRef, useState } from 'react';
import { Music, Trash2, Play, Pause, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioUploadProps {
  currentUrl: string | null;
  audioDuration: number | null;
  audioFileSize: number | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
  isUploading?: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function AudioUpload({
  currentUrl,
  audioDuration,
  audioFileSize,
  onUpload,
  onDelete,
  isUploading,
}: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('File audio tối đa 20MB');
      return;
    }

    onUpload(file);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/mp4,audio/m4a"
        className="hidden"
        onChange={handleChange}
      />

      {currentUrl ? (
        <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3">
          <audio ref={audioRef} src={currentUrl} onEnded={() => setIsPlaying(false)} />
          <Music className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">Audio</p>
            <p className="text-xs text-gray-500">
              {audioDuration ? formatDuration(audioDuration) : '--:--'}
              {audioFileSize ? ` - ${formatFileSize(audioFileSize)}` : ''}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex h-20 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
        >
          <Upload className="h-5 w-5" />
          <div className="text-left">
            <p className="text-sm">{isUploading ? 'Đang tải...' : 'Chọn file MP3'}</p>
            <p className="text-xs">MP3, M4A - Tối đa 20MB</p>
          </div>
        </button>
      )}
    </div>
  );
}
