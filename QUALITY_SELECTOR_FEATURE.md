# Video Quality Selector - YouTube Style

## 🎯 **Feature Overview**

Đã implement **quality selector giống YouTube** với khả năng:
- ⚙️ **Auto quality** dựa trên connection speed
- 📺 **Manual quality selection** (240p → 4K)
- 🔍 **Smart quality detection** từ video source
- 🎛️ **Connection-aware recommendations**
- 🎬 **Visual quality change indicators**

## ✅ **Features Implemented**

### 1. **Quality Selection UI**
```typescript
// Dropdown menu giống YouTube
<QualitySelector
  availableQualities={availableQualities}
  currentQuality={currentQuality} 
  isAutoMode={isAutoMode}
  onQualityChange={switchQuality}
/>
```

**Features:**
- ✅ Dropdown menu với quality options
- ✅ Auto mode với connection detection
- ✅ Visual badges (HD, 4K, Khuyến nghị)
- ✅ Disabled states cho qualities không available
- ✅ Keyboard navigation support

### 2. **Smart Quality Detection**
```typescript
// Auto-detect video resolution
const detectVideoQuality = (video: HTMLVideoElement) => {
  const height = video.videoHeight;
  const width = video.videoWidth;
  
  // Match với predefined qualities hoặc tạo custom
  return findMatchingQuality(height, width);
}
```

**Quality Levels:**
- 📺 **2160p (4K)** - 3840x2160, 25Mbps
- 📺 **1440p (2K)** - 2560x1440, 16Mbps  
- 📺 **1080p (HD)** - 1920x1080, 8Mbps
- 📺 **720p** - 1280x720, 5Mbps
- 📺 **480p** - 854x480, 2.5Mbps
- 📺 **360p** - 640x360, 1Mbps
- 📺 **240p** - 426x240, 0.5Mbps
- 🔄 **Auto** - Dynamic selection

### 3. **Connection-Based Auto Selection**
```typescript
const getRecommendedQuality = () => {
  const connection = navigator.connection;
  
  // 4G + Fast: 1080p
  // 4G + Medium: 720p  
  // 3G: 480p
  // 2G: 360p
  
  return optimalQuality;
}
```

### 4. **Visual Feedback System**
- 🎯 **Quality change indicator** overlay
- 🔔 **Toast notifications** khi switch
- ⚡ **Auto badge** cho recommended mode
- 🏷️ **HD/4K badges** cho high quality
- ❌ **Disabled styling** cho unavailable qualities

## 🛠️ **Technical Implementation**

### Core Hook: `useVideoQuality`
```typescript
const {
  currentQuality,        // Currently selected quality
  availableQualities,    // Available quality options  
  detectedQuality,       // Auto-detected from video
  isAutoMode,           // Auto vs manual selection
  switchQuality,        // Function to change quality
} = useVideoQuality(videoElement);
```

### Components Architecture:
```
OptimizedVideoPlayer
├── QualitySelector (Settings dropdown)
├── QualityChangeIndicator (Visual feedback) 
└── useVideoQuality (Core logic)
```

## 🎨 **UI/UX Features**

### Quality Selector Dropdown:
- **Modern dark theme** với backdrop blur
- **Keyboard navigation** với arrow keys
- **Visual hierarchy** - highest quality first
- **Status indicators** - active, disabled, badges
- **Connection info** - auto explanation
- **Click outside** to close

### Quality Change Feedback:
- **Animated indicator** top-right overlay
- **Toast notification** với quality info
- **Smooth transitions** between states
- **Auto-hide** after 2 seconds

## 🚀 **Advanced Features**

### 1. **Connection Monitoring**
```typescript
// Monitor connection changes for auto mode
connection.addEventListener('change', () => {
  if (isAutoMode) {
    const newQuality = getRecommendedQuality();
    switchQuality(newQuality);
  }
});
```

### 2. **Smart Available Qualities**
- Chỉ show qualities **<= detected resolution**
- **Gray out** qualities cao hơn source
- **Auto mode always available**

### 3. **Seamless Quality Switching**
```typescript
const switchQuality = (quality) => {
  const currentTime = video.currentTime;
  const wasPlaying = !video.paused;
  
  // Switch quality (in real app would change video URL)
  // Restore playback position and state
  
  video.currentTime = currentTime;
  if (wasPlaying) video.play();
}
```

## 📱 **Responsive Design**

- **Desktop**: Full quality labels + icons
- **Tablet**: Shortened labels + icons
- **Mobile**: Icons only với tooltips
- **Small screens**: Compact dropdown menu

## 🎯 **User Experience**

### Auto Mode (Default):
1. **Detect** video quality và connection
2. **Recommend** optimal quality  
3. **Show badge** "Khuyến nghị"
4. **Auto-adjust** khi connection changes

### Manual Mode:
1. **User clicks** quality selector
2. **Show available** qualities với visual cues
3. **User selects** desired quality
4. **Visual feedback** + toast notification
5. **Remember choice** for session

## 🔄 **Integration Points**

### Video Player Integration:
```typescript
// Add to OptimizedVideoPlayer controls
<div className="flex items-center gap-2">
  <PlaybackSpeedButton />
  <QualitySelector />  {/* 🆕 Quality selector */}
  <FullscreenButton />
</div>
```

### Toast Integration:
```typescript
toast({
  title: "Đã chuyển chất lượng", 
  description: `Video hiện đang phát ở chất lượng ${quality.label}`,
  duration: 2000,
});
```

## 🚀 **Future Enhancements**

### Server-side Integration:
```typescript
// Multiple quality URLs from server
const qualityUrls = {
  '1080p': 'video_1080p.mp4',
  '720p': 'video_720p.mp4', 
  '480p': 'video_480p.mp4',
  'auto': 'video_adaptive.m3u8' // HLS stream
};
```

### Advanced Features:
- **HLS/DASH streaming** support
- **Bandwidth-based auto-switching** 
- **Quality analytics** tracking
- **Preload multiple qualities**
- **Buffer-aware switching**

## ✨ **Demo Behavior**

1. **Video loads** → Auto-detect quality
2. **Connection detected** → Recommend optimal quality  
3. **User clicks ⚙️** → Show quality options
4. **User selects quality** → Visual feedback + switch
5. **Quality indicator** → Shows briefly then fades
6. **Auto mode** → Continues monitoring connection

**Build successful** ✅ - Quality selector ready to use! 🎬