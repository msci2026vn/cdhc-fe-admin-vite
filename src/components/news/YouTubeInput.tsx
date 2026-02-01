import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface YouTubeInputProps {
  value: string;
  onChange: (videoId: string) => void;
}

function extractVideoId(input: string): string {
  if (!input) return '';
  // Already a video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  // Full URL
  try {
    const url = new URL(input);
    if (url.hostname.includes('youtube.com')) {
      return url.searchParams.get('v') || '';
    }
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1);
    }
  } catch {
    // not a URL
  }
  return input;
}

export function YouTubeInput({ value, onChange }: YouTubeInputProps) {
  const [rawInput, setRawInput] = useState(value ? `https://www.youtube.com/watch?v=${value}` : '');

  const handleChange = (input: string) => {
    setRawInput(input);
    const videoId = extractVideoId(input.trim());
    onChange(videoId);
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="https://youtube.com/watch?v=... hoặc video ID"
        value={rawInput}
        onChange={(e) => handleChange(e.target.value)}
      />
      {value && (
        <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden border">
          <iframe
            src={`https://www.youtube.com/embed/${value}`}
            title="YouTube Preview"
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
