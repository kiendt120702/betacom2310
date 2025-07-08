
import React, { useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import LazyImage from '@/components/LazyImage';

interface ImagePreviewProps {
  src: string;
  alt: string;
  children: React.ReactNode;
}

const ImagePreview = ({ src, alt, children }: ImagePreviewProps) => {
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        side="right" 
        className="p-2 w-80 h-80 border-0 shadow-2xl"
        sideOffset={10}
      >
        <div className="w-full h-full rounded-lg overflow-hidden bg-muted">
          <LazyImage 
            src={src} 
            alt={alt}
            className="w-full h-full object-contain"
            placeholderClassName="w-full h-full"
          />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ImagePreview;
