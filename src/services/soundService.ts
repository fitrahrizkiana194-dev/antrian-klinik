/**
 * Sound Service for Clinic Queue System
 * Uses Web Audio API for hospital ding-dong bell chime
 * Uses Web Speech API (speechSynthesis) for Indonesian voice announcement
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play authentic 3-tone hospital chime (C5 -> E5 -> G5)
 */
export function playChime(volume = 0.6): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0.0, duration: 0.4 }, // C5
        { freq: 659.25, time: 0.28, duration: 0.4 }, // E5
        { freq: 783.99, time: 0.56, duration: 0.8 }, // G5
      ];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, now);
      masterGain.connect(ctx.destination);

      notes.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        // Gentle envelope attack & decay
        noteGain.gain.setValueAtTime(0.001, now + time);
        noteGain.gain.exponentialRampToValueAtTime(0.4, now + time + 0.05);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + time);
        osc.stop(now + time + duration);
      });

      // Resolve after chime completes
      setTimeout(() => {
        resolve();
      }, 1400);
    } catch {
      // Audio might be blocked before first user gesture
      resolve();
    }
  });
}

/**
 * Helper to convert ticket number to friendly Indonesian spoken numbers
 * e.g. "A-012" -> "A... kosong... satu... dua"
 */
function formatSpokenTicket(ticketNumber: string): string {
  const parts = ticketNumber.split('-');
  if (parts.length === 2) {
    const letter = parts[0];
    const digits = parts[1].split('').map(d => {
      switch (d) {
        case '0': return 'kosong';
        case '1': return 'satu';
        case '2': return 'dua';
        case '3': return 'tiga';
        case '4': return 'empat';
        case '5': return 'lima';
        case '6': return 'enam';
        case '7': return 'tujuh';
        case '8': return 'delapan';
        case '9': return 'sembilan';
        default: return d;
      }
    }).join(' ');
    return `${letter}, ${digits}`;
  }
  return ticketNumber;
}

/**
 * Call queue announcement in Indonesian
 * "Nomor antrian... A kosong satu dua... Silakan menuju ke Poli Umum, Ruang Periksa 1"
 */
export async function announceQueueCall(params: {
  ticketNumber: string;
  serviceName: string;
  roomName: string;
  patientName?: string;
  speechRate?: number;
  bellVolume?: number;
}): Promise<void> {
  const {
    ticketNumber,
    serviceName,
    roomName,
    speechRate = 0.95,
    bellVolume = 0.6
  } = params;

  // 1. Play Chime
  await playChime(bellVolume);

  // 2. Text-to-speech announcement
  if (!('speechSynthesis' in window)) {
    return;
  }

  // Cancel any existing utterance
  window.speechSynthesis.cancel();

  const spokenTicket = formatSpokenTicket(ticketNumber);
  const speechText = `Nomor antrian, ${spokenTicket}, silakan menuju ke ${serviceName}, ${roomName}.`;

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = 'id-ID';
  utterance.rate = speechRate;
  utterance.pitch = 1.05;

  // Find Indonesian voice if available
  const voices = window.speechSynthesis.getVoices();
  const indonesianVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('Indonesia'));
  if (indonesianVoice) {
    utterance.voice = indonesianVoice;
  }

  window.speechSynthesis.speak(utterance);
}
