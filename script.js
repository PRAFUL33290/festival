const instruments = [
  { id: "kick", name: "Kick", icon: "🥁", color: "#ff8a3d", type: "drum" },
  { id: "snare", name: "Snare", icon: "🎯", color: "#f4518f", type: "drum" },
  { id: "hihat", name: "Hi-Hat", icon: "✨", color: "#ffd23f", type: "drum" },
  { id: "clap", name: "Clap", icon: "👏", color: "#76e3a0", type: "drum" },
  { id: "tom", name: "Tom", icon: "🪘", color: "#7c5cff", type: "drum" },
  { id: "shaker", name: "Shaker", icon: "🎶", color: "#00a9c8", type: "drum" },
  { id: "bass", name: "Bass", icon: "🔊", color: "#86d75f", type: "drum" },
  { id: "bell", name: "Bell", icon: "🔔", color: "#ffcf6e", type: "drum" },
  { id: "piano", name: "Piano", icon: "🎹", color: "#8bd3ff", type: "melody", wave: "triangle" },
  { id: "synth", name: "Synth", icon: "🕹️", color: "#b99cff", type: "melody", wave: "sawtooth" },
  { id: "saxo", name: "Saxo", icon: "🎷", color: "#ffbf54", type: "melody", wave: "square" },
  { id: "guitar", name: "Guitare", icon: "🎸", color: "#ff9f7a", type: "melody", wave: "triangle" }
];

const notes = [
  { id: "C4", name: "Do", symbol: "♪", frequency: 261.63, step: 5 },
  { id: "D4", name: "Ré", symbol: "♩", frequency: 293.66, step: 4 },
  { id: "E4", name: "Mi", symbol: "♫", frequency: 329.63, step: 3 },
  { id: "G4", name: "Sol", symbol: "♬", frequency: 392, step: 2 },
  { id: "A4", name: "La", symbol: "♭", frequency: 440, step: 1 }
];

const challenges = [
  {
    text: "Crée une rythmique avec un Kick sur les temps 1 et 5",
    test: () => state.pattern.kick[0] && state.pattern.kick[4]
  },
  {
    text: "Ajoute une Snare sur les temps 3 et 7",
    test: () => state.pattern.snare[2] && state.pattern.snare[6]
  },
  {
    text: "Utilise au moins 3 instruments",
    test: () => getUsedInstrumentCount() >= 3
  },
  {
    text: "Crée une rythmique rapide à 140 BPM",
    test: () => state.bpm >= 140 && getSoundCount() > 0
  },
  {
    text: "Crée une rythmique lente à 80 BPM",
    test: () => state.bpm <= 80 && getSoundCount() > 0
  },
  {
    text: "Fais une rythmique de festival avec Clap et Shaker",
    test: () => state.pattern.clap.some(Boolean) && state.pattern.shaker.some(Boolean)
  },
  {
    text: "Place une petite mélodie avec Piano ou Guitare",
    test: () => state.pattern.piano.some(Boolean) || state.pattern.guitar.some(Boolean)
  }
];

const lessons = [
  "Un rythme est une suite de sons placés dans le temps.",
  "Le BPM indique la vitesse de la musique.",
  "Le temps 1 est souvent le point de départ du rythme."
];

const state = {
  audioContext: null,
  pattern: {},
  bpm: 100,
  currentBeat: 0,
  isPlaying: false,
  metronomeOn: true,
  mode: "beginner",
  selectedNote: "C4",
  challengeIndex: 0,
  challengeWon: false,
  loopTimer: null,
  toastTimer: null
};

const dom = {};

document.addEventListener("DOMContentLoaded", initGame);

function initGame() {
  cacheDom();
  instruments.forEach((instrument) => {
    state.pattern[instrument.id] = Array(8).fill(false);
  });
  createGrid();
  createNotePicker();
  bindEvents();
  setMode("beginner");
  updateBPM();
  updateScore();
  updateChallengeText();
}

function cacheDom() {
  dom.homeScreen = document.querySelector("#home-screen");
  dom.gameScreen = document.querySelector("#game-screen");
  dom.helpPanel = document.querySelector("#help-panel");
  dom.startButton = document.querySelector("#start-button");
  dom.howButton = document.querySelector("#how-button");
  dom.closeHelp = document.querySelector("#close-help");
  dom.grid = document.querySelector("#beat-grid");
  dom.playButton = document.querySelector("#play-button");
  dom.stopButton = document.querySelector("#stop-button");
  dom.clearButton = document.querySelector("#clear-button");
  dom.randomButton = document.querySelector("#random-button");
  dom.metronomeButton = document.querySelector("#metronome-button");
  dom.saveButton = document.querySelector("#save-button");
  dom.loadButton = document.querySelector("#load-button");
  dom.bpmSlider = document.querySelector("#bpm-slider");
  dom.bpmValue = document.querySelector("#bpm-value");
  dom.currentBeat = document.querySelector("#current-beat");
  dom.beatLight = document.querySelector("#beat-light");
  dom.noteButtons = document.querySelector("#note-buttons");
  dom.selectedNoteLabel = document.querySelector("#selected-note-label");
  dom.musicSheet = document.querySelector("#music-sheet");
  dom.modeButtons = document.querySelectorAll(".mode-button");
  dom.challengePanel = document.querySelector("#challenge-panel");
  dom.challengeText = document.querySelector("#challenge-text");
  dom.challengeResult = document.querySelector("#challenge-result");
  dom.checkChallengeButton = document.querySelector("#check-challenge");
  dom.score = document.querySelector("#score");
  dom.instrumentCount = document.querySelector("#instrument-count");
  dom.soundCount = document.querySelector("#sound-count");
  dom.lessonMessage = document.querySelector("#lesson-message");
  dom.exportButton = document.querySelector("#export-button");
  dom.importButton = document.querySelector("#import-button");
  dom.jsonBox = document.querySelector("#json-box");
  dom.toast = document.querySelector("#toast");
  dom.successConfetti = document.querySelector("#success-confetti");
  dom.audience = document.querySelector("#audience");
}

function bindEvents() {
  dom.startButton.addEventListener("click", () => {
    dom.homeScreen.classList.add("is-hidden");
    dom.gameScreen.classList.remove("is-hidden");
    ensureAudioContext();
  });

  dom.howButton.addEventListener("click", () => {
    dom.helpPanel.hidden = false;
  });

  dom.closeHelp.addEventListener("click", () => {
    dom.helpPanel.hidden = true;
  });

  dom.playButton.addEventListener("click", playLoop);
  dom.stopButton.addEventListener("click", stopLoop);
  dom.clearButton.addEventListener("click", clearPattern);
  dom.randomButton.addEventListener("click", randomPattern);
  dom.saveButton.addEventListener("click", savePattern);
  dom.loadButton.addEventListener("click", loadPattern);
  dom.checkChallengeButton.addEventListener("click", checkChallenge);
  dom.exportButton.addEventListener("click", exportPattern);
  dom.importButton.addEventListener("click", importPattern);

  dom.metronomeButton.addEventListener("click", () => {
    state.metronomeOn = !state.metronomeOn;
    dom.metronomeButton.textContent = state.metronomeOn ? "Métronome ON" : "Métronome OFF";
    dom.metronomeButton.classList.toggle("is-on", state.metronomeOn);
    dom.metronomeButton.setAttribute("aria-pressed", String(state.metronomeOn));
  });

  dom.bpmSlider.addEventListener("input", updateBPM);

  dom.modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });
}

function createGrid() {
  dom.grid.innerHTML = "";
  dom.grid.appendChild(makeEmptyHeader());

  for (let beat = 0; beat < 8; beat += 1) {
    const header = document.createElement("div");
    header.className = "beat-header";
    header.dataset.beat = String(beat);
    header.textContent = String(beat + 1);
    dom.grid.appendChild(header);
  }

  instruments.forEach((instrument) => {
    const label = document.createElement("div");
    label.className = "instrument-cell";
    label.dataset.instrument = instrument.id;
    label.innerHTML = `
      <span class="instrument-name"><span>${instrument.icon}</span><span>${instrument.name}</span></span>
      <button class="test-button" type="button" aria-label="Tester ${instrument.name}">Test</button>
    `;
    label.querySelector("button").addEventListener("click", () => playInstrument(instrument.id, state.selectedNote));
    dom.grid.appendChild(label);

    for (let beat = 0; beat < 8; beat += 1) {
      const cell = document.createElement("button");
      cell.className = "grid-cell";
      cell.type = "button";
      cell.dataset.instrument = instrument.id;
      cell.dataset.beat = String(beat);
      cell.style.setProperty("--cell-color", instrument.color);
      cell.setAttribute("aria-label", `${instrument.name}, temps ${beat + 1}`);
      cell.addEventListener("click", () => toggleCell(instrument.id, beat));
      dom.grid.appendChild(cell);
    }
  });
}

function makeEmptyHeader() {
  const header = document.createElement("div");
  header.className = "beat-header";
  header.textContent = "Temps";
  return header;
}

function toggleCell(instrumentId, beat) {
  const instrument = getInstrument(instrumentId);
  if (instrument.type === "melody") {
    state.pattern[instrumentId][beat] = state.pattern[instrumentId][beat] === state.selectedNote ? false : state.selectedNote;
  } else {
    state.pattern[instrumentId][beat] = !state.pattern[instrumentId][beat];
  }
  state.challengeWon = false;
  renderGrid();
  updateSheet();
  updateScore();
}

function playLoop() {
  ensureAudioContext();
  if (state.audioContext.state === "suspended") {
    state.audioContext.resume();
  }
  stopLoop(false);
  state.isPlaying = true;
  dom.audience.classList.add("is-dancing");
  state.currentBeat = 0;
  playCurrentBeat();
  state.loopTimer = window.setInterval(playCurrentBeat, getBeatDuration());
}

function stopLoop(showMessage = true) {
  if (state.loopTimer) {
    window.clearInterval(state.loopTimer);
    state.loopTimer = null;
  }
  state.isPlaying = false;
  dom.audience.classList.remove("is-dancing");
  clearCurrentHighlights();
  if (showMessage) {
    showToast("La boucle est arrêtée.");
  }
}

function playCurrentBeat() {
  clearCurrentHighlights();
  dom.currentBeat.textContent = String(state.currentBeat + 1);

  document.querySelectorAll(`[data-beat="${state.currentBeat}"]`).forEach((element) => {
    element.classList.add("is-current");
  });

  instruments.forEach((instrument) => {
    const stepValue = state.pattern[instrument.id][state.currentBeat];
    if (stepValue) {
      playInstrument(instrument.id, typeof stepValue === "string" ? stepValue : state.selectedNote);
    }
  });

  if (state.metronomeOn) {
    playMetronome(state.currentBeat);
  }

  flashBeatLight();
  state.currentBeat = (state.currentBeat + 1) % 8;
}

function playInstrument(instrumentId, noteId = state.selectedNote) {
  ensureAudioContext();
  const now = state.audioContext.currentTime;
  const instrument = getInstrument(instrumentId);
  if (instrument?.type === "melody") {
    playMelodicInstrument(instrument, getNote(noteId), now);
    return;
  }

  const sounds = {
    kick: () => playKick(now),
    snare: () => playSnare(now),
    hihat: () => playNoise(now, 0.045, 6500, 0.12),
    clap: () => playClap(now),
    tom: () => playTone(now, 160, 0.24, "sine", 0.55, 50),
    shaker: () => playNoise(now, 0.08, 4200, 0.08),
    bass: () => playTone(now, 74, 0.28, "sawtooth", 0.35, 42),
    bell: () => playBell(now)
  };
  sounds[instrumentId]?.();
}

function playMetronome(beat) {
  const frequency = beat === 0 ? 1320 : 920;
  const volume = beat === 0 ? 0.22 : 0.12;
  playTone(state.audioContext.currentTime, frequency, 0.05, "square", volume, frequency);
}

function updateBPM() {
  state.bpm = Number(dom.bpmSlider.value);
  dom.bpmValue.textContent = String(state.bpm);
  dom.lessonMessage.textContent = state.bpm >= 130 ? lessons[1] : lessons[state.currentBeat % lessons.length];

  if (state.isPlaying) {
    window.clearInterval(state.loopTimer);
    state.loopTimer = window.setInterval(playCurrentBeat, getBeatDuration());
  }

  updateScore();
}

function savePattern() {
  localStorage.setItem("festivalBeatMakerPattern", JSON.stringify(getPatternData()));
  showToast("Rythmique sauvegardée !");
}

function loadPattern() {
  const saved = localStorage.getItem("festivalBeatMakerPattern");
  if (!saved) {
    showToast("Aucune rythmique sauvegardée pour le moment.");
    return;
  }
  try {
    applyPatternData(JSON.parse(saved));
    showToast("Rythmique chargée !");
  } catch {
    showToast("La sauvegarde est illisible.");
  }
}

function clearPattern() {
  instruments.forEach((instrument) => {
    state.pattern[instrument.id] = Array(8).fill(false);
  });
  state.challengeWon = false;
  renderGrid();
  updateSheet();
  updateScore();
  showToast("Grille effacée.");
}

function randomPattern() {
  const activeInstruments = getActiveInstruments();
  instruments.forEach((instrument) => {
    state.pattern[instrument.id] = Array(8).fill(false);
  });

  activeInstruments.forEach((instrument) => {
    const chance = instrument.id === "kick" || instrument.id === "hihat" ? 0.38 : 0.24;
    state.pattern[instrument.id] = state.pattern[instrument.id].map(() => {
      if (Math.random() >= chance) {
        return false;
      }
      return instrument.type === "melody" ? notes[Math.floor(Math.random() * notes.length)].id : true;
    });
  });

  state.challengeWon = false;
  renderGrid();
  updateSheet();
  updateScore();
  showToast("Pattern surprise créé !");
}

function updateScore() {
  const instrumentsUsed = getUsedInstrumentCount();
  const sounds = getSoundCount();
  const challengeBonus = state.challengeWon ? 50 : 0;
  dom.instrumentCount.textContent = String(instrumentsUsed);
  dom.soundCount.textContent = String(sounds);
  dom.score.textContent = String(instrumentsUsed * 10 + sounds * 5 + challengeBonus);
}

function checkChallenge() {
  if (state.mode !== "challenge") {
    showToast("Passe en mode Défi pour vérifier une consigne.");
    return;
  }

  const challenge = challenges[state.challengeIndex];
  if (challenge.test()) {
    state.challengeWon = true;
    dom.challengeResult.textContent = "Bravo ! Super rythme !";
    launchConfetti();
    showToast("Défi réussi : bonus de score !");
    state.challengeIndex = (state.challengeIndex + 1) % challenges.length;
    window.setTimeout(updateChallengeText, 1300);
  } else {
    state.challengeWon = false;
    dom.challengeResult.textContent = "Essaie encore !";
  }
  updateScore();
}

function setMode(mode) {
  state.mode = mode;
  state.challengeWon = false;
  dom.modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  dom.challengePanel.hidden = mode !== "challenge";
  if (mode === "challenge") {
    updateChallengeText();
  }
  renderGrid();
  updateSheet();
  updateScore();
}

function renderGrid() {
  const activeIds = new Set(getActiveInstruments().map((instrument) => instrument.id));

  instruments.forEach((instrument) => {
    const muted = !activeIds.has(instrument.id);
    document.querySelector(`[data-instrument="${instrument.id}"].instrument-cell`)?.classList.toggle("is-muted", muted);
    document.querySelectorAll(`.grid-cell[data-instrument="${instrument.id}"]`).forEach((cell) => {
      const beat = Number(cell.dataset.beat);
      const stepValue = state.pattern[instrument.id][beat];
      cell.classList.toggle("is-muted", muted);
      cell.classList.toggle("is-active", Boolean(stepValue));
      cell.classList.toggle("has-note", instrument.type === "melody" && Boolean(stepValue));
      cell.textContent = instrument.type === "melody" && stepValue ? getNote(stepValue).name : "";
      cell.setAttribute("aria-pressed", String(Boolean(stepValue)));
      cell.setAttribute("aria-label", getCellLabel(instrument, beat, stepValue));
    });
  });
}

function updateChallengeText() {
  dom.challengeText.textContent = challenges[state.challengeIndex].text;
  dom.challengeResult.textContent = "";
}

function exportPattern() {
  dom.jsonBox.value = JSON.stringify(getPatternData(), null, 2);
  showToast("JSON exporté.");
}

function importPattern() {
  try {
    applyPatternData(JSON.parse(dom.jsonBox.value));
    showToast("JSON importé !");
  } catch {
    showToast("Colle un JSON valide avant d'importer.");
  }
}

function getPatternData() {
  return {
    bpm: state.bpm,
    mode: state.mode,
    metronomeOn: state.metronomeOn,
    selectedNote: state.selectedNote,
    pattern: state.pattern
  };
}

function applyPatternData(data) {
  instruments.forEach((instrument) => {
    const row = Array.isArray(data.pattern?.[instrument.id]) ? data.pattern[instrument.id] : [];
    state.pattern[instrument.id] = Array.from({ length: 8 }, (_, index) => normalizeStepValue(instrument, row[index]));
  });

  if (notes.some((note) => note.id === data.selectedNote)) {
    state.selectedNote = data.selectedNote;
    updateSelectedNoteUI();
  }

  if (Number.isFinite(Number(data.bpm))) {
    dom.bpmSlider.value = String(Math.min(180, Math.max(60, Number(data.bpm))));
    updateBPM();
  }

  state.metronomeOn = data.metronomeOn !== false;
  dom.metronomeButton.textContent = state.metronomeOn ? "Métronome ON" : "Métronome OFF";
  dom.metronomeButton.classList.toggle("is-on", state.metronomeOn);
  dom.metronomeButton.setAttribute("aria-pressed", String(state.metronomeOn));

  if (["beginner", "complete", "challenge"].includes(data.mode)) {
    setMode(data.mode);
  } else {
    renderGrid();
  }
  state.challengeWon = false;
  updateSheet();
  updateScore();
}

function getActiveInstruments() {
  if (state.mode === "beginner") {
    return instruments.slice(0, 4);
  }
  return instruments;
}

function getUsedInstrumentCount() {
  return instruments.filter((instrument) => state.pattern[instrument.id].some(Boolean)).length;
}

function getSoundCount() {
  return instruments.reduce((total, instrument) => {
    return total + state.pattern[instrument.id].filter(Boolean).length;
  }, 0);
}

function getBeatDuration() {
  return 60000 / state.bpm;
}

function ensureAudioContext() {
  if (!state.audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    state.audioContext = new AudioContext();
  }
}

function playKick(now) {
  const osc = state.audioContext.createOscillator();
  const gain = state.audioContext.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(130, now);
  osc.frequency.exponentialRampToValueAtTime(42, now + 0.18);
  gain.gain.setValueAtTime(0.85, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(gain).connect(state.audioContext.destination);
  osc.start(now);
  osc.stop(now + 0.23);
}

function playSnare(now) {
  playNoise(now, 0.11, 1800, 0.28);
  playTone(now, 210, 0.1, "triangle", 0.16, 160);
}

function playClap(now) {
  [0, 0.025, 0.052].forEach((offset) => playNoise(now + offset, 0.035, 2500, 0.16));
}

function playBell(now) {
  playTone(now, 1046, 0.48, "sine", 0.18, 1046);
  playTone(now, 1568, 0.32, "sine", 0.1, 1568);
}

function playMelodicInstrument(instrument, note, now) {
  if (instrument.id === "piano") {
    playTone(now, note.frequency, 0.36, "triangle", 0.26, note.frequency);
    playTone(now + 0.01, note.frequency * 2, 0.18, "sine", 0.06, note.frequency * 2);
    return;
  }

  if (instrument.id === "saxo") {
    playTone(now, note.frequency, 0.42, "square", 0.16, note.frequency * 0.995);
    playTone(now, note.frequency * 2, 0.22, "sine", 0.05, note.frequency * 2);
    return;
  }

  if (instrument.id === "guitar") {
    playTone(now, note.frequency, 0.28, "triangle", 0.22, note.frequency * 0.5);
    playTone(now + 0.018, note.frequency * 1.5, 0.16, "triangle", 0.08, note.frequency * 1.2);
    return;
  }

  playTone(now, note.frequency, 0.32, instrument.wave, 0.2, note.frequency * 0.98);
  playTone(now, note.frequency * 1.01, 0.28, "sine", 0.08, note.frequency);
}

function playTone(now, frequency, duration, type, volume, endFrequency) {
  const osc = state.audioContext.createOscillator();
  const gain = state.audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (endFrequency !== frequency) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + duration);
  }
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain).connect(state.audioContext.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playNoise(now, duration, highpassFrequency, volume) {
  const bufferSize = Math.floor(state.audioContext.sampleRate * duration);
  const buffer = state.audioContext.createBuffer(1, bufferSize, state.audioContext.sampleRate);
  const output = buffer.getChannelData(0);
  for (let index = 0; index < bufferSize; index += 1) {
    output[index] = Math.random() * 2 - 1;
  }

  const source = state.audioContext.createBufferSource();
  const filter = state.audioContext.createBiquadFilter();
  const gain = state.audioContext.createGain();
  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = highpassFrequency;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  source.connect(filter).connect(gain).connect(state.audioContext.destination);
  source.start(now);
  source.stop(now + duration);
}

function clearCurrentHighlights() {
  document.querySelectorAll(".is-current").forEach((element) => {
    element.classList.remove("is-current");
  });
}

function flashBeatLight() {
  dom.beatLight.classList.remove("flash");
  void dom.beatLight.offsetWidth;
  dom.beatLight.classList.add("flash");
  window.setTimeout(() => dom.beatLight.classList.remove("flash"), 130);
}

function launchConfetti() {
  dom.successConfetti.classList.remove("burst");
  void dom.successConfetti.offsetWidth;
  dom.successConfetti.classList.add("burst");
  window.setTimeout(() => dom.successConfetti.classList.remove("burst"), 1500);
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add("is-visible");
  state.toastTimer = window.setTimeout(() => {
    dom.toast.classList.remove("is-visible");
  }, 2200);
}

function createNotePicker() {
  dom.noteButtons.innerHTML = "";
  notes.forEach((note) => {
    const button = document.createElement("button");
    button.className = "note-button";
    button.type = "button";
    button.dataset.note = note.id;
    button.innerHTML = `<span>${note.symbol}</span><strong>${note.name}</strong>`;
    button.addEventListener("click", () => {
      state.selectedNote = note.id;
      updateSelectedNoteUI();
      showToast(`Note choisie : ${note.name}`);
    });
    dom.noteButtons.appendChild(button);
  });
  updateSelectedNoteUI();
  updateSheet();
}

function updateSelectedNoteUI() {
  const note = getNote(state.selectedNote);
  dom.selectedNoteLabel.textContent = `Note choisie : ${note.name}`;
  dom.noteButtons.querySelectorAll(".note-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.note === state.selectedNote);
    button.setAttribute("aria-pressed", String(button.dataset.note === state.selectedNote));
  });
}

function updateSheet() {
  dom.musicSheet.innerHTML = "";
  for (let beat = 0; beat < 8; beat += 1) {
    const placedNotes = instruments
      .filter((instrument) => instrument.type === "melody")
      .map((instrument) => {
        const noteId = state.pattern[instrument.id][beat];
        return noteId ? { instrument, note: getNote(noteId) } : null;
      })
      .filter(Boolean);

    const measure = document.createElement("div");
    measure.className = "sheet-beat";
    measure.dataset.beat = String(beat);
    measure.innerHTML = `<span class="sheet-beat-number">${beat + 1}</span><div class="staff-lines"></div>`;

    placedNotes.forEach(({ instrument, note }) => {
      const noteElement = document.createElement("span");
      noteElement.className = "sheet-note";
      noteElement.style.setProperty("--note-step", String(note.step));
      noteElement.style.setProperty("--note-color", instrument.color);
      noteElement.textContent = note.symbol;
      noteElement.title = `${instrument.name} ${note.name}`;
      measure.appendChild(noteElement);
    });

    if (placedNotes.length === 0) {
      const rest = document.createElement("span");
      rest.className = "sheet-rest";
      rest.textContent = "•";
      measure.appendChild(rest);
    }

    dom.musicSheet.appendChild(measure);
  }
}

function getInstrument(instrumentId) {
  return instruments.find((instrument) => instrument.id === instrumentId);
}

function getNote(noteId) {
  return notes.find((note) => note.id === noteId) || notes[0];
}

function getCellLabel(instrument, beat, stepValue) {
  if (instrument.type === "melody") {
    const noteText = stepValue ? `note ${getNote(stepValue).name}` : `note choisie ${getNote(state.selectedNote).name}`;
    return `${instrument.name}, temps ${beat + 1}, ${noteText}`;
  }
  return `${instrument.name}, temps ${beat + 1}`;
}

function normalizeStepValue(instrument, value) {
  if (instrument.type === "melody") {
    if (notes.some((note) => note.id === value)) {
      return value;
    }
    return value ? state.selectedNote : false;
  }
  return Boolean(value);
}
