# Audio Implementation - Wedding Invitation

## Overview
The wedding invitation now includes a fully functional audio player that automatically plays the wedding song (`public/audio/wedding-song.mp3`) when the user opens the invitation.

## Features Implemented

### 1. **Auto-Play Functionality**
- Music starts automatically when the user clicks "Buka Undangan" (Open Invitation)
- Respects browser auto-play policies by triggering after user interaction
- Fallback mechanism for browsers with strict auto-play restrictions

### 2. **Loop Playback**
- Audio is set to loop continuously (`audio.loop = true`)
- Music plays throughout the entire invitation experience

### 3. **Audio Controls**
- Floating play/pause button in the bottom-right corner
- Visual feedback with different states:
  - **Loading**: Gray button with spinning loader
  - **Playing**: Blue button with pause icon and pulse animation
  - **Paused**: Blue button with play icon

### 4. **User Experience Enhancements**
- Volume set to 70% for comfortable listening
- Smooth transitions and hover effects
- Accessible with proper ARIA labels and tooltips
- Responsive design for all screen sizes

## Technical Implementation

### AudioPlayer Component (`src/components/AudioPlayer.tsx`)

#### Key Features:
1. **Real Audio Element**: Uses actual HTML5 Audio API instead of simulation
2. **Event-Driven Architecture**: Listens for custom `startAudio` event from main page
3. **State Management**: Tracks loading, playing, and first-play states
4. **Error Handling**: Graceful fallback if auto-play fails

#### Audio Properties:
```javascript
audio.loop = true;           // Continuous playback
audio.preload = 'auto';      // Preload audio data
audio.volume = 0.7;          // 70% volume
```

#### Event Listeners:
- `loadeddata`: Audio file loaded successfully
- `play`: Audio started playing
- `pause`: Audio paused
- `error`: Handle audio loading/playback errors

### Main Page Integration (`src/app/page.tsx`)

#### Auto-Play Trigger:
```javascript
const handleOpenInvitation = () => {
  // ... existing code ...
  
  // Trigger custom event untuk memulai audio
  const audioStartEvent = new CustomEvent('startAudio');
  window.dispatchEvent(audioStartEvent);
};
```

## Browser Compatibility

### Auto-Play Policies:
- **Chrome/Edge**: Requires user interaction before auto-play
- **Firefox**: Generally allows auto-play with user interaction
- **Safari**: Strict auto-play policies, requires explicit user action
- **Mobile Browsers**: Usually require user interaction

### Fallback Mechanisms:
1. **Primary**: Custom event triggered when opening invitation
2. **Secondary**: Document click listener as fallback
3. **Manual**: User can always click the play button

## File Structure
```
public/
  audio/
    wedding-song.mp3          # Wedding song audio file

src/
  components/
    AudioPlayer.tsx           # Main audio player component
  app/
    page.tsx                  # Main page with audio integration
```

## Usage Instructions

### For Users:
1. Open the wedding invitation
2. Click "Buka Undangan" to open the invitation
3. Music should start playing automatically
4. Use the floating button to pause/resume music
5. Music will loop continuously throughout the experience

### For Developers:
1. Audio file should be placed in `public/audio/wedding-song.mp3`
2. AudioPlayer component is automatically included in the main page
3. No additional configuration needed

## Troubleshooting

### Common Issues:
1. **Audio not playing**: Check browser console for auto-play restrictions
2. **File not found**: Ensure `wedding-song.mp3` exists in `public/audio/`
3. **Volume too low/high**: Adjust `audio.volume` in AudioPlayer component

### Browser Console Messages:
- `"Audio loaded successfully"`: Audio file loaded properly
- `"Auto-play started successfully"`: Auto-play worked
- `"Autoplay failed"`: Browser blocked auto-play (user can still play manually)

## Future Enhancements

Potential improvements that could be added:
1. Volume control slider
2. Multiple song playlist
3. Fade in/out effects
4. Audio visualization
5. Song progress indicator
