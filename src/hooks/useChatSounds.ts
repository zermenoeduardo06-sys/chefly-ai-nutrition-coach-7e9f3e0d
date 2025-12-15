import { useCallback, useRef } from 'react';

/**
 * Hook for chat sound effects using Web Audio API
 */
export const useChatSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Play a "pop" sound when sending a message
   */
  const playMessageSent = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (error) {
      console.log('Audio not available');
    }
  }, [getAudioContext]);

  /**
   * Play a "ding" sound when receiving a message from Chefly
   */
  const playMessageReceived = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      // First note
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc1.type = 'sine';
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);

      // Second note (harmony)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.08); // G5
      
      gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      
      osc2.type = 'sine';
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (error) {
      console.log('Audio not available');
    }
  }, [getAudioContext]);

  /**
   * Play typing indicator sound (subtle clicks)
   */
  const playTyping = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (error) {
      console.log('Audio not available');
    }
  }, [getAudioContext]);

  /**
   * Play error sound
   */
  const playError = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      oscillator.type = 'sawtooth';
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.25);
    } catch (error) {
      console.log('Audio not available');
    }
  }, [getAudioContext]);

  return {
    playMessageSent,
    playMessageReceived,
    playTyping,
    playError,
  };
};
