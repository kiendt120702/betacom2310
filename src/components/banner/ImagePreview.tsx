
import React, { useState, useRef } from 'react';
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
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const previewWidth = 300; // Width of preview image
    
    // Calculate position - show on the right if there's space, otherwise on the left
    let x = rect.right + 10;
    if (x + previewWidth > viewportWidth) {
      x = rect.left - previewWidth - 10;
    }
    
    setPreviewPosition({
      x: Math.max(10, x), // Ensure it doesn't go off screen
      y: rect.top
    });
    
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  return (
    <>
      <div
        ref={containerRef}
        className={cn("relative", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {showPreview && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${previewPosition.x}px`,
            top: `${previewPosition.y}px`,
          }}
        >
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
    </>
  );
};

export default ImagePreview;
