
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import LazyImage from '@/components/LazyImage';

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  children: React.ReactNode;
}

const ImagePreview = ({ src, alt, className, children }: ImagePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleMouseEnter = () => {
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {showPreview && (
        <div className="absolute left-full top-0 ml-2 z-50 pointer-events-none">
          <div className="bg-white rounded-lg shadow-2xl border border-border p-2 animate-fade-in">
            <LazyImage
              src={src}
              alt={alt}
              className="w-80 h-80 object-contain rounded"
              placeholderClassName="w-80 h-80"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
