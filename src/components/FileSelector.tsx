import { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Film } from 'lucide-react';

interface FileSelectorProps {
  onFileSelect: (file: File, url: string) => void;
}

export const FileSelector = ({ onFileSelect }: FileSelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    const url = URL.createObjectURL(file);
    onFileSelect(file, url);
  }, [onFileSelect]);

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Button
        variant="hero"
        size="xl"
        onClick={() => inputRef.current?.click()}
        className="gap-3"
      >
        <Upload className="w-5 h-5" />
        Select Video File
      </Button>
      
      <p className="text-sm text-muted-foreground">
        Supported formats: MP4, WebM, MOV, AVI
      </p>
    </div>
  );
};
