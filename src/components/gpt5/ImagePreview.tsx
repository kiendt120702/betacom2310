
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onRemove }) => {
  const imageUrl = React.useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);

  React.useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  return (
    <div className="relative inline-block max-w-xs">
      <img
        src={imageUrl}
        alt="Preview"
        className="max-w-full max-h-32 rounded-lg border"
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 w-6 h-6"
        onClick={onRemove}
      >
        <X className="w-3 h-3" />
      </Button>
      <div className="text-xs text-muted-foreground mt-1">
        {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
      </div>
    </div>
  );
};

export default ImagePreview;
