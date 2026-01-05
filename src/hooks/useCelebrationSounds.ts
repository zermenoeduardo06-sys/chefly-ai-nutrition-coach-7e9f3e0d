import { useCallback, useRef } from 'react';
import type { CelebrationType } from '@/contexts/MascotContext';

/**
 * Hook for celebration sound effects using Web Audio API
 * No AI required - all sounds are generated programmatically
 */
export const useCelebrationSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Play a rising triumphant sound for achievements
   */
  const playAchievementSound = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create oscillators for a chord progression
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.5, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.1 + i * 0.08);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05 + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.08);
      osc.stop(now + 1);
    });

    // Add sparkle effect
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000 + Math.random() * 2000, now + 0.3 + i * 0.1);
      
      gain.gain.setValueAtTime(0.05, now + 0.3 + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + i * 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + 0.3 + i * 0.1);
      osc.stop(now + 0.6 + i * 0.1);
    }
  }, [getAudioContext]);

  /**
   * Play a cheerful meal completion sound
   */
  const playMealCompleteSound = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Two-note chime
    const notes = [659.25, 783.99]; // E5, G5
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      
      gain.gain.setValueAtTime(0.2, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4 + i * 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.15);
      osc.stop(now + 0.5 + i * 0.15);
    });
  }, [getAudioContext]);

  /**
   * Play an energetic challenge completion sound
   */
  const playChallengeCompleteSound = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Rising arpeggio
    const notes = [392, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      
      gain.gain.setValueAtTime(0.08, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3 + i * 0.07);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.07);
      osc.stop(now + 0.4 + i * 0.07);
    });
  }, [getAudioContext]);

  /**
   * Play an epic fanfare for streak milestones
   */
  const playStreakMilestoneSound = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Fanfare chord progression
    const chords = [
      [261.63, 329.63, 392], // C major
      [293.66, 369.99, 440], // D major
      [329.63, 415.30, 493.88], // E major
      [392, 493.88, 587.33, 783.99], // G major with octave
    ];

    chords.forEach((chord, chordIndex) => {
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + chordIndex * 0.2);
        
        gain.gain.setValueAtTime(0, now + chordIndex * 0.2);
        gain.gain.linearRampToValueAtTime(0.06, now + chordIndex * 0.2 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + chordIndex * 0.2 + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + chordIndex * 0.2);
        osc.stop(now + chordIndex * 0.2 + 0.4);
      });
    });
  }, [getAudioContext]);

  /**
   * Play a satisfying daily goal completion sound
   */
  const playDailyGoalSound = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Victory melody
    const melody = [
      { freq: 523.25, time: 0, duration: 0.15 },
      { freq: 659.25, time: 0.15, duration: 0.15 },
      { freq: 783.99, time: 0.3, duration: 0.15 },
      { freq: 1046.50, time: 0.45, duration: 0.4 },
    ];

    melody.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      
      gain.gain.setValueAtTime(0.15, now + time);
      gain.gain.setValueAtTime(0.15, now + time + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.01, now + time + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + time);
      osc.stop(now + time + duration + 0.1);
    });
  }, [getAudioContext]);

  /**
   * Play a quick shopping list completion sound
   */
  const playShoppingCompleteSound = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Cash register style ding
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.51, now); // E6
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.4);

    // Second ding
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1567.98, now + 0.1); // G6
    
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  }, [getAudioContext]);

  /**
   * Play a generic celebration sound
   */
  const playGenericCelebrationSound = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.4);
  }, [getAudioContext]);

  /**
   * Play the appropriate sound based on celebration type
   */
  const playCelebrationSound = useCallback((type: CelebrationType, intensity: 'small' | 'medium' | 'epic' = 'medium') => {
    // Skip sounds for small celebrations to avoid audio fatigue
    if (intensity === 'small') {
      playGenericCelebrationSound();
      return;
    }

    switch (type) {
      case 'meal_complete':
        playMealCompleteSound();
        break;
      case 'challenge_complete':
        playChallengeCompleteSound();
        break;
      case 'streak_milestone':
        playStreakMilestoneSound();
        break;
      case 'daily_goal':
        playDailyGoalSound();
        break;
      case 'achievement':
        playAchievementSound();
        break;
      case 'shopping_complete':
        playShoppingCompleteSound();
        break;
      default:
        playGenericCelebrationSound();
    }
  }, [
    playAchievementSound,
    playMealCompleteSound,
    playChallengeCompleteSound,
    playStreakMilestoneSound,
    playDailyGoalSound,
    playShoppingCompleteSound,
    playGenericCelebrationSound,
  ]);

  return {
    playCelebrationSound,
    playAchievementSound,
    playMealCompleteSound,
    playChallengeCompleteSound,
    playStreakMilestoneSound,
    playDailyGoalSound,
    playShoppingCompleteSound,
  };
};
