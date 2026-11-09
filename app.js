/**
 * MY HUB PRO — JAVASCRIPT APP CONTROLLER
 * Comprehensive Gym Tracker, Rest Timer, Plate Calculator, PR Engine & Super App Hub
 */

// --- Comprehensive 40+ Exercise Library ---
const EXERCISE_LIBRARY = [
  // Ngực
  { id: 'lib_bp', name: 'Đẩy Ngực Ngang Đòn (Bench Press)', muscle: 'Ngực', defaultWeight: 50, defaultReps: 10 },
  { id: 'lib_inc_db', name: 'Đẩy Ngực Dốc Tạ Đơn (Incline DB Press)', muscle: 'Ngực', defaultWeight: 20, defaultReps: 10 },
  { id: 'lib_flat_db', name: 'Đẩy Ngực Ngang Tạ Đơn (Flat DB Press)', muscle: 'Ngực', defaultWeight: 22, defaultReps: 10 },
  { id: 'lib_pec_fly', name: 'Ép Ngực Máy (Pec Deck Fly)', muscle: 'Ngực', defaultWeight: 35, defaultReps: 12 },
  { id: 'lib_cable_fly', name: 'Ép Ngực Cáp (Cable Fly)', muscle: 'Ngực', defaultWeight: 15, defaultReps: 12 },
  { id: 'lib_pushup', name: 'Hít Đất (Push Up)', muscle: 'Ngực', defaultWeight: 0, defaultReps: 15 },
  { id: 'lib_chest_dip', name: 'Xà Kép Chúi Ngực (Chest Dips)', muscle: 'Ngực', defaultWeight: 0, defaultReps: 10 },
  { id: 'lib_mach_press', name: 'Đẩy Ngực Máy (Chest Press Machine)', muscle: 'Ngực', defaultWeight: 40, defaultReps: 12 },

  // Lưng / Xô
  { id: 'lib_lat_pull', name: 'Kéo Xô Cáp (Lat Pulldown)', muscle: 'Lưng / Xô', defaultWeight: 45, defaultReps: 10 },
  { id: 'lib_bb_row', name: 'Gập Người Chèo Đòn (Barbell Row)', muscle: 'Lưng / Xô', defaultWeight: 40, defaultReps: 10 },
  { id: 'lib_db_row', name: 'Chèo Tạ Đơn (One-arm DB Row)', muscle: 'Lưng / Xô', defaultWeight: 18, defaultReps: 12 },
  { id: 'lib_pullup', name: 'Hít Xà Đơn (Pull-ups)', muscle: 'Lưng / Xô', defaultWeight: 0, defaultReps: 8 },
  { id: 'lib_seated_row', name: 'Chèo Cáp Ngồi (Seated Cable Row)', muscle: 'Lưng / Xô', defaultWeight: 40, defaultReps: 12 },
  { id: 'lib_deadlift', name: 'Deadlift Truyền Thống', muscle: 'Lưng / Xô', defaultWeight: 70, defaultReps: 6 },
  { id: 'lib_facepull', name: 'Kéo Cáp Mặt (Face Pull)', muscle: 'Lưng / Xô', defaultWeight: 15, defaultReps: 15 },
  { id: 'lib_tbar_row', name: 'Chèo Tạ T-Bar (T-Bar Row)', muscle: 'Lưng / Xô', defaultWeight: 35, defaultReps: 10 },

  // Vai
  { id: 'lib_ohp', name: 'Đẩy Vai Quá Đầu (Overhead Press)', muscle: 'Vai', defaultWeight: 30, defaultReps: 10 },
  { id: 'lib_db_shoulder', name: 'Đẩy Vai Tạ Đơn (DB Shoulder Press)', muscle: 'Vai', defaultWeight: 16, defaultReps: 10 },
  { id: 'lib_lat_raise', name: 'Dang Vai Tạ Đơn (Lateral Raise)', muscle: 'Vai', defaultWeight: 8, defaultReps: 15 },
  { id: 'lib_cable_lat', name: 'Dang Vai Cáp (Cable Lateral Raise)', muscle: 'Vai', defaultWeight: 5, defaultReps: 15 },
  { id: 'lib_front_raise', name: 'Nâng Tạ Phía Trước (Front Raise)', muscle: 'Vai', defaultWeight: 8, defaultReps: 12 },
  { id: 'lib_rev_fly', name: 'Banh Vai Sau Máy (Reverse Pec Deck)', muscle: 'Vai', defaultWeight: 25, defaultReps: 15 },
  { id: 'lib_shrug', name: 'Kéo Cầu Vai (Shrugs)', muscle: 'Vai', defaultWeight: 24, defaultReps: 15 },

  // Chân / Mông
  { id: 'lib_squat', name: 'Gánh Tạ (Barbell Squat)', muscle: 'Chân / Mông', defaultWeight: 60, defaultReps: 8 },
  { id: 'lib_leg_press', name: 'Đạp Đùi Máy (Leg Press)', muscle: 'Chân / Mông', defaultWeight: 120, defaultReps: 12 },
  { id: 'lib_rdl', name: 'Deadlift Đùi Sau (Romanian Deadlift)', muscle: 'Chân / Mông', defaultWeight: 50, defaultReps: 10 },
  { id: 'lib_leg_curl', name: 'Móc Đùi Sau Máy (Leg Curl)', muscle: 'Chân / Mông', defaultWeight: 30, defaultReps: 12 },
  { id: 'lib_leg_ext', name: 'Đá Đùi Trước Máy (Leg Extension)', muscle: 'Chân / Mông', defaultWeight: 35, defaultReps: 12 },
  { id: 'lib_calf', name: 'Nhón Bắp Chân (Calf Raise)', muscle: 'Chân / Mông', defaultWeight: 40, defaultReps: 15 },
  { id: 'lib_hip_thrust', name: 'Nâng Hông Đẩy Tạ (Hip Thrust)', muscle: 'Chân / Mông', defaultWeight: 60, defaultReps: 10 },
  { id: 'lib_lunges', name: 'Bước Chùng Chân (Lunges)', muscle: 'Chân / Mông', defaultWeight: 12, defaultReps: 12 },
  { id: 'lib_goblet', name: 'Goblet Squat Quả Tạ', muscle: 'Chân / Mông', defaultWeight: 20, defaultReps: 12 },

  // Tay trước
  { id: 'lib_db_curl', name: 'Cuốn Tạ Đơn (DB Bicep Curl)', muscle: 'Tay trước', defaultWeight: 12, defaultReps: 12 },
  { id: 'lib_ez_curl', name: 'Cuốn Đòn EZ (EZ Bar Curl)', muscle: 'Tay trước', defaultWeight: 20, defaultReps: 10 },
  { id: 'lib_hammer', name: 'Cuốn Tạ Búa (Hammer Curl)', muscle: 'Tay trước', defaultWeight: 10, defaultReps: 12 },
  { id: 'lib_cable_curl', name: 'Cuốn Cáp Tay Trước (Cable Curl)', muscle: 'Tay trước', defaultWeight: 15, defaultReps: 12 },

  // Tay sau
  { id: 'lib_tri_push', name: 'Kéo Cáp Tay Sau (Tricep Pushdown)', muscle: 'Tay sau', defaultWeight: 20, defaultReps: 12 },
  { id: 'lib_rope_push', name: 'Kéo Cáp Dây Thừng (Rope Pushdown)', muscle: 'Tay sau', defaultWeight: 15, defaultReps: 12 },
  { id: 'lib_skull', name: 'Skull Crusher Nằm Duỗi Tay Sau', muscle: 'Tay sau', defaultWeight: 20, defaultReps: 10 },
  { id: 'lib_tri_dip', name: 'Xà Kép Tay Sau (Tricep Dips)', muscle: 'Tay sau', defaultWeight: 0, defaultReps: 10 },
  { id: 'lib_overhead_tri', name: 'Duỗi Tay Sau Qua Đầu (Overhead Tri)', muscle: 'Tay sau', defaultWeight: 14, defaultReps: 12 },

  // Bụng / Core
  { id: 'lib_plank', name: 'Plank Bụng (giây)', muscle: 'Bụng / Core', defaultWeight: 0, defaultReps: 45 },
  { id: 'lib_hanging_leg', name: 'Treo Xà Nâng Chân (Hanging Leg Raise)', muscle: 'Bụng / Core', defaultWeight: 0, defaultReps: 12 },
  { id: 'lib_cable_crunch', name: 'Gập Bụng Cáp Quỳ (Cable Crunch)', muscle: 'Bụng / Core', defaultWeight: 25, defaultReps: 15 },
  { id: 'lib_ab_wheel', name: 'Lăn Bánh Xe Bụng (Ab Wheel)', muscle: 'Bụng / Core', defaultWeight: 0, defaultReps: 10 }
];

// Default Preset Routines
const DEFAULT_ROUTINES = [
  {
    id: 'push',
    name: 'Push Day (Ngực - Vai - Tay sau)',
    exercises: [
      { id: 'bp', name: 'Đẩy Ngực Ngang Đòn (Bench Press)', muscle: 'Ngực', defaultSets: 3, defaultWeight: 50, defaultReps: 10 },
      { id: 'incline_db', name: 'Đẩy Ngực Dốc Tạ Đơn (Incline DB Press)', muscle: 'Ngực', defaultSets: 3, defaultWeight: 20, defaultReps: 10 },
      { id: 'ohp', name: 'Đẩy Vai Quá Đầu (Overhead Press)', muscle: 'Vai', defaultSets: 3, defaultWeight: 30, defaultReps: 10 },
      { id: 'lateral_raise', name: 'Dang Vai Tạ Đơn (Lateral Raise)', muscle: 'Vai', defaultSets: 3, defaultWeight: 8, defaultReps: 15 },
      { id: 'tricep_pushdown', name: 'Kéo Cáp Tay Sau (Tricep Pushdown)', muscle: 'Tay sau', defaultSets: 3, defaultWeight: 20, defaultReps: 12 }
    ]
  },
  {
    id: 'pull',
    name: 'Pull Day (Lưng - Xô - Tay trước)',
    exercises: [
      { id: 'lat_pulldown', name: 'Kéo Xô Cáp (Lat Pulldown)', muscle: 'Lưng / Xô', defaultSets: 3, defaultWeight: 45, defaultReps: 10 },
      { id: 'barbell_row', name: 'Gập Người Chèo Đòn (Barbell Row)', muscle: 'Lưng / Xô', defaultSets: 3, defaultWeight: 40, defaultReps: 10 },
      { id: 'face_pull', name: 'Kéo Cáp Mặt (Face Pull)', muscle: 'Lưng / Xô', defaultSets: 3, defaultWeight: 15, defaultReps: 15 },
      { id: 'bicep_curl', name: 'Cuốn Tạ Đơn (DB Bicep Curl)', muscle: 'Tay trước', defaultSets: 3, defaultWeight: 12, defaultReps: 12 },
      { id: 'hammer_curl', name: 'Cuốn Tạ Búa (Hammer Curl)', muscle: 'Tay trước', defaultSets: 3, defaultWeight: 10, defaultReps: 12 }
    ]
  },
  {
    id: 'legs',
    name: 'Leg Day (Đùi - Mông - Bắp chân)',
    exercises: [
      { id: 'squat', name: 'Gánh Tạ (Barbell Squat)', muscle: 'Chân / Mông', defaultSets: 4, defaultWeight: 60, defaultReps: 8 },
      { id: 'leg_press', name: 'Đạp Đùi Máy (Leg Press)', muscle: 'Chân / Mông', defaultSets: 3, defaultWeight: 120, defaultReps: 12 },
      { id: 'rdl', name: 'Deadlift Đùi Sau (Romanian Deadlift)', muscle: 'Chân / Mông', defaultSets: 3, defaultWeight: 50, defaultReps: 10 },
      { id: 'leg_curl', name: 'Móc Đùi Sau Máy (Leg Curl)', muscle: 'Chân / Mông', defaultSets: 3, defaultWeight: 30, defaultReps: 12 },
      { id: 'calf_raise', name: 'Nhón Bắp Chân (Calf Raise)', muscle: 'Chân / Mông', defaultSets: 4, defaultWeight: 40, defaultReps: 15 }
    ]
  },
  {
    id: 'fullbody',
    name: 'Full Body (Toàn Thân Nhanh)',
    exercises: [
      { id: 'goblet_squat', name: 'Goblet Squat Quả Tạ', muscle: 'Chân / Mông', defaultSets: 3, defaultWeight: 20, defaultReps: 12 },
      { id: 'push_up', name: 'Hít Đất (Push Up)', muscle: 'Ngực', defaultSets: 3, defaultWeight: 0, defaultReps: 15 },
      { id: 'db_row', name: 'Chèo Tạ Đơn (One-arm DB Row)', muscle: 'Lưng / Xô', defaultSets: 3, defaultWeight: 18, defaultReps: 12 },
      { id: 'plank', name: 'Plank Bụng (giây)', muscle: 'Bụng / Core', defaultSets: 3, defaultWeight: 0, defaultReps: 45 }
    ]
  }
];

class AppState {
  constructor() {
    this.routines = this.load('hub_routines', DEFAULT_ROUTINES);
    this.currentRoutineId = this.load('hub_current_routine_id', 'push');
    this.exerciseMemory = this.load('hub_exercise_memory', {}); // saves last weight & reps per exercise
    this.exerciseRecords = this.load('hub_exercise_records', {}); // Best PR weight & 1RM
    this.exerciseNotes = this.load('hub_exercise_notes', {}); // Tech notes per exercise
    this.activeWorkout = this.load('hub_active_workout', null);
    this.history = this.load('hub_history', []);
    this.bodyWeightLogs = this.load('hub_body_weights', []); // [{ date: '2026-11-09', weight: 68.5 }]
    this.tasks = this.load('hub_tasks', [
      { id: 't1', title: 'Hoàn thành buổi tập gym hôm nay', priority: 'high', done: false, date: new Date().toLocaleDateString('vi-VN') },
      { id: 't2', title: 'Kiểm tra tin nhắn công việc & email', priority: 'medium', done: false, date: new Date().toLocaleDateString('vi-VN') }
    ]);
    this.notes = this.load('hub_notes', '');
    this.settings = this.load('hub_settings', {
      sound: true,
      vibrate: true,
      defaultRest: 90,
      barWeight: 20
    });

    this.sessionPRsCount = 0;
    this.currentCalMonth = new Date().getMonth();
    this.currentCalYear = new Date().getFullYear();

    if (!this.activeWorkout) {
      this.initWorkoutFromRoutine(this.currentRoutineId);
    }
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  initWorkoutFromRoutine(routineId) {
    const routine = this.routines.find(r => r.id === routineId) || this.routines[0];
    this.currentRoutineId = routine.id;
    this.save('hub_current_routine_id', this.currentRoutineId);

    const exercises = routine.exercises.map(ex => {
      const mem = this.exerciseMemory[ex.name] || null;
      const sets = [];
      const numSets = ex.defaultSets || 3;
      for (let i = 1; i <= numSets; i++) {
        sets.push({
          setNum: i,
          tag: String(i), // '1', '2', 'W', 'D', 'F'
          weight: mem ? mem.weight : (ex.defaultWeight || 20),
          reps: mem ? mem.reps : (ex.defaultReps || 10),
          completed: false,
          previous: mem ? `${mem.weight}kg × ${mem.reps}` : '-'
        });
      }
      return {
        id: 'ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: ex.name,
        muscle: ex.muscle,
        sets: sets
      };
    });

    this.activeWorkout = {
      routineId: routine.id,
      routineName: routine.name,
      startTime: Date.now(),
      exercises: exercises
    };
    this.sessionPRsCount = 0;
    this.save('hub_active_workout', this.activeWorkout);
  }
}

const state = new AppState();

// --- Audio Synthesizer (Zero external files needed) ---
let audioCtx = null;
function playBeep(freq = 880, duration = 0.15, type = 'sine') {
  if (!state.settings.sound) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    console.warn('Audio play beep failed:', err);
  }
}

function playTimerFinishAlarm() {
  if (state.settings.vibrate && 'vibrate' in navigator) {
    navigator.vibrate([200, 100, 200, 100, 400]);
  }
  playBeep(784, 0.12);
  setTimeout(() => playBeep(784, 0.12), 160);
  setTimeout(() => playBeep(1046, 0.35), 340);
}

function playCelebrationFanfare() {
  if (state.settings.vibrate && 'vibrate' in navigator) {
    navigator.vibrate([100, 50, 150, 50, 250]);
  }
  // Arpeggio C5 -> E5 -> G5 -> C6
  playBeep(523.25, 0.1);
  setTimeout(() => playBeep(659.25, 0.1), 120);
  setTimeout(() => playBeep(783.99, 0.1), 240);
  setTimeout(() => playBeep(1046.50, 0.3), 360);
}

// --- Rest Timer & Stopwatch Controller ---
class TimerController {
  constructor() {
    this.totalSeconds = state.settings.defaultRest || 90;
    this.remainingSeconds = this.totalSeconds;
    this.timerInterval = null;
    this.isRunning = false;

    // Stopwatch state
    this.swRunning = false;
    this.swInterval = null;
    this.swStartTime = 0;
    this.swElapsed = 0;

    this.overlay = document.getElementById('restTimerOverlay');
    this.timerNumber = document.getElementById('timerNumber');
    this.progressBar = document.getElementById('timerProgressBar');
    this.quickBadge = document.getElementById('quickTimerBadge');
    this.stopwatchNumber = document.getElementById('stopwatchNumber');
    this.swToggleBtn = document.getElementById('swToggleBtn');
  }

  start(seconds) {
    if (seconds) {
      this.totalSeconds = seconds;
      this.remainingSeconds = seconds;
    }
    clearInterval(this.timerInterval);
    this.isRunning = true;
    this.showOverlay();
    this.render();

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 3 && this.remainingSeconds > 0) {
        // Warning beeps on last 3 seconds
        playBeep(440, 0.08);
      }
      if (this.remainingSeconds <= 0) {
        this.finish();
      } else {
        this.render();
      }
    }, 1000);
  }

  stop() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.quickBadge.classList.add('hidden');
    this.hideOverlay();
  }

  finish() {
    this.stop();
    playTimerFinishAlarm();
  }

  adjustTime(secondsChange) {
    this.remainingSeconds = Math.max(5, this.remainingSeconds + secondsChange);
    this.totalSeconds = Math.max(this.remainingSeconds, this.totalSeconds);
    this.render();
  }

  formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  render() {
    const formatted = this.formatTime(this.remainingSeconds);
    this.timerNumber.textContent = formatted;
    this.quickBadge.textContent = formatted;
    this.quickBadge.classList.remove('hidden');

    const pct = Math.max(0, Math.min(100, (this.remainingSeconds / this.totalSeconds) * 100));
    this.progressBar.style.width = `${pct}%`;
  }

  showOverlay() {
    this.overlay.classList.remove('hidden');
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
  }

  // Stopwatch Methods
  toggleStopwatch() {
    if (this.swRunning) {
      this.pauseStopwatch();
    } else {
      this.startStopwatch();
    }
  }

  startStopwatch() {
    this.swRunning = true;
    this.swStartTime = Date.now() - this.swElapsed;
    this.swToggleBtn.textContent = '⏸ Tạm dừng';
    this.swToggleBtn.style.background = '#f59e0b';
    this.swInterval = setInterval(() => {
      this.swElapsed = Date.now() - this.swStartTime;
      this.renderStopwatch();
    }, 100);
  }

  pauseStopwatch() {
    this.swRunning = false;
    clearInterval(this.swInterval);
    this.swToggleBtn.textContent = '▶ Tiếp tục';
    this.swToggleBtn.style.background = 'var(--accent-green)';
  }

  resetStopwatch() {
    this.pauseStopwatch();
    this.swElapsed = 0;
    this.swToggleBtn.textContent = '▶ Bắt đầu';
    this.renderStopwatch();
  }

  renderStopwatch() {
    const totalSecs = Math.floor(this.swElapsed / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const ms = Math.floor((this.swElapsed % 1000) / 100);
    this.stopwatchNumber.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  }
}

const restTimer = new TimerController();

// --- 1RM & PR Evaluation Helper (Epley formula) ---
function calc1RM(weight, reps) {
  if (!weight || weight <= 0) return 0;
  if (!reps || reps <= 1) return weight;
  // Epley formula: 1RM = weight * (1 + reps / 30)
  return Math.round(weight * (1 + reps / 30));
}

function showPRToast(exerciseName, weight, reps, estimated1RM) {
  const toast = document.getElementById('prToast');
  const title = document.getElementById('prToastTitle');
  const desc = document.getElementById('prToastDesc');

  title.textContent = `🏆 KỶ LỤC MỚI (PR): ${exerciseName}`;
  desc.textContent = `Nâng ${weight}kg × ${reps} reps (Ước tính 1RM: ${estimated1RM}kg)! Đỉnh chóp!`;

  toast.classList.remove('hidden');
  playCelebrationFanfare();

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4500);
}

// --- App Initialization & Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Header Date
  const dateOptions = { weekday: 'long', day: 'numeric', month: 'numeric' };
  const todayStr = new Date().toLocaleDateString('vi-VN', dateOptions);
  document.getElementById('hubDateBadge').textContent = todayStr;

  // 2. Navigation Tabs
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('pageTitle');

  const tabTitles = {
    'tab-gym': 'Tập Luyện Pro',
    'tab-history': 'Tiến Độ & Kỷ Lục',
    'tab-tasks': 'Công Việc',
    'tab-settings': 'Cài Đặt & iPhone'
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const pane = document.getElementById(targetTab);
      if (pane) pane.classList.add('active');
      if (pageTitle && tabTitles[targetTab]) pageTitle.textContent = tabTitles[targetTab];

      if (targetTab === 'tab-history') {
        renderHistoryTab();
      }
      if (targetTab === 'tab-tasks') {
        renderTasks();
      }
    });
  });

  // 3. Render Initial Gym View
  renderWorkoutView();
  initWorkoutElapsedTimer();
  renderTasks();
  initNotes();
  initSettings();

  // 4. Quick Timer Header Button
  document.getElementById('quickTimerBtn').addEventListener('click', () => {
    restTimer.showOverlay();
    if (!restTimer.isRunning) {
      restTimer.start(state.settings.defaultRest || 90);
    }
  });

  document.getElementById('closeTimerOverlayBtn').addEventListener('click', () => {
    restTimer.hideOverlay();
  });

  document.getElementById('skipTimerBtn').addEventListener('click', () => {
    restTimer.stop();
  });

  // Timer chips
  document.querySelectorAll('.timer-chip[data-set]').forEach(chip => {
    chip.addEventListener('click', () => {
      const s = parseInt(chip.getAttribute('data-set'), 10);
      restTimer.start(s);
    });
  });

  document.querySelectorAll('.timer-chip[data-add]').forEach(chip => {
    chip.addEventListener('click', () => {
      const add = parseInt(chip.getAttribute('data-add'), 10);
      restTimer.adjustTime(add);
    });
  });

  // Timer Mode Toggle (Countdown vs Stopwatch)
  const modeCountdownBtn = document.getElementById('modeCountdownBtn');
  const modeStopwatchBtn = document.getElementById('modeStopwatchBtn');
  const countdownPane = document.getElementById('countdownPane');
  const stopwatchPane = document.getElementById('stopwatchPane');

  modeCountdownBtn.addEventListener('click', () => {
    modeCountdownBtn.classList.add('active');
    modeStopwatchBtn.classList.remove('active');
    countdownPane.classList.remove('hidden');
    stopwatchPane.classList.add('hidden');
  });

  modeStopwatchBtn.addEventListener('click', () => {
    modeStopwatchBtn.classList.add('active');
    modeCountdownBtn.classList.remove('active');
    stopwatchPane.classList.remove('hidden');
    countdownPane.classList.add('hidden');
  });

  document.getElementById('swToggleBtn').addEventListener('click', () => restTimer.toggleStopwatch());
  document.getElementById('swResetBtn').addEventListener('click', () => restTimer.resetStopwatch());

  // 5. Change Routine Modal
  const routineModal = document.getElementById('routineModal');
  document.getElementById('changeRoutineBtn').addEventListener('click', () => {
    renderRoutineModalOptions();
    routineModal.classList.remove('hidden');
  });

  // Create new blank routine
  document.getElementById('createNewRoutineBtn').addEventListener('click', () => {
    const name = document.getElementById('newRoutineNameInput').value.trim();
    if (!name) return alert('Vui lòng nhập tên lịch tập!');
    const newRoutine = {
      id: 'custom_' + Date.now(),
      name: name,
      exercises: []
    };
    state.routines.push(newRoutine);
    state.save('hub_routines', state.routines);
    state.initWorkoutFromRoutine(newRoutine.id);
    renderWorkoutView();
    routineModal.classList.add('hidden');
    document.getElementById('newRoutineNameInput').value = '';
    alert(`Đã tạo lịch "${name}". Bạn hãy bấm "+ Thêm bài" để nạp các bài tập vào nhé!`);
  });

  // Save current workout as a new preset routine
  document.getElementById('saveCurrentAsRoutineBtn').addEventListener('click', () => {
    const name = prompt('Nhập tên để lưu các bài tập hiện tại thành lịch mẫu:', state.activeWorkout.routineName + ' (Bản sao)');
    if (!name) return;
    const routineExercises = state.activeWorkout.exercises.map(ex => ({
      id: 'ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: ex.name,
      muscle: ex.muscle,
      defaultSets: ex.sets.length,
      defaultWeight: ex.sets[0] ? ex.sets[0].weight : 20,
      defaultReps: ex.sets[0] ? ex.sets[0].reps : 10
    }));

    const newRoutine = {
      id: 'saved_' + Date.now(),
      name: name,
      exercises: routineExercises
    };
    state.routines.push(newRoutine);
    state.save('hub_routines', state.routines);
    alert(`✅ Đã lưu giáo án "${name}" vào danh sách!`);
  });

  // Reset Workout Timer
  document.getElementById('resetWorkoutTimerBtn').addEventListener('click', () => {
    if (confirm('Đặt lại đồng hồ thời gian buổi tập về 00:00?')) {
      state.activeWorkout.startTime = Date.now();
      state.save('hub_active_workout', state.activeWorkout);
    }
  });

  // 6. 40+ Exercise Library Modal
  const addExerciseModal = document.getElementById('addExerciseModal');
  document.getElementById('addExerciseToWorkoutBtn').addEventListener('click', () => {
    renderExerciseLibrary();
    addExerciseModal.classList.remove('hidden');
  });

  // Search in library
  document.getElementById('searchExerciseInput').addEventListener('input', (e) => {
    renderExerciseLibrary(e.target.value.trim().toLowerCase());
  });

  // Filter chips
  document.querySelectorAll('.muscle-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.muscle-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderExerciseLibrary(document.getElementById('searchExerciseInput').value.trim().toLowerCase(), chip.getAttribute('data-muscle'));
    });
  });

  // Add custom typed exercise
  document.getElementById('confirmAddExerciseBtn').addEventListener('click', () => {
    const name = document.getElementById('newExerciseName').value.trim();
    const muscle = document.getElementById('newExerciseMuscle').value;
    if (!name) {
      alert('Vui lòng nhập tên bài tập!');
      return;
    }
    addNewExerciseToCurrentWorkout(name, muscle);
    document.getElementById('newExerciseName').value = '';
    addExerciseModal.classList.add('hidden');
  });

  // 7. Plate Calculator Modal
  const plateCalcModal = document.getElementById('plateCalcModal');
  document.getElementById('openPlateCalcBtn').addEventListener('click', () => {
    updatePlateCalculator();
    plateCalcModal.classList.remove('hidden');
  });

  // Plate Calculator Controls
  const targetWeightInput = document.getElementById('plateTargetWeight');
  document.getElementById('plateMinus5').addEventListener('click', () => {
    targetWeightInput.value = Math.max(0, (parseFloat(targetWeightInput.value) || 0) - 5);
    updatePlateCalculator();
  });
  document.getElementById('plateMinus25').addEventListener('click', () => {
    targetWeightInput.value = Math.max(0, (parseFloat(targetWeightInput.value) || 0) - 2.5);
    updatePlateCalculator();
  });
  document.getElementById('platePlus25').addEventListener('click', () => {
    targetWeightInput.value = (parseFloat(targetWeightInput.value) || 0) + 2.5;
    updatePlateCalculator();
  });
  document.getElementById('platePlus5').addEventListener('click', () => {
    targetWeightInput.value = (parseFloat(targetWeightInput.value) || 0) + 5;
    updatePlateCalculator();
  });
  targetWeightInput.addEventListener('input', updatePlateCalculator);

  document.querySelectorAll('.bar-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bar-opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.settings.barWeight = parseFloat(btn.getAttribute('data-bar'));
      state.save('hub_settings', state.settings);
      updatePlateCalculator();
    });
  });

  // 8. Finish Workout
  document.getElementById('finishWorkoutBtn').addEventListener('click', () => {
    finishWorkout();
  });

  // 9. Calendar Month Nav
  document.getElementById('calPrevMonthBtn').addEventListener('click', () => {
    state.currentCalMonth--;
    if (state.currentCalMonth < 0) {
      state.currentCalMonth = 11;
      state.currentCalYear--;
    }
    renderCalendarGrid();
  });

  document.getElementById('calNextMonthBtn').addEventListener('click', () => {
    state.currentCalMonth++;
    if (state.currentCalMonth > 11) {
      state.currentCalMonth = 0;
      state.currentCalYear++;
    }
    renderCalendarGrid();
  });

  // 10. Bodyweight Save
  document.getElementById('saveBodyWeightBtn').addEventListener('click', () => {
    const input = document.getElementById('bodyWeightInput');
    const val = parseFloat(input.value);
    if (!val || val <= 30 || val >= 300) {
      return alert('Vui lòng nhập cân nặng hợp lệ (VD: 68.5)!');
    }
    const todayISO = new Date().toISOString().split('T')[0];
    const existingIdx = state.bodyWeightLogs.findIndex(b => b.date === todayISO);
    if (existingIdx >= 0) {
      state.bodyWeightLogs[existingIdx].weight = val;
    } else {
      state.bodyWeightLogs.push({ date: todayISO, weight: val });
    }
    state.save('hub_body_weights', state.bodyWeightLogs);
    input.value = '';
    renderBodyWeightSection();
    alert(`⚖️ Đã lưu cân nặng hôm nay: ${val} kg`);
  });

  // 11. Modal Closers
  document.querySelectorAll('.modal-backdrop, .close-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal').classList.add('hidden');
    });
  });

  // 12. Add Task Modal
  const addTaskModal = document.getElementById('addTaskModal');
  document.getElementById('openNewTaskModal').addEventListener('click', () => {
    document.getElementById('newTaskTitle').value = '';
    addTaskModal.classList.remove('hidden');
  });

  document.getElementById('confirmAddTaskBtn').addEventListener('click', () => {
    const title = document.getElementById('newTaskTitle').value.trim();
    const priority = document.getElementById('newTaskPriority').value;
    if (!title) return alert('Vui lòng nhập nội dung việc!');
    state.tasks.unshift({
      id: 'task_' + Date.now(),
      title: title,
      priority: priority,
      done: false,
      date: new Date().toLocaleDateString('vi-VN')
    });
    state.save('hub_tasks', state.tasks);
    renderTasks();
    addTaskModal.classList.add('hidden');
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTasks(btn.getAttribute('data-filter'));
    });
  });

  // 13. Export & Import Backup
  document.getElementById('exportDataBtn').addEventListener('click', exportBackupData);
  document.getElementById('importDataInput').addEventListener('change', importBackupData);

  // 14. PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('SW registration failed:', err);
    });
  }
});

// --- Gym View & Sets Table Logic ---
function renderWorkoutView() {
  const currentRoutine = state.activeWorkout;
  document.getElementById('currentRoutineName').textContent = currentRoutine.routineName;

  const container = document.getElementById('exerciseList');
  container.innerHTML = '';

  let totalDone = 0;
  let totalKg = 0;

  currentRoutine.exercises.forEach((ex, exIndex) => {
    const card = document.createElement('div');
    card.className = 'exercise-card';

    // Header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'exercise-card-header';
    cardHeader.innerHTML = `
      <div class="exercise-title-group" title="Bấm xem 1RM & Biểu đồ tiến độ">
        <span class="exercise-name">${ex.name}</span>
        <span class="muscle-tag">${ex.muscle || 'Cơ bản'} • 📈 Xem tiến độ</span>
      </div>
      <div class="exercise-actions">
        <button class="btn-icon-del" title="Xóa bài này">🗑️</button>
      </div>
    `;

    // Click on exercise header opens Exercise Details & 1RM
    cardHeader.querySelector('.exercise-title-group').addEventListener('click', () => {
      openExerciseDetailModal(ex.name);
    });

    cardHeader.querySelector('.btn-icon-del').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Xóa bài "${ex.name}" khỏi buổi tập hôm nay?`)) {
        currentRoutine.exercises.splice(exIndex, 1);
        state.save('hub_active_workout', currentRoutine);
        renderWorkoutView();
      }
    });
    card.appendChild(cardHeader);

    // Sets Table
    const table = document.createElement('div');
    table.className = 'sets-table';

    const tableHeader = document.createElement('div');
    tableHeader.className = 'sets-header-row';
    tableHeader.innerHTML = `
      <span>Hiệp</span>
      <span>Trước</span>
      <span>Kg</span>
      <span>Reps</span>
      <span>Xong</span>
    `;
    table.appendChild(tableHeader);

    // Render each set
    ex.sets.forEach((set, setIndex) => {
      if (set.completed) {
        totalDone++;
        totalKg += (Number(set.weight) || 0) * (Number(set.reps) || 0);
      }

      const row = document.createElement('div');
      row.className = `set-row ${set.completed ? 'completed' : ''}`;

      const tagClass = set.tag === 'W' ? 'tag-W' : set.tag === 'D' ? 'tag-D' : set.tag === 'F' ? 'tag-F' : '';
      const tagDisplay = set.tag === 'W' ? 'W' : set.tag === 'D' ? 'D' : set.tag === 'F' ? 'F' : (setIndex + 1);

      row.innerHTML = `
        <div class="set-tag-badge ${tagClass}" title="Bấm đổi loại hiệp: Thường -> W (Khởi động) -> D (Drop) -> F (Failure)">${tagDisplay}</div>
        <span class="set-prev">${set.previous || '-'}</span>
        <div class="stepper-wrap">
          <button class="stepper-btn btn-weight-minus">-</button>
          <input type="number" step="0.5" inputmode="decimal" class="input-weight" value="${set.weight}">
          <button class="stepper-btn btn-weight-plus">+</button>
        </div>
        <div class="stepper-wrap">
          <button class="stepper-btn btn-reps-minus">-</button>
          <input type="number" inputmode="numeric" class="input-reps" value="${set.reps}">
          <button class="stepper-btn btn-reps-plus">+</button>
        </div>
        <button class="btn-check-set ${set.completed ? 'checked' : ''}">${set.completed ? '✓' : ''}</button>
      `;

      // Cycle Set Tag on Badge click: normal -> W -> D -> F -> normal
      const tagBadge = row.querySelector('.set-tag-badge');
      tagBadge.addEventListener('click', () => {
        if (set.tag === String(setIndex + 1)) set.tag = 'W';
        else if (set.tag === 'W') set.tag = 'D';
        else if (set.tag === 'D') set.tag = 'F';
        else set.tag = String(setIndex + 1);

        state.save('hub_active_workout', currentRoutine);
        renderWorkoutView();
      });

      // Inputs & Steppers
      const inputWeight = row.querySelector('.input-weight');
      const inputReps = row.querySelector('.input-reps');
      const checkBtn = row.querySelector('.btn-check-set');

      inputWeight.addEventListener('change', () => {
        set.weight = parseFloat(inputWeight.value) || 0;
        state.save('hub_active_workout', currentRoutine);
        updateWorkoutStatsOnly();
      });

      inputReps.addEventListener('change', () => {
        set.reps = parseInt(inputReps.value, 10) || 0;
        state.save('hub_active_workout', currentRoutine);
        updateWorkoutStatsOnly();
      });

      row.querySelector('.btn-weight-minus').addEventListener('click', () => {
        set.weight = Math.max(0, (parseFloat(set.weight) || 0) - 2.5);
        inputWeight.value = set.weight;
        state.save('hub_active_workout', currentRoutine);
        updateWorkoutStatsOnly();
      });

      row.querySelector('.btn-weight-plus').addEventListener('click', () => {
        set.weight = (parseFloat(set.weight) || 0) + 2.5;
        inputWeight.value = set.weight;
        state.save('hub_active_workout', currentRoutine);
        updateWorkoutStatsOnly();
      });

      row.querySelector('.btn-reps-minus').addEventListener('click', () => {
        set.reps = Math.max(0, (parseInt(set.reps, 10) || 0) - 1);
        inputReps.value = set.reps;
        state.save('hub_active_workout', currentRoutine);
        updateWorkoutStatsOnly();
      });

      row.querySelector('.btn-reps-plus').addEventListener('click', () => {
        set.reps = (parseInt(set.reps, 10) || 0) + 1;
        inputReps.value = set.reps;
        state.save('hub_active_workout', currentRoutine);
        updateWorkoutStatsOnly();
      });

      // CHECK SET COMPLETE & PR EVALUATION
      checkBtn.addEventListener('click', () => {
        set.completed = !set.completed;
        if (set.completed) {
          row.classList.add('completed');
          checkBtn.classList.add('checked');
          checkBtn.textContent = '✓';

          // Memory save for next suggestions
          state.exerciseMemory[ex.name] = { weight: set.weight, reps: set.reps };
          state.save('hub_exercise_memory', state.exerciseMemory);

          // Check for PR (Personal Record)
          const est1RM = calc1RM(set.weight, set.reps);
          const prevRecord = state.exerciseRecords[ex.name] || { bestWeight: 0, best1RM: 0 };

          if (set.weight > prevRecord.bestWeight && set.weight > 0 && set.tag !== 'W') {
            state.exerciseRecords[ex.name] = {
              bestWeight: set.weight,
              best1RM: Math.max(est1RM, prevRecord.best1RM || 0),
              date: new Date().toLocaleDateString('vi-VN')
            };
            state.save('hub_exercise_records', state.exerciseRecords);
            state.sessionPRsCount++;
            showPRToast(ex.name, set.weight, set.reps, est1RM);
          } else {
            // Standard haptic & beep
            if (state.settings.vibrate && 'vibrate' in navigator) navigator.vibrate(40);
            playBeep(660, 0.08);
          }

          // Auto-start rest timer
          restTimer.start(state.settings.defaultRest || 90);
        } else {
          row.classList.remove('completed');
          checkBtn.classList.remove('checked');
          checkBtn.textContent = '';
        }

        state.save('hub_active_workout', currentRoutine);
        updateWorkoutStatsOnly();
      });

      table.appendChild(row);
    });

    // Add Set Button
    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer-action';
    const addSetBtn = document.createElement('button');
    addSetBtn.className = 'btn-add-set';
    addSetBtn.textContent = '+ Thêm 1 hiệp';
    addSetBtn.addEventListener('click', () => {
      const lastSet = ex.sets[ex.sets.length - 1];
      const nextNum = ex.sets.length + 1;
      ex.sets.push({
        setNum: nextNum,
        tag: String(nextNum),
        weight: lastSet ? lastSet.weight : 20,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
        previous: lastSet ? `${lastSet.weight}kg × ${lastSet.reps}` : '-'
      });
      state.save('hub_active_workout', currentRoutine);
      renderWorkoutView();
    });
    cardFooter.appendChild(addSetBtn);

    card.appendChild(table);
    card.appendChild(cardFooter);
    container.appendChild(card);
  });

  document.getElementById('totalSetsDone').textContent = totalDone;
  document.getElementById('totalVolume').textContent = `${totalKg} kg`;
  document.getElementById('totalPRsCount').textContent = `${state.sessionPRsCount} 🏆`;
}

function updateWorkoutStatsOnly() {
  let totalDone = 0;
  let totalKg = 0;
  state.activeWorkout.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (set.completed) {
        totalDone++;
        totalKg += (Number(set.weight) || 0) * (Number(set.reps) || 0);
      }
    });
  });
  document.getElementById('totalSetsDone').textContent = totalDone;
  document.getElementById('totalVolume').textContent = `${totalKg} kg`;
  document.getElementById('totalPRsCount').textContent = `${state.sessionPRsCount} 🏆`;
}

function addNewExerciseToCurrentWorkout(name, muscle) {
  const mem = state.exerciseMemory[name] || null;
  const newEx = {
    id: 'ex_' + Date.now(),
    name: name,
    muscle: muscle,
    sets: [
      { setNum: 1, tag: '1', weight: mem ? mem.weight : 20, reps: mem ? mem.reps : 10, completed: false, previous: mem ? `${mem.weight}kg × ${mem.reps}` : '-' },
      { setNum: 2, tag: '2', weight: mem ? mem.weight : 20, reps: mem ? mem.reps : 10, completed: false, previous: mem ? `${mem.weight}kg × ${mem.reps}` : '-' },
      { setNum: 3, tag: '3', weight: mem ? mem.weight : 20, reps: mem ? mem.reps : 10, completed: false, previous: mem ? `${mem.weight}kg × ${mem.reps}` : '-' }
    ]
  };
  state.activeWorkout.exercises.push(newEx);
  state.save('hub_active_workout', state.activeWorkout);
  renderWorkoutView();
}

function finishWorkout() {
  let totalDone = 0;
  let totalKg = 0;
  state.activeWorkout.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (set.completed) {
        totalDone++;
        totalKg += (Number(set.weight) || 0) * (Number(set.reps) || 0);
      }
    });
  });

  if (totalDone === 0) {
    if (!confirm('Bạn chưa tích hoàn thành hiệp nào, vẫn muốn kết thúc buổi tập?')) return;
  }

  const durationMin = Math.max(1, Math.round((Date.now() - (state.activeWorkout.startTime || Date.now())) / 60000));
  const record = {
    id: 'hist_' + Date.now(),
    isoDate: new Date().toISOString().split('T')[0],
    date: new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' }),
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    routineName: state.activeWorkout.routineName,
    totalSets: totalDone,
    totalKg: totalKg,
    durationMin: durationMin,
    prsCount: state.sessionPRsCount,
    exercisesSummary: state.activeWorkout.exercises.map(ex => {
      const best = ex.sets.reduce((max, s) => s.completed && s.weight > max ? s.weight : max, 0);
      return { name: ex.name, bestWeight: best };
    })
  };

  state.history.unshift(record);
  state.save('hub_history', state.history);

  playCelebrationFanfare();
  alert(`🎉 Tuyệt vời! Bạn đã hoàn thành ${totalDone} hiệp, nâng tổng cộng ${totalKg} kg (${state.sessionPRsCount} kỷ lục PR)!`);

  // Reset new workout from same routine
  state.initWorkoutFromRoutine(state.currentRoutineId);
  renderWorkoutView();
}

function initWorkoutElapsedTimer() {
  const el = document.getElementById('activeTimeElapsed');
  setInterval(() => {
    if (!state.activeWorkout || !state.activeWorkout.startTime) return;
    const diffSec = Math.floor((Date.now() - state.activeWorkout.startTime) / 1000);
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    el.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }, 1000);
}

// --- 40+ Exercise Library Rendering ---
function renderExerciseLibrary(searchQuery = '', filterMuscle = 'all') {
  const list = document.getElementById('libraryExerciseList');
  list.innerHTML = '';

  const filtered = EXERCISE_LIBRARY.filter(item => {
    const matchMuscle = filterMuscle === 'all' || item.muscle === filterMuscle;
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery) || item.muscle.toLowerCase().includes(searchQuery);
    return matchMuscle && matchSearch;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div style="text-align:center; color:#64748b; padding:16px;">Không tìm thấy bài tập nào. Bạn có thể tự nhập ở ô bên dưới!</div>';
    return;
  }

  filtered.forEach(ex => {
    const row = document.createElement('div');
    row.className = 'lib-item';
    row.innerHTML = `
      <span class="lib-title">${ex.name}</span>
      <span class="lib-muscle">${ex.muscle} ➕</span>
    `;
    row.addEventListener('click', () => {
      addNewExerciseToCurrentWorkout(ex.name, ex.muscle);
      document.getElementById('addExerciseModal').classList.add('hidden');
    });
    list.appendChild(row);
  });
}

// --- Plate Calculator & Olympic Colors ---
function updatePlateCalculator() {
  const targetWeight = parseFloat(document.getElementById('plateTargetWeight').value) || 0;
  const barWeight = state.settings.barWeight !== undefined ? state.settings.barWeight : 20;

  // Active bar weight buttons
  document.querySelectorAll('.bar-opt-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.getAttribute('data-bar')) === barWeight);
  });

  const weightNeeded = Math.max(0, targetWeight - barWeight);
  const perSide = weightNeeded / 2;
  document.getElementById('platePerSideLabel').textContent = `Mỗi bên đòn cần lắp: ${perSide} kg`;

  // Standard Olympic Plate inventory (pairs)
  const plateSizes = [25, 20, 15, 10, 5, 2.5, 1.25];
  const platesCount = {};
  let remainder = perSide;

  plateSizes.forEach(size => {
    const count = Math.floor(remainder / size);
    if (count > 0) {
      platesCount[size] = count;
      remainder = Math.round((remainder - count * size) * 100) / 100;
    }
  });

  // Render Barbell Visual
  const graphic = document.getElementById('barbellGraphic');
  graphic.innerHTML = '<div class="bb-bar"></div><div class="bb-collar"></div>';

  const textList = [];
  plateSizes.forEach(size => {
    if (platesCount[size]) {
      textList.push(`${platesCount[size]} bánh ${size}kg`);
      for (let i = 0; i < platesCount[size]; i++) {
        const plateEl = document.createElement('div');
        const sizeClass = size === 2.5 ? 'plate-2_5' : size === 1.25 ? 'plate-1_25' : `plate-${size}`;
        plateEl.className = `bb-plate ${sizeClass}`;
        plateEl.textContent = size;
        graphic.appendChild(plateEl);
      }
    }
  });

  document.getElementById('plateListText').textContent = textList.length > 0 
    ? 'Lắp mỗi bên: ' + textList.join(', ')
    : (weightNeeded === 0 ? 'Chỉ cần nâng thanh đòn không' : 'Không có bánh phù hợp');
}

// --- Exercise Detail Modal (1RM & SVG Progression Chart) ---
function openExerciseDetailModal(exerciseName) {
  const modal = document.getElementById('exerciseDetailModal');
  document.getElementById('detailExTitle').textContent = exerciseName;

  const record = state.exerciseRecords[exerciseName] || { bestWeight: 0, best1RM: 0 };
  document.getElementById('detailBestWeight').textContent = `${record.bestWeight || 0} kg`;
  document.getElementById('detailBest1RM').textContent = `${record.best1RM || 0} kg`;
  document.getElementById('detailBestVolume').textContent = state.exerciseMemory[exerciseName] ? `${state.exerciseMemory[exerciseName].weight}kg × ${state.exerciseMemory[exerciseName].reps}` : '-';

  // Notes
  const noteInput = document.getElementById('detailExNoteInput');
  noteInput.value = state.exerciseNotes[exerciseName] || '';
  noteInput.onchange = () => {
    state.exerciseNotes[exerciseName] = noteInput.value.trim();
    state.save('hub_exercise_notes', state.exerciseNotes);
  };

  // Draw SVG Progress Chart from History
  renderExerciseProgressionChart(exerciseName);
  modal.classList.remove('hidden');
}

function renderExerciseProgressionChart(exerciseName) {
  const wrap = document.getElementById('detailExChart');
  wrap.innerHTML = '';

  const dataPoints = [];
  // Scan history reverse
  [...state.history].reverse().forEach(h => {
    if (h.exercisesSummary) {
      const found = h.exercisesSummary.find(e => e.name === exerciseName);
      if (found && found.bestWeight > 0) {
        dataPoints.push({ date: h.date.split(',')[0], weight: found.bestWeight });
      }
    }
  });

  if (dataPoints.length < 2) {
    wrap.innerHTML = '<div style="color:#64748b; font-size:12px; padding:20px 0; text-align:center;">Cần ít nhất 2 buổi tập có bài này để vẽ biểu đồ tiến độ. Hãy tiếp tục duy trì nhé!</div>';
    return;
  }

  const weights = dataPoints.map(d => d.weight);
  const minW = Math.min(...weights) - 2.5;
  const maxW = Math.max(...weights) + 2.5;
  const range = maxW - minW || 1;

  const w = 320;
  const h = 100;
  const padding = 20;

  const points = dataPoints.map((d, i) => {
    const x = padding + (i / (dataPoints.length - 1)) * (w - padding * 2);
    const y = h - padding - ((d.weight - minW) / range) * (h - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  let svg = `<svg viewBox="0 0 ${w} ${h}" style="width:100%; height:100px;">
    <polyline fill="none" stroke="#10b981" stroke-width="3" points="${points}" />`;

  dataPoints.forEach((d, i) => {
    const x = padding + (i / (dataPoints.length - 1)) * (w - padding * 2);
    const y = h - padding - ((d.weight - minW) / range) * (h - padding * 2);
    svg += `<circle cx="${x}" cy="${y}" r="4" fill="#34d399" />
            <text x="${x}" y="${y - 8}" font-size="9" fill="#94a3b8" text-anchor="middle">${d.weight}kg</text>`;
  });

  svg += '</svg>';
  wrap.innerHTML = svg;
}

// --- Tab 3: History, Calendar Heatmap & Bodyweight ---
function renderHistoryTab() {
  // Lifetime KPIs
  document.getElementById('kpiTotalWorkouts').textContent = state.history.length;
  const totalVolumeAllTime = state.history.reduce((sum, h) => sum + (h.totalKg || 0), 0);
  document.getElementById('kpiTotalTons').textContent = `${totalVolumeAllTime.toLocaleString('vi-VN')} kg`;

  const now = new Date();
  const currentMonthWorkouts = state.history.filter(h => {
    if (!h.isoDate) return false;
    const d = new Date(h.isoDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  document.getElementById('kpiMonthCount').textContent = currentMonthWorkouts;

  renderCalendarGrid();
  renderBodyWeightSection();
  renderHistoryList();
}

function renderCalendarGrid() {
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  document.getElementById('calMonthLabel').textContent = `${monthNames[state.currentCalMonth]}/${state.currentCalYear}`;

  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';

  const firstDayOfMonth = new Date(state.currentCalYear, state.currentCalMonth, 1).getDay();
  // In Vietnam, Monday is index 0. JS getDay() has Sunday=0, Monday=1
  const startOffset = (firstDayOfMonth === 0 ? 7 : firstDayOfMonth) - 1;
  const daysInMonth = new Date(state.currentCalYear, state.currentCalMonth + 1, 0).getDate();

  // Set of dates where user worked out
  const workoutDates = new Set(
    state.history.filter(h => h.isoDate).map(h => h.isoDate)
  );

  const today = new Date();
  const isCurrentMonth = today.getMonth() === state.currentCalMonth && today.getFullYear() === state.currentCalYear;
  const todayDate = today.getDate();

  // Blank filler cells before start of month
  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-cell empty';
    empty.style.opacity = '0.1';
    grid.appendChild(empty);
  }

  // Days of Month
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    cell.textContent = d;

    const mStr = String(state.currentCalMonth + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const iso = `${state.currentCalYear}-${mStr}-${dStr}`;

    if (workoutDates.has(iso)) {
      cell.classList.add('worked-out');
    }
    if (isCurrentMonth && d === todayDate) {
      cell.classList.add('today');
    }

    grid.appendChild(cell);
  }
}

function renderBodyWeightSection() {
  const wrap = document.getElementById('bodyWeightChartWrap');
  const label = document.getElementById('bodyWeightDiffLabel');
  wrap.innerHTML = '';

  const logs = state.bodyWeightLogs;
  if (logs.length === 0) {
    wrap.innerHTML = '<div style="color:#64748b; font-size:12px; padding:16px; text-align:center;">Chưa có cân nặng nào được lưu. Nhập cân nặng ở trên để bắt đầu theo dõi nhé!</div>';
    label.textContent = 'Theo dõi cân nặng để kiểm soát body';
    return;
  }

  const latest = logs[logs.length - 1].weight;
  const initial = logs[0].weight;
  const diff = Math.round((latest - initial) * 10) / 10;
  label.textContent = `Hiện tại: ${latest}kg (${diff > 0 ? '+' + diff : diff}kg so với ngày đầu)`;

  if (logs.length < 2) {
    wrap.innerHTML = `<div style="color:#34d399; font-weight:700; font-size:14px;">Cân nặng đầu tiên: ${latest} kg. Hãy cập nhật sau mỗi tuần!</div>`;
    return;
  }

  // SVG Sparkline
  const weights = logs.map(l => l.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const range = maxW - minW || 1;

  const w = 320;
  const h = 80;
  const padding = 15;

  const points = logs.map((l, i) => {
    const x = padding + (i / (logs.length - 1)) * (w - padding * 2);
    const y = h - padding - ((l.weight - minW) / range) * (h - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  let svg = `<svg viewBox="0 0 ${w} ${h}" style="width:100%; height:80px;">
    <polyline fill="none" stroke="#06b6d4" stroke-width="2.5" points="${points}" />`;

  logs.forEach((l, i) => {
    const x = padding + (i / (logs.length - 1)) * (w - padding * 2);
    const y = h - padding - ((l.weight - minW) / range) * (h - padding * 2);
    svg += `<circle cx="${x}" cy="${y}" r="3.5" fill="#38bdf8" />
            <text x="${x}" y="${y - 6}" font-size="8" fill="#94a3b8" text-anchor="middle">${l.weight}</text>`;
  });

  svg += '</svg>';
  wrap.innerHTML = svg;
}

function renderHistoryList() {
  const container = document.getElementById('workoutHistoryList');
  container.innerHTML = '';

  if (state.history.length === 0) {
    container.innerHTML = '<div style="text-align:center; color:#64748b; padding:24px 0; font-size:13px;">Chưa có lịch sử buổi tập nào. Bấm "Hoàn Thành & Lưu Buổi Tập" khi tập xong nhé!</div>';
    return;
  }

  state.history.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-card-top">
        <span class="history-date">${item.date} • ${item.time || ''}</span>
        <span class="hub-badge">${item.durationMin || 45} phút ${item.prsCount ? '• 🏆 ' + item.prsCount + ' PR' : ''}</span>
      </div>
      <div class="history-routine">${item.routineName}</div>
      <div class="history-summary" style="margin-top:4px;">
        Đã hoàn thành: <strong>${item.totalSets} hiệp</strong> • Tổng tải trọng: <strong style="color:var(--accent-green)">${item.totalKg} kg</strong>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderRoutineModalOptions() {
  const list = document.getElementById('routineOptionsList');
  list.innerHTML = '';
  state.routines.forEach(r => {
    const item = document.createElement('div');
    item.className = 'routine-option-item';
    item.innerHTML = `
      <div class="routine-option-title">${r.name}</div>
      <div class="routine-option-desc">${r.exercises.length} bài tập: ${r.exercises.map(e => e.name.split(' (')[0]).join(', ')}</div>
    `;
    item.addEventListener('click', () => {
      if (confirm(`Đổi sang giáo án "${r.name}"? Dữ liệu hiệp hiện tại chưa lưu sẽ được làm mới.`)) {
        state.initWorkoutFromRoutine(r.id);
        renderWorkoutView();
        document.getElementById('routineModal').classList.add('hidden');
      }
    });
    list.appendChild(item);
  });
}

// --- Tab 2: Tasks & Notes Controller ---
function renderTasks(filter = 'all') {
  const container = document.getElementById('taskList');
  container.innerHTML = '';

  const pendingCount = state.tasks.filter(t => !t.done).length;
  document.getElementById('taskPendingCount').textContent = `${pendingCount} việc cần làm`;

  const filtered = state.tasks.filter(t => {
    if (filter === 'pending') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center; color:#64748b; padding:24px 0; font-size:13px;">Chưa có công việc nào trong mục này.</div>';
    return;
  }

  filtered.forEach(t => {
    const item = document.createElement('div');
    item.className = `task-item ${t.done ? 'completed' : ''}`;

    const priorityBadge = t.priority === 'high' 
      ? '<span class="badge-priority priority-high">Gấp</span>'
      : t.priority === 'low'
      ? '<span class="badge-priority priority-low">Thấp</span>'
      : '<span class="badge-priority priority-medium">Vừa</span>';

    item.innerHTML = `
      <div class="task-checkbox">${t.done ? '✓' : ''}</div>
      <div class="task-body">
        <div class="task-title">${t.title}</div>
        <div class="task-meta">
          <span>${t.date}</span>
          ${priorityBadge}
        </div>
      </div>
      <button class="btn-icon-del" style="font-size:14px;">🗑️</button>
    `;

    item.querySelector('.task-checkbox').addEventListener('click', () => {
      t.done = !t.done;
      state.save('hub_tasks', state.tasks);
      renderTasks(filter);
    });

    item.querySelector('.btn-icon-del').addEventListener('click', () => {
      state.tasks = state.tasks.filter(itemTask => itemTask.id !== t.id);
      state.save('hub_tasks', state.tasks);
      renderTasks(filter);
    });

    container.appendChild(item);
  });
}

function initNotes() {
  const noteInput = document.getElementById('quickNotesInput');
  const statusLbl = document.getElementById('noteSavedStatus');
  noteInput.value = state.notes || '';

  let timer = null;
  noteInput.addEventListener('input', () => {
    statusLbl.textContent = 'Đang lưu...';
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.notes = noteInput.value;
      state.save('hub_notes', state.notes);
      statusLbl.textContent = 'Đã lưu tự động lúc ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }, 600);
  });
}

// --- Tab 4: Settings & Backup ---
function initSettings() {
  const soundToggle = document.getElementById('settingSoundToggle');
  const vibrateToggle = document.getElementById('settingVibrateToggle');
  const defaultRest = document.getElementById('settingDefaultRest');
  const barWeight = document.getElementById('settingBarWeight');

  soundToggle.checked = state.settings.sound;
  vibrateToggle.checked = state.settings.vibrate;
  defaultRest.value = state.settings.defaultRest || 90;
  if (barWeight) barWeight.value = state.settings.barWeight || 20;

  soundToggle.addEventListener('change', () => {
    state.settings.sound = soundToggle.checked;
    state.save('hub_settings', state.settings);
  });

  vibrateToggle.addEventListener('change', () => {
    state.settings.vibrate = vibrateToggle.checked;
    state.save('hub_settings', state.settings);
  });

  defaultRest.addEventListener('change', () => {
    state.settings.defaultRest = parseInt(defaultRest.value, 10);
    state.save('hub_settings', state.settings);
  });

  if (barWeight) {
    barWeight.addEventListener('change', () => {
      state.settings.barWeight = parseFloat(barWeight.value);
      state.save('hub_settings', state.settings);
    });
  }
}

function exportBackupData() {
  const fullData = {
    version: '2.0-pro',
    exportDate: new Date().toISOString(),
    routines: state.routines,
    exerciseMemory: state.exerciseMemory,
    exerciseRecords: state.exerciseRecords,
    exerciseNotes: state.exerciseNotes,
    history: state.history,
    bodyWeightLogs: state.bodyWeightLogs,
    tasks: state.tasks,
    notes: state.notes,
    settings: state.settings
  };

  const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my_hub_pro_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackupData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.routines) state.save('hub_routines', data.routines);
      if (data.exerciseMemory) state.save('hub_exercise_memory', data.exerciseMemory);
      if (data.exerciseRecords) state.save('hub_exercise_records', data.exerciseRecords);
      if (data.exerciseNotes) state.save('hub_exercise_notes', data.exerciseNotes);
      if (data.history) state.save('hub_history', data.history);
      if (data.bodyWeightLogs) state.save('hub_body_weights', data.bodyWeightLogs);
      if (data.tasks) state.save('hub_tasks', data.tasks);
      if (data.notes) state.save('hub_notes', data.notes);
      if (data.settings) state.save('hub_settings', data.settings);

      alert('Khôi phục dữ liệu thành công! App sẽ tự tải lại.');
      window.location.reload();
    } catch (err) {
      alert('File sao lưu không hợp lệ!');
    }
  };
  reader.readAsText(file);
}
