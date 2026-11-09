/**
 * MY HUB — PWA JAVASCRIPT
 * Super App for iPhone: Gym Tracker, Rest Timer & Work Hub
 */

// --- Default Data & State ---
const DEFAULT_ROUTINES = [
  {
    id: 'push',
    name: 'Push Day (Ngực - Vai - Tay sau)',
    exercises: [
      { id: 'bp', name: 'Đẩy Ngực Ngang (Barbell Bench Press)', muscle: 'Ngực', defaultSets: 3, defaultWeight: 50, defaultReps: 10 },
      { id: 'incline_db', name: 'Đẩy Ngực Dốc Tạ Đơn (Incline DB Press)', muscle: 'Ngực', defaultSets: 3, defaultWeight: 18, defaultReps: 12 },
      { id: 'ohp', name: 'Đẩy Vai Quá Đầu (Overhead Press)', muscle: 'Vai', defaultSets: 3, defaultWeight: 30, defaultReps: 10 },
      { id: 'lateral_raise', name: 'Dang Vai Bên (Dumbbell Lateral Raise)', muscle: 'Vai', defaultSets: 3, defaultWeight: 8, defaultReps: 15 },
      { id: 'tricep_pushdown', name: 'Kéo Cáp Tay Sau (Tricep Pushdown)', muscle: 'Tay sau', defaultSets: 3, defaultWeight: 20, defaultReps: 12 }
    ]
  },
  {
    id: 'pull',
    name: 'Pull Day (Lưng - Xô - Tay trước)',
    exercises: [
      { id: 'lat_pulldown', name: 'Kéo Xô Cáp (Lat Pulldown)', muscle: 'Lưng / Xô', defaultSets: 3, defaultWeight: 45, defaultReps: 10 },
      { id: 'barbell_row', name: 'Gập Người Chèo Tạ (Barbell Row)', muscle: 'Lưng / Xô', defaultSets: 3, defaultWeight: 40, defaultReps: 10 },
      { id: 'face_pull', name: 'Kéo Cáp Mặt (Face Pull)', muscle: 'Vai sau', defaultSets: 3, defaultWeight: 15, defaultReps: 15 },
      { id: 'bicep_curl', name: 'Cuốn Tạ Tay Trước (Dumbbell Curl)', muscle: 'Tay trước', defaultSets: 3, defaultWeight: 12, defaultReps: 12 },
      { id: 'hammer_curl', name: 'Cuốn Tạ Búa (Hammer Curl)', muscle: 'Tay trước', defaultSets: 3, defaultWeight: 10, defaultReps: 12 }
    ]
  },
  {
    id: 'legs',
    name: 'Leg Day (Đùi - Mông - Bắp chân)',
    exercises: [
      { id: 'squat', name: 'Gánh Tạ (Barbell Squat)', muscle: 'Chân / Mông', defaultSets: 4, defaultWeight: 60, defaultReps: 8 },
      { id: 'leg_press', name: 'Đạp Đùi (Leg Press Machine)', muscle: 'Chân / Mông', defaultSets: 3, defaultWeight: 120, defaultReps: 12 },
      { id: 'rdl', name: 'Deadlift Đùi Sau (Romanian Deadlift)', muscle: 'Chân / Mông', defaultSets: 3, defaultWeight: 50, defaultReps: 10 },
      { id: 'leg_curl', name: 'Móc Đùi Sau (Lying Leg Curl)', muscle: 'Chân / Mông', defaultSets: 3, defaultWeight: 30, defaultReps: 12 },
      { id: 'calf_raise', name: 'Nhón Bắp Chân (Calf Raise)', muscle: 'Bắp chân', defaultSets: 4, defaultWeight: 40, defaultReps: 15 }
    ]
  },
  {
    id: 'fullbody',
    name: 'Full Body (Toàn Thân Nhanh)',
    exercises: [
      { id: 'goblet_squat', name: 'Goblet Squat', muscle: 'Chân', defaultSets: 3, defaultWeight: 20, defaultReps: 12 },
      { id: 'push_up', name: 'Hít Đất (Push Up)', muscle: 'Ngực', defaultSets: 3, defaultWeight: 0, defaultReps: 15 },
      { id: 'db_row', name: 'Chèo Tạ Đơn (Dumbbell Row)', muscle: 'Lưng', defaultSets: 3, defaultWeight: 16, defaultReps: 12 },
      { id: 'plank', name: 'Plank Bụng (giây)', muscle: 'Bụng / Core', defaultSets: 3, defaultWeight: 0, defaultReps: 45 }
    ]
  }
];

class AppState {
  constructor() {
    this.routines = this.load('hub_routines', DEFAULT_ROUTINES);
    this.currentRoutineId = this.load('hub_current_routine_id', 'push');
    this.exerciseMemory = this.load('hub_exercise_memory', {}); // saves last weight & reps per exercise
    this.activeWorkout = this.load('hub_active_workout', null);
    this.history = this.load('hub_history', []);
    this.tasks = this.load('hub_tasks', [
      { id: 't1', title: 'Hoàn thành buổi tập gym hôm nay', priority: 'high', done: false, date: new Date().toLocaleDateString('vi-VN') },
      { id: 't2', title: 'Kiểm tra tin nhắn công việc & email', priority: 'medium', done: false, date: new Date().toLocaleDateString('vi-VN') }
    ]);
    this.notes = this.load('hub_notes', '');
    this.settings = this.load('hub_settings', {
      sound: true,
      vibrate: true,
      defaultRest: 90
    });

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
    this.save('hub_active_workout', this.activeWorkout);
  }
}

const state = new AppState();

// --- Audio Synthesizer for Timer Beep (Zero external files needed) ---
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

// --- Rest Timer Controller ---
class RestTimer {
  constructor() {
    this.totalSeconds = state.settings.defaultRest || 90;
    this.remainingSeconds = this.totalSeconds;
    this.timerInterval = null;
    this.isRunning = false;

    this.overlay = document.getElementById('restTimerOverlay');
    this.timerNumber = document.getElementById('timerNumber');
    this.progressBar = document.getElementById('timerProgressBar');
    this.quickBadge = document.getElementById('quickTimerBadge');
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
}

const restTimer = new RestTimer();

// --- DOM Rendering & Controller ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Setup Header Date
  const dateOptions = { weekday: 'long', day: 'numeric', month: 'numeric' };
  const todayStr = new Date().toLocaleDateString('vi-VN', dateOptions);
  document.getElementById('hubDateBadge').textContent = todayStr;

  // 2. Navigation Tabs
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('pageTitle');

  const tabTitles = {
    'tab-gym': 'Tập Luyện',
    'tab-tasks': 'Công Việc',
    'tab-history': 'Lịch Sử',
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

      if (targetTab === 'tab-history') renderHistory();
      if (targetTab === 'tab-tasks') renderTasks();
    });
  });

  // 3. Render Initial Views
  renderWorkoutView();
  renderTasks();
  initNotes();
  initSettings();
  initWorkoutElapsedTimer();

  // 4. Quick Timer Header Button
  document.getElementById('quickTimerBtn').addEventListener('click', () => {
    if (restTimer.isRunning) {
      restTimer.showOverlay();
    } else {
      restTimer.start(state.settings.defaultRest || 90);
    }
  });

  // Close Timer Overlay
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

  // 5. Change Routine Modal
  const routineModal = document.getElementById('routineModal');
  document.getElementById('changeRoutineBtn').addEventListener('click', () => {
    renderRoutineModalOptions();
    routineModal.classList.remove('hidden');
  });

  // 6. Add Exercise Modal
  const addExerciseModal = document.getElementById('addExerciseModal');
  document.getElementById('addExerciseToWorkoutBtn').addEventListener('click', () => {
    document.getElementById('newExerciseName').value = '';
    addExerciseModal.classList.remove('hidden');
  });

  document.getElementById('confirmAddExerciseBtn').addEventListener('click', () => {
    const name = document.getElementById('newExerciseName').value.trim();
    const muscle = document.getElementById('newExerciseMuscle').value;
    if (!name) {
      alert('Vui lòng nhập tên bài tập!');
      return;
    }
    addNewExerciseToCurrentWorkout(name, muscle);
    addExerciseModal.classList.add('hidden');
  });

  // Modal Closers
  document.querySelectorAll('.modal-backdrop, .close-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal').classList.add('hidden');
    });
  });

  // 7. Finish Workout
  document.getElementById('finishWorkoutBtn').addEventListener('click', () => {
    finishWorkout();
  });

  // 8. Add Task Modal
  const addTaskModal = document.getElementById('addTaskModal');
  document.getElementById('openNewTaskModal').addEventListener('click', () => {
    document.getElementById('newTaskTitle').value = '';
    addTaskModal.classList.remove('hidden');
  });

  document.getElementById('confirmAddTaskBtn').addEventListener('click', () => {
    const title = document.getElementById('newTaskTitle').value.trim();
    const priority = document.getElementById('newTaskPriority').value;
    if (!title) {
      alert('Vui lòng nhập nội dung việc!');
      return;
    }
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

  // Task Filter Tabs
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTasks(btn.getAttribute('data-filter'));
    });
  });

  // 9. Export & Import Backup Data
  document.getElementById('exportDataBtn').addEventListener('click', exportBackupData);
  document.getElementById('importDataInput').addEventListener('change', importBackupData);

  // 10. Register Service Worker for Offline PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('SW registration failed:', err);
    });
  }
});

// --- Workout View & Stats ---
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
      <div class="exercise-title-group">
        <span class="exercise-name">${ex.name}</span>
        <span class="muscle-tag">${ex.muscle || 'Cơ bản'}</span>
      </div>
      <div class="exercise-actions">
        <button class="btn-icon-del" title="Xóa bài này">🗑️</button>
      </div>
    `;

    cardHeader.querySelector('.btn-icon-del').addEventListener('click', () => {
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
      row.innerHTML = `
        <span class="set-num">${set.setNum}</span>
        <span class="set-prev">${set.previous || '-'}</span>
        <div class="stepper-wrap">
          <button class="stepper-btn btn-weight-minus">-</button>
          <input type="number" step="0.5" class="input-weight" value="${set.weight}">
          <button class="stepper-btn btn-weight-plus">+</button>
        </div>
        <div class="stepper-wrap">
          <button class="stepper-btn btn-reps-minus">-</button>
          <input type="number" class="input-reps" value="${set.reps}">
          <button class="stepper-btn btn-reps-plus">+</button>
        </div>
        <button class="btn-check-set ${set.completed ? 'checked' : ''}">${set.completed ? '✓' : ''}</button>
      `;

      // Inputs & Stepper listeners
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

      // CHECK SET COMPLETE & TRIGGER REST TIMER
      checkBtn.addEventListener('click', () => {
        set.completed = !set.completed;
        if (set.completed) {
          row.classList.add('completed');
          checkBtn.classList.add('checked');
          checkBtn.textContent = '✓';

          // Memory save for next suggestions
          state.exerciseMemory[ex.name] = { weight: set.weight, reps: set.reps };
          state.save('hub_exercise_memory', state.exerciseMemory);

          // Haptic vibration feedback
          if (state.settings.vibrate && 'vibrate' in navigator) {
            navigator.vibrate(40);
          }
          playBeep(660, 0.08);

          // AUTO-START REST TIMER
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

    // Add Set Button at Card Bottom
    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer-action';
    const addSetBtn = document.createElement('button');
    addSetBtn.className = 'btn-add-set';
    addSetBtn.textContent = '+ Thêm 1 hiệp nữa';
    addSetBtn.addEventListener('click', () => {
      const lastSet = ex.sets[ex.sets.length - 1];
      ex.sets.push({
        setNum: ex.sets.length + 1,
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
}

function addNewExerciseToCurrentWorkout(name, muscle) {
  const mem = state.exerciseMemory[name] || null;
  const newEx = {
    id: 'ex_' + Date.now(),
    name: name,
    muscle: muscle,
    sets: [
      { setNum: 1, weight: mem ? mem.weight : 20, reps: mem ? mem.reps : 10, completed: false, previous: mem ? `${mem.weight}kg × ${mem.reps}` : '-' },
      { setNum: 2, weight: mem ? mem.weight : 20, reps: mem ? mem.reps : 10, completed: false, previous: mem ? `${mem.weight}kg × ${mem.reps}` : '-' },
      { setNum: 3, weight: mem ? mem.weight : 20, reps: mem ? mem.reps : 10, completed: false, previous: mem ? `${mem.weight}kg × ${mem.reps}` : '-' }
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
    if (!confirm('Bạn chưa tích hoàn thành hiệp nào, vẫn muốn lưu kết thúc buổi tập?')) return;
  }

  const durationMin = Math.max(1, Math.round((Date.now() - (state.activeWorkout.startTime || Date.now())) / 60000));
  const record = {
    id: 'hist_' + Date.now(),
    date: new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' }),
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    routineName: state.activeWorkout.routineName,
    totalSets: totalDone,
    totalKg: totalKg,
    durationMin: durationMin
  };

  state.history.unshift(record);
  state.save('hub_history', state.history);

  // Reset new workout from same routine
  alert(`🎉 Tuyệt vời! Bạn đã hoàn thành ${totalDone} hiệp, nâng tổng cộng ${totalKg} kg!`);
  state.initWorkoutFromRoutine(state.currentRoutineId);
  renderWorkoutView();
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
      if (confirm(`Đổi sang lịch "${r.name}"? Dữ liệu hiệp hiện tại chưa lưu sẽ được làm mới.`)) {
        state.initWorkoutFromRoutine(r.id);
        renderWorkoutView();
        document.getElementById('routineModal').classList.add('hidden');
      }
    });
    list.appendChild(item);
  });
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

    // Toggle complete
    item.querySelector('.task-checkbox').addEventListener('click', () => {
      t.done = !t.done;
      state.save('hub_tasks', state.tasks);
      renderTasks(filter);
    });

    // Delete task
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

// --- Tab 3: History ---
function renderHistory() {
  const container = document.getElementById('workoutHistoryList');
  container.innerHTML = '';

  if (state.history.length === 0) {
    container.innerHTML = '<div style="text-align:center; color:#64748b; padding:30px 0; font-size:14px;">Chưa có lịch sử buổi tập nào. Hãy bấm "Hoàn Thành Buổi Tập" khi tập xong nhé!</div>';
    return;
  }

  state.history.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-card-top">
        <span class="history-date">${item.date} • ${item.time || ''}</span>
        <span class="hub-badge">${item.durationMin || 45} phút</span>
      </div>
      <div class="history-routine">${item.routineName}</div>
      <div class="history-summary" style="margin-top:6px;">
        Đã hoàn thành: <strong>${item.totalSets} hiệp</strong> • Tổng tải trọng: <strong style="color:var(--accent-green)">${item.totalKg} kg</strong>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- Tab 4: Settings ---
function initSettings() {
  const soundToggle = document.getElementById('settingSoundToggle');
  const vibrateToggle = document.getElementById('settingVibrateToggle');
  const defaultRest = document.getElementById('settingDefaultRest');

  soundToggle.checked = state.settings.sound;
  vibrateToggle.checked = state.settings.vibrate;
  defaultRest.value = state.settings.defaultRest || 90;

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
}

function exportBackupData() {
  const fullData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    routines: state.routines,
    exerciseMemory: state.exerciseMemory,
    history: state.history,
    tasks: state.tasks,
    notes: state.notes,
    settings: state.settings
  };

  const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my_hub_backup_${new Date().toISOString().slice(0, 10)}.json`;
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
      if (data.history) state.save('hub_history', data.history);
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

