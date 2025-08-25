import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, FastForward, Rewind, Forward } from 'lucide-react';
import QualitySelector from './QualitySelector';
import { VideoQuality, QualityOption } from '@/hooks/useVideoQuality';

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  progress: number;
  currentTime: number;
  duration: number;
  playbackRate: number;
  availableQualities: QualityOption[];
  currentQuality: VideoQuality;
  isAutoMode: boolean;
  formatTime: (seconds: number) => string;
  togglePlayPause: () => void;
  toggleMute: () => void;
  handleVolumeChange: (volume: number) => void;
  toggleFullscreen: () => void;
  togglePlaybackSpeed: () => void;
  handleProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleSeek: (seconds: number) => void;
  switchQuality: (quality: VideoQuality) => void;
  handleQualityChange: (quality: VideoQuality) => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying, isMuted, volume, progress, currentTime, duration, playbackRate,
  availableQualities, currentQuality, isAutoMode,
  formatTime, togglePlayPause, toggleMute, handleVolumeChange, toggleFullscreen,
  togglePlaybackSpeed, handleProgressClick, handleSeek, switchQuality, handleQualityChange
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div
        className="w-full h-1 bg-white/30 rounded-full mb-2 md:mb-3 cursor-pointer"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-white rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="sm" onClick={togglePlayPause} className="p-1 h-auto text-white hover:bg-white/20">
            {isPlaying ? <Pause className="h-4 w-4 md:h-5 md:w-5" /> : <Play className="h-4 w-4 md:h-5 md:w-5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleSeek(-10)} className="p-1 h-auto text-white hover:bg-white/20">
            <Rewind className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleSeek(10)} className="p-1 h-auto text-white hover:bg-white/20">
            <Forward className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={toggleMute} className="p-1 h-auto text-white hover:bg-white/20">
              {isMuted || volume === 0 ? <VolumeX className="h-3 w-3 md:h-4 md:w-4" /> : <Volume2 className="h-3 w-3 md:h-4 md:w-4" />}
            </Button>
            <div className="hidden sm:flex items-center w-12 md:w-16">
              <input
                type="range" min="0" max="1" step="0.1" value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                style={{ background: `linear-gradient(to right, white 0%, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)` }}
              />
            </div>
          </div>
          <span className="text-xs md:text-sm font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="sm" onClick={togglePlaybackSpeed} className="p-1 h-auto text-white hover:bg-white/20 flex items-center gap-1">
            <FastForward className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs font-mono">{playbackRate.toFixed(2)}x</span>
          </Button>
          <QualitySelector
            availableQualities={availableQualities}
            currentQuality={currentQuality}
            isAutoMode={isAutoMode}
            onQualityChange={(quality) => {
              switchQuality(quality);
              handleQualityChange(quality);
            }}
          />
          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="p-1 h-auto text-white hover:bg-white/20">
            <Maximize className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;