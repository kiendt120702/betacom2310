import React, { useState, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';
import { VideoQuality } from '@/hooks/useVideoQuality';

interface QualityChangeIndicatorProps {
  quality: VideoQuality;
  isVisible: boolean;
  onHide: () => void;
}

const QualityChangeIndicator: React.FC<QualityChangeIndicatorProps> = ({
  quality,
  isVisible,
  onHide,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible) return null;

  return (
    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-white/20 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
      <Settings className="h-4 w-4 text-blue-400" />
      <span className="text-sm font-medium">
        Chất lượng: {quality.label}
      </span>
      <Check className="h-4 w-4 text-green-400" />
    </div>
  );
};

export default QualityChangeIndicator;