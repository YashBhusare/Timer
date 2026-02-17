# 🎤 NCRA Conference Timer

A sophisticated presentation timer designed for academic conferences and professional presentations with visual and audio warnings.

## Features

### ⏱️ Core Functionality
- **Custom Timer Setup** - Configure talk duration, warning times, and Q&A duration
- **Real-time Countdown** - Display remaining time in large, easy-to-read format
- **Progress Tracking** - Visual progress bar showing talk progress

### ⚠️ Multi-Stage Warning System

**Primary Warning (Yellow)** ⚡
- Text turns yellow
- Border blinks yellow
- Audio beep sound
- Voice announcement of remaining time
- Customizable warning threshold (default: 5 minutes)

**Secondary Warning (Red)** 🔴
- Text turns red
- Border blinks red faster
- Periodic warning sounds
- Customizable threshold (default: 2 minutes)

**Final Warning (Blinking Red)** 🚨
- Entire screen and text blink red
- Continuous audio warnings
- Voice alert when time expires

### 🎤 Q&A Phase
- Automatic transition to Q&A timer after talk ends
- Customizable Q&A duration
- "Please take it offline" announcement when Q&A time is consumed
- Red warning state when approaching time limit

### 🎵 Audio Features
- Web Audio API for precise beep sounds
- Web Speech API for voice announcements
- Different sound patterns for different warnings
- Emergency "Please take it offline" announcement

### 🎉 Easter Eggs
- Click the egg (🥚) in the bottom-right corner to discover hidden tips
- 5 different motivational messages
- Easter eggs trigger fun sound effects

### ⌨️ Keyboard Shortcuts
- **SPACE** - Pause/Resume timer
- **ESC** - Reset and return to setup
- **Right-click on egg** - Surprise sound!

## How to Use

### 1. Open the Application
- Open `index.html` in any modern web browser

### 2. Configure Your Presentation
```
Setup Screen:
├── Talk Duration: How long will your presentation be? (in minutes)
├── Primary Warning Time: When should first warning trigger? (minutes before end)
├── Secondary Warning Time: When should final warning trigger? (minutes before end)
└── Q&A Duration: How long for questions and answers? (in minutes)
```

**Recommended Settings:**
- 15-minute talk
- 5-minute primary warning
- 2-minute secondary warning
- 3-5 minutes Q&A

### 3. Start the Timer
- Click "START TIMER" button
- Timer will immediately begin countdown

### 4. Monitor During Talk
- Watch remaining time in center display
- Visual alerts will trigger at configured warning times
- Audio and voice notifications will announce time remaining

### 5. Q&A Session
- After talk time expires, automatically transitions to Q&A timer
- Same warning system applies
- When Q&A time is consumed, you'll hear "Please take it offline"

### 6. Controls During Talk
- **Pause** - Freeze the timer (shows pause status)
- **Resume** - Continue countdown
- **Reset** - Stop timer and return to setup screen

## Visual Warning Progression

```
Normal State (0→primary warning)
    ↓
💛 Yellow Warning (primary warning → secondary warning)
    - Text: Yellow
    - Border: Blinking Yellow
    - Sound: Single Beep + Voice
    ↓
🔴 Red Warning (secondary warning → 0)
    - Text: Red
    - Border: Blinking Red (faster)
    - Sound: Periodic Beeps
    ↓
🚨 Time Expired
    - Text: Blinking Red
    - Border: Fast Red Blink
    - Sound: Continuous Warnings
    - Voice: "Time is up"
```

## Browser Compatibility

✅ **Supported Browsers:**
- Chrome/Chromium (recommended)
- Firefox
- Edge
- Safari (requires speaker permission for audio)

**Requirements:**
- Modern browser with Web Audio API support
- Speaker/Headset for audio features
- Microphone access for voice announcement (most browsers handle this)

## Customization Tips

### Change Warning Colors
Edit `style.css` - Look for `warning-primary` and `warning-secondary` classes

### Adjust Animation Speed
Modify `@keyframes` animations in CSS to change blink frequency

### Customize Sounds
Modify audio generation code in `script.js` `playWarningSound()` and `playEndWarning()` functions

## Performance Notes

- ✅ Works offline - no internet required
- ✅ No external dependencies
- ✅ Lightweight and fast
- ✅ Full-screen mode recommended for presentations
- ✅ Can be projected on screen while speaker notes on another monitor

## Tips for Best Experience

1. **Test audio before presentation** - Check speaker volume and microphone
2. **Use full-screen mode** - Press F11 or F for better visibility
3. **Multiple displays** - Use one for projector, one for speaker notes
4. **Silence Q&A timer** - Use Mute browser audio if Q&A shouldn't have timer warnings
5. **Lock screen** - Prevent accidental changes using ESC key warning

## Known Limitations

- Voice announcements depend on browser language settings
- Some browsers may delay voice synthesis on first activation
- Full-screen might not work on all display configurations

## Troubleshooting

**No audio sounds?**
- Check browser volume
- Check system volume
- Grant audio permissions when prompted
- Try different browser

**Timer not starting?**
- Ensure all fields have valid numbers
- Check that secondary warning < primary warning
- Refresh page and try again

**Display issues?**
- Try full-screen mode (F11)
- Zoom to 100% (Ctrl + 0)
- Use a modern browser

## File Structure

```
TTimer/
├── index.html     - Main HTML structure
├── style.css      - Styling and animations
├── script.js      - Timer logic and interactions
└── README.md      - This file
```

## Support

For best results:
- Use latest version of Chrome/Chromium
- Ensure JavaScript is enabled
- Close other browser tabs for optimal performance
- Use on a desktop/laptop rather than mobile

---

**Made with ❤️ for presenters & conference organizers** 🎤
