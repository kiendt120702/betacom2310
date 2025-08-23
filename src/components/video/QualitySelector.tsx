import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Check, Zap, Wifi } from 'lucide-react';
import { QualityOption, VideoQuality } from '@/hooks/useVideoQuality';

interface QualitySelectorProps {
  availableQualities: QualityOption[];
  currentQuality: VideoQuality;
  isAutoMode: boolean;
  onQualityChange: (quality: VideoQuality) => void;
  className?: string;
}

const QualitySelector: React.FC<QualitySelectorProps> = ({
  availableQualities,
  currentQuality,
  isAutoMode,
  onQualityChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleQualitySelect = (quality: VideoQuality) => {
    onQualityChange(quality);
    setIsOpen(false);
  };

  const getQualityIcon = (quality: QualityOption) => {
    if (quality.id === 'auto') {
      return <Zap className="h-3 w-3" />;
    }
    if (!quality.available) {
      return <Wifi className="h-3 w-3 text-muted-foreground" />;
    }
    return null;
  };

  const getCurrentDisplayLabel = () => {
    if (isAutoMode) {
      return `Tự động (${currentQuality.label})`;
    }
    return currentQuality.label;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Quality Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 h-auto text-white hover:bg-white/20 flex items-center gap-1"
        title="Chất lượng video"
      >
        <Settings className="h-3 w-3 md:h-4 md:w-4" />
        <span className="text-xs font-mono hidden sm:inline">
          {isAutoMode ? 'Auto' : currentQuality.label}
        </span>
      </Button>

      {/* Quality Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 min-w-48 max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-white/70 font-medium mb-2 px-2">
              Chất lượng video
            </div>
            
            <div className="space-y-1">
              {availableQualities.map((quality) => (
                <button
                  key={quality.id}
                  onClick={() => quality.available && handleQualitySelect(quality)}
                  disabled={!quality.available}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors
                    ${quality.available 
                      ? 'text-white hover:bg-white/10 cursor-pointer' 
                      : 'text-white/40 cursor-not-allowed'
                    }
                    ${quality.active ? 'bg-white/20' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {getQualityIcon(quality)}
                    <span className={quality.available ? '' : 'line-through'}>
                      {quality.label}
                    </span>
                    
                    {/* Quality badges */}
                    {quality.id === 'auto' && (
                      <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">
                        Khuyến nghị
                      </span>
                    )}
                    {quality.height >= 1080 && quality.available && (
                      <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded">
                        HD
                      </span>
                    )}
                    {quality.height >= 2160 && quality.available && (
                      <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">
                        4K
                      </span>
                    )}
                  </div>

                  {quality.active && (
                    <Check className="h-4 w-4 text-blue-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Info footer */}
            <div className="mt-3 pt-2 border-t border-white/10">
              <div className="text-xs text-white/50 px-2">
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="h-3 w-3" />
                  <span>Tự động: Điều chỉnh theo kết nối</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  <span>Chất lượng cao hơn nguồn không khả dụng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quality indicator overlay (when changing) */}
      <style>{`
        @keyframes qualityChange {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1); }
        }
        
        .quality-change-indicator {
          animation: qualityChange 1.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default QualitySelector;