import { audio } from './state.js';

let audioContext: AudioContext, sourceNode: MediaElementAudioSourceNode, eqNodes: BiquadFilterNode[] = [];

export function setupVisualizer() {
  const container = document.getElementById("visualizer-container");
  if (!container) return;
  
  for (let i = 0; i < 30; i++) {
    const bar = document.createElement("div");
    bar.style.width = "8px";
    bar.style.backgroundColor = "var(--accent-primary)";
    bar.style.borderRadius = "4px 4px 0 0";
    bar.style.height = "10%";
    bar.style.transition = "height 0.1s ease";
    container.appendChild(bar);
  }

  setInterval(() => {
    if (
      !audio.paused &&
      document.getElementById("now-playing-overlay")?.classList.contains("active")
    ) {
      Array.from(container.children).forEach((bar) => {
        const height = Math.random() * 80 + 20;
        (bar as HTMLElement).style.height = `${height}%`;
      });
    } else {
      Array.from(container.children).forEach((bar) => {
        (bar as HTMLElement).style.height = `10%`;
      });
    }
  }, 150);
}

export function initWebAudio() {
  if (audioContext) return;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  audioContext = new AudioContextClass();
  sourceNode = audioContext.createMediaElementSource(audio);

  const freqs = [60, 230, 910, 3600, 14000];
  eqNodes = freqs.map((f) => {
    const filter = audioContext.createBiquadFilter();
    filter.type = "peaking";
    filter.frequency.value = f;
    filter.Q.value = 1;
    filter.gain.value = 0;
    return filter;
  });

  sourceNode.connect(eqNodes[0]);
  for (let i = 0; i < eqNodes.length - 1; i++) {
    eqNodes[i].connect(eqNodes[i + 1]);
  }
  eqNodes[eqNodes.length - 1].connect(audioContext.destination);

  const presets: Record<string, number[]> = {
    flat: [0, 0, 0, 0, 0],
    bass: [6, 4, 0, -2, -2],
    treble: [-2, 0, 2, 4, 6],
    vocal: [-2, -1, 4, 3, 0],
    rock: [5, 3, -1, 3, 5],
  };

  document.querySelectorAll(".eq-preset-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".eq-preset-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const presetName = (btn as HTMLElement).dataset.preset || "flat";
      const values = presets[presetName];

      eqNodes.forEach((node, i) => {
        node.gain.setTargetAtTime(values[i], audioContext.currentTime, 0.5);
      });
    });
  });
}
