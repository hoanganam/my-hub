/* app.js — My Hub: Quỹ Hưu Trí "Kiềng 3 Chân" & Bảng Theo Dõi Fit Test (63 Ngày). */
(function () {
  'use strict';
  const R = window.Retire;
  const MASK_KEY = 'retire_mask_v1';
  const FIT_KEY = 'myhub_fittest_v1';
  const COLORS = ['#f59e0b', '#10b981', '#3b82f6'];

  const FIT_MOVES = [
    { id: 'switch_kicks', num: 1, name: 'Switch Kicks', note: '2 kicks = 1 rep' },
    { id: 'power_jacks', num: 2, name: 'Power Jacks', note: '' },
    { id: 'power_knees', num: 3, name: 'Power Knees', note: '' },
    { id: 'power_jumps', num: 4, name: 'Power Jumps', note: '' },
    { id: 'globe_jumps', num: 5, name: 'Globe Jumps', note: '4 jumps = 1 rep' },
    { id: 'suicide_jumps', num: 6, name: 'Suicide Jumps', note: '' },
    { id: 'pushup_jacks', num: 7, name: 'Push-Up Jacks', note: '' },
    { id: 'low_plank_oblique', num: 8, name: 'Low Plank Oblique', note: '' }
  ];

  const FIT_TESTS = [
    { idx: 0, label: 'Test 1', day: 'Day 1' },
    { idx: 1, label: 'Test 2', day: 'Day 15' },
    { idx: 2, label: 'Test 3', day: 'Day 36' },
    { idx: 3, label: 'Test 4', day: 'Day 50' },
    { idx: 4, label: 'Test 5', day: 'Day 63' }
  ];

  const PATHS = {
    check: '<polyline points="20 6 9 17 4 12"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    play: '<polygon points="5 3 19 12 5 21 5 3"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'
  };
  const ico = (name, cls) => '<svg class="svg-ico ' + (cls || '') + '" viewBox="0 0 24 24">' + (PATHS[name] || PATHS.check) + '</svg>';

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => Math.round(n).toLocaleString('vi-VN');
  const shortVnd = (n) => {
    const a = Math.abs(n || 0);
    if (a >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, '').replace('.', ',') + ' tỷ';
    if (a >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, '').replace('.', ',') + ' tr';
    if (a >= 1e3) return Math.round(n / 1e3) + 'k';
    return fmt(n) + ' ₫';
  };
  const money = (n) => '<span class="money">' + fmt(n) + ' ₫</span>';
  const pct = (n, d) => (n == null ? '—' : n.toFixed(d === undefined ? 1 : d).replace('.', ',') + '%');
  const dmyFull = (iso) => (iso ? iso.split('-').reverse().join('/') : '');
  const colorOf = (code) => {
    if (code === 'GOLD') return '#f59e0b';
    if (code === 'DCDS') return '#10b981';
    if (code === 'DCBF') return '#3b82f6';
    return COLORS[0];
  };

  const S = R.initialPortfolioState();
  try { S.settings.mask = localStorage.getItem(MASK_KEY) === '1'; } catch (e) {}

  /* ---------- Fit Test State ---------- */
  function loadFitState() {
    const def = { activeTest: 0, scores: {}, dates: {} };
    FIT_MOVES.forEach((m) => { def.scores[m.id] = [null, null, null, null, null]; });
    try {
      const raw = localStorage.getItem(FIT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.scores) {
          FIT_MOVES.forEach((m) => {
            if (!Array.isArray(parsed.scores[m.id])) parsed.scores[m.id] = [null, null, null, null, null];
          });
          return Object.assign(def, parsed);
        }
      }
    } catch (e) {}
    return def;
  }
  const FIT = loadFitState();
  function saveFitState() {
    try { localStorage.setItem(FIT_KEY, JSON.stringify(FIT)); } catch (e) {}
  }

  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
  }

  /* ---------- 60-Second Fit Test Timer ---------- */
  let audioCtx = null;
  function beep(freq, dur) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.frequency.value = freq || 880;
      g.gain.setValueAtTime(0.25, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (dur || 0.15));
      osc.connect(g); g.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + (dur || 0.15));
    } catch (e) {}
  }

  let ftTimer = { running: false, endAt: 0, remain: 60, iv: null };
  function formatSec(s) {
    const m = Math.floor(s / 60), r = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
  }
  function updateTimerDOM() {
    const clk = $('#ftClock');
    const btn = $('#ftStartBtn');
    if (clk) clk.textContent = formatSec(ftTimer.remain);
    if (btn) btn.innerHTML = ftTimer.running ? 'Tạm dừng' : (ico('play', 'sm') + ' Bấm giờ 60s');
  }
  function toggleFtTimer() {
    if (ftTimer.running) {
      clearInterval(ftTimer.iv);
      ftTimer.running = false;
      updateTimerDOM();
      return;
    }
    if (ftTimer.remain <= 0) ftTimer.remain = 60;
    ftTimer.running = true;
    ftTimer.endAt = Date.now() + ftTimer.remain * 1000;
    beep(660, 0.1);
    updateTimerDOM();
    ftTimer.iv = setInterval(() => {
      const d = Math.max(0, Math.ceil((ftTimer.endAt - Date.now()) / 1000));
      if (d !== ftTimer.remain) {
        ftTimer.remain = d;
        if (d > 0 && d <= 3) beep(520, 0.09);
        updateTimerDOM();
      }
      if (d <= 0) {
        clearInterval(ftTimer.iv);
        ftTimer.running = false;
        ftTimer.remain = 60;
        beep(880, 0.15);
        setTimeout(() => beep(1046, 0.35), 180);
        toast('Hết 1 phút! Ghi số reps vừa tập nhé!');
        updateTimerDOM();
      }
    }, 250);
  }
  function resetFtTimer() {
    clearInterval(ftTimer.iv);
    ftTimer.running = false;
    ftTimer.remain = 60;
    updateTimerDOM();
  }

  /* ---------- Render Overview (Quỹ Hưu Trí) ---------- */
  function donut(sm) {
    let acc = 0, accT = 0, out = '';
    const tSum = sm.targetSum;
    sm.assets.forEach((a) => {
      const p = a.currentPct, c = colorOf(a.code);
      out += '<circle cx="21" cy="21" r="16" fill="none" stroke="' + c + '" stroke-width="5.2" pathLength="100" stroke-dasharray="' + p + ' ' + (100 - p) + '" stroke-dashoffset="' + (25 - acc) + '"></circle>';
      acc += p;
    });
    if (tSum > 0) {
      sm.assets.forEach((a) => {
        const p = (a.targetPct / tSum) * 100, c = colorOf(a.code);
        out += '<circle cx="21" cy="21" r="10.5" fill="none" stroke="' + c + '" stroke-opacity=".35" stroke-width="3" pathLength="100" stroke-dasharray="' + p + ' ' + (100 - p) + '" stroke-dashoffset="' + (25 - accT) + '"></circle>';
        accT += p;
      });
    }
    return '<svg class="donut" viewBox="0 0 42 42" role="img" aria-label="Tỷ trọng">' +
      '<circle cx="21" cy="21" r="16" fill="none" stroke="#e2e8f0" stroke-width="5.2"></circle>' + out + '</svg>';
  }

  function renderOverview() {
    document.body.classList.toggle('mask', !!S.settings.mask);
    const el = $('#tab-overview');
    const sm = R.summarize(S);

    const total = sm.totalCommittedCost;
    const txCount = S.transactions.length;
    const goalAmt = (S.goal && S.goal.amount > 0) ? S.goal.amount : 50000000;
    const goalPct = Math.max(0, Math.min(100, (total / goalAmt) * 100));

    const steps = [
      { amt: 5000000, lbl: 'Khởi động' },
      { amt: 10000000, lbl: 'Đà tăng' },
      { amt: 25000000, lbl: 'Nửa chặng' },
      { amt: goalAmt, lbl: 'Đích Năm 1' }
    ];
    let foundNext = false;
    const msHTML = steps.map((st) => {
      const done = total >= st.amt;
      const isNext = !done && !foundNext;
      if (isNext) foundNext = true;
      return '<div class="ms ' + (done ? 'done' : isNext ? 'next' : '') + '">' +
        '<div class="ms-dot">' + (done ? ico('check', 'sm') : ico('target', 'sm')) + '</div>' +
        '<span class="ms-amt">' + shortVnd(st.amt) + '</span>' +
        '<span class="ms-lbl">' + st.lbl + '</span></div>';
    }).join('');

    const nextStep = steps.find((st) => total < st.amt);
    const cheer = nextStep
      ? 'Chỉ còn <b class="money">' + fmt(nextStep.amt - total) + ' ₫</b> nữa là cán mốc <b>' + shortVnd(nextStep.amt) + '</b>!'
      : 'Bạn đã chinh phục cột mốc ' + shortVnd(goalAmt) + '!';

    let briefHTML = '';
    if (S.advisorBriefing && Array.isArray(S.advisorBriefing.signals)) {
      const sigs = S.advisorBriefing.signals.map((sg) => {
        const cls = sg.action === 'buy' ? 'buy' : (sg.action === 'hold' ? 'hold' : 'stop');
        return '<div class="sig-row ' + cls + '">' +
          '<div class="sig-top"><span class="sig-name">' + esc(sg.name) + '</span>' +
          '<span class="sig-badge ' + cls + '">' + esc(sg.badge) + '</span></div>' +
          '<div class="sig-reason">' + sg.reason + '</div></div>';
      }).join('');
      briefHTML = '<div class="card brief-card">' +
        '<div class="brief-head"><div class="brief-title">' + ico('bell', 'sm') + ' <span>Thông Báo</span></div>' +
        '<span class="brief-date">' + esc(S.advisorBriefing.updatedAt || '') + '</span></div>' +
        (S.advisorBriefing.headline ? '<div class="brief-summary">' + esc(S.advisorBriefing.headline) + '</div>' : '') +
        '<div class="sig-list">' + sigs + '</div></div>';
    }

    const rows = sm.assets.map((a) => {
      const c = colorOf(a.code);
      const d = a.driftPct;
      const tag = d > 1
        ? '<span class="pill-tag pause">KHÔNG MUA THÊM</span>'
        : d < -1
          ? '<span class="pill-tag buy">NÊN MUA GOM</span>'
          : '<span class="pill-tag ok">ĐÚNG TỶ TRỌNG</span>';
      const priceStr = a.price ? ('Giá/NAV: ' + fmt(a.price) + ' ₫/' + a.unit) : '';
      const txs = S.transactions.filter((t) => t.assetCode === a.code).sort((x, y) => (x.date < y.date ? 1 : -1));
      const txList = txs.map((t) =>
        '<div class="tx"><span class="d">' + dmyFull(t.date) + '</span>' +
        '<div style="flex:1"><div class="a">' + money(t.amount) + (t.units != null ? ' · ' + String(t.units).replace('.', ',') + ' ' + esc(a.unit) : '') + '</div>' +
        (t.note ? '<div class="n">' + esc(t.note) + '</div>' : '') + '</div>' +
        (t.status === 'pending' ? '<span class="badge pending">Chờ khớp 19/11</span>' : '') + '</div>'
      ).join('');

      return '<div class="alloc-row">' +
        '<div class="alloc-top"><span class="dot" style="background:' + c + '"></span><span>' + esc(a.name) + '</span>' +
        '<span class="alloc-nums">' + pct(a.currentPct) + ' <span class="muted" style="font-weight:600">/ ' + pct(a.targetPct, 0) + '</span></span></div>' +
        '<div class="bar"><i style="width:' + Math.min(100, a.currentPct) + '%;background:' + c + '"></i>' +
        (a.targetPct > 0 ? '<b style="left:calc(' + Math.min(100, a.targetPct) + '% - 1px)"></b>' : '') + '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' + tag +
        '<span class="muted small"><b>' + money(a.committedCost) + '</b>' + (priceStr ? ' · ' + esc(priceStr) : '') + '</span></div>' +
        '<details><summary>Xem ' + txs.length + ' lệnh đã giải ngân</summary>' + txList + '</details></div>';
    }).join('');

    const legend = sm.assets.map((a) =>
      '<div class="leg-item"><span class="dot" style="background:' + colorOf(a.code) + '"></span><span>' + esc(a.code) + '</span><span class="pct">' + pct(a.currentPct) + '</span></div>'
    ).join('');

    el.innerHTML =
      '<div class="card hero">' +
      '<div class="lbl">Tài sản tích lũy của bạn</div>' +
      '<div class="big">' + money(total) + '</div>' +
      '<div class="hero-badges">' +
      '<span class="hbadge gold">' + ico('check', 'sm') + ' ' + txCount + ' lệnh kỷ luật</span>' +
      '<span class="hbadge">Đủ 3/3 kênh</span>' +
      (sm.totalPending > 0 ? '<span class="hbadge">' + ico('clock', 'sm') + ' ' + shortVnd(sm.totalPending) + ' chờ khớp</span>' : '') +
      '</div></div>' +

      briefHTML +

      '<div class="card goal-card">' +
      '<div class="goal-head"><div><div class="lbl">Hành trình Năm 1 (hạn 06/10/2027)</div><h3 style="margin:2px 0 0">Mục tiêu ' + money(goalAmt) + '</h3></div>' +
      '<div class="goal-pct">' + pct(goalPct) + '</div></div>' +
      '<div class="progress"><i style="width:' + goalPct + '%"></i></div>' +
      '<div class="milestones">' + msHTML + '</div>' +
      '<div class="cheer-banner">' + cheer + '</div></div>' +

      '<div class="card"><h3>Cơ cấu Kiềng 3 Chân</h3>' +
      '<div class="donut-wrap">' + donut(sm) + '<div class="donut-legend">' + legend + '</div></div>' +
      '<div>' + rows + '</div></div>';
  }

  /* ---------- Render Fit Test Tab ---------- */
  function testTotal(idx) {
    return FIT_MOVES.reduce((s, m) => {
      const v = (FIT.scores[m.id] || [])[idx];
      return s + (typeof v === 'number' && v > 0 ? v : 0);
    }, 0);
  }

  function renderFitTest() {
    const el = $('#tab-fittest');
    if (!el) return;
    const tIdx = FIT.activeTest || 0;
    const curTest = FIT_TESTS[tIdx] || FIT_TESTS[0];

    const pills = FIT_TESTS.map((ft) =>
      '<button type="button" class="ft-pill ' + (ft.idx === tIdx ? 'active' : '') + '" data-action="selectFitTest" data-idx="' + ft.idx + '">' +
      '<b>' + ft.label + '</b><span>' + ft.day + '</span></button>'
    ).join('');

    const moveRows = FIT_MOVES.map((m) => {
      const arr = FIT.scores[m.id] || [null, null, null, null, null];
      const val = arr[tIdx];
      let prevVal = null;
      for (let i = tIdx - 1; i >= 0; i--) {
        if (arr[i] != null && arr[i] !== '') { prevVal = arr[i]; break; }
      }
      let diffBadge = '';
      if (val != null && prevVal != null) {
        const diff = val - prevVal;
        if (diff > 0) diffBadge = '<span class="ft-diff up">+' + diff + ' ▲</span>';
        else if (diff < 0) diffBadge = '<span class="ft-diff down">' + diff + ' ▼</span>';
        else diffBadge = '<span class="ft-diff">=</span>';
      }
      return '<div class="ft-row">' +
        '<div><div class="ft-move-name">' + m.num + '. ' + esc(m.name) + diffBadge + '</div>' +
        (m.note ? '<div class="ft-move-note">' + esc(m.note) + '</div>' : (prevVal != null ? '<div class="muted small">Kỳ trước: ' + prevVal + ' reps</div>' : '')) +
        '</div>' +
        '<div class="ft-stepper">' +
        '<button type="button" class="ft-step-btn" data-action="stepFitRep" data-move="' + m.id + '" data-delta="-1">−</button>' +
        '<input type="number" inputmode="numeric" class="ft-input" data-move="' + m.id + '" value="' + (val != null ? val : '') + '" placeholder="—">' +
        '<button type="button" class="ft-step-btn" data-action="stepFitRep" data-move="' + m.id + '" data-delta="1">+</button>' +
        '</div></div>';
    }).join('');

    const curTotal = testTotal(tIdx);
    const prevTotal = tIdx > 0 ? testTotal(tIdx - 1) : 0;
    const totalDiff = (curTotal > 0 && prevTotal > 0) ? (curTotal - prevTotal) : null;

    // Bảng tổng hợp 5 kỳ (8 moves x 5 columns)
    const tableRows = FIT_MOVES.map((m) => {
      const arr = FIT.scores[m.id] || [];
      const cells = FIT_TESTS.map((ft) => '<td>' + (arr[ft.idx] != null ? arr[ft.idx] : '—') + '</td>').join('');
      return '<tr><td>' + m.num + '. ' + esc(m.name) + '</td>' + cells + '</tr>';
    }).join('');
    const totalCells = FIT_TESTS.map((ft) => {
      const tot = testTotal(ft.idx);
      return '<td>' + (tot > 0 ? tot : '—') + '</td>';
    }).join('');

    el.innerHTML =
      '<div class="card ft-timer-card">' +
      '<div class="ft-timer-left"><div class="lbl">Mỗi bài tập tối đa 1 phút</div>' +
      '<div id="ftClock" class="ft-clock">' + formatSec(ftTimer.remain) + '</div></div>' +
      '<div class="ft-timer-btns">' +
      '<button type="button" id="ftStartBtn" class="btn primary" data-action="toggleFtTimer">' +
      (ftTimer.running ? 'Tạm dừng' : (ico('play', 'sm') + ' Bấm giờ 60s')) + '</button>' +
      '<button type="button" class="btn dark" data-action="resetFtTimer" aria-label="Đặt lại">' + ico('rotate', 'sm') + '</button></div></div>' +

      '<div class="ft-tabs">' + pills + '</div>' +

      '<div class="card">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">' +
      '<h3 style="margin:0">Điền thông số · ' + curTest.label + ' (' + curTest.day + ')</h3>' +
      '<span style="font-size:13px;font-weight:800;color:var(--pos)">Tổng: ' + curTotal + ' reps' +
      (totalDiff != null ? ' (' + (totalDiff >= 0 ? '+' : '') + totalDiff + ')' : '') + '</span></div>' +
      '<div>' + moveRows + '</div></div>' +

      '<div class="card"><h3>Bảng tổng hợp 5 kỳ Fit Test</h3>' +
      '<div class="ft-table-wrap"><table class="ft-table"><thead><tr><th>Động tác</th>' +
      FIT_TESTS.map((ft) => '<th>' + ft.label + '<br><span style="font-weight:600;opacity:.75">' + ft.day + '</span></th>').join('') +
      '</tr></thead><tbody>' + tableRows +
      '<tr class="ft-total"><td>Tổng Reps</td>' + totalCells + '</tr></tbody></table></div></div>' +

      '<details class="card" style="padding:14px 18px"><summary>Xem tờ phiếu hướng dẫn 8 động tác</summary>' +
      '<img src="fittest.jpg" alt="Fit Test Guide" style="width:100%;border-radius:14px;margin-top:10px;display:block"></details>';
  }

  function goTab(tab) {
    document.querySelectorAll('.tab').forEach((el) => el.classList.toggle('active', el.id === 'tab-' + tab));
    document.querySelectorAll('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.tab === tab));
    const isFit = tab === 'fittest';
    $('#hdrSub').textContent = isFit ? 'Insanity · 63 Ngày' : 'Tự do tài chính · Kiềng 3 Chân';
    $('#hdrTitle').textContent = isFit ? 'Fit Test' : 'Quỹ Hưu Trí';
    $('#maskBtn').classList.toggle('hidden', isFit);
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const act = el.dataset.action;
    if (act === 'goTab') goTab(el.dataset.tab);
    else if (act === 'toggleMask') {
      S.settings.mask = !S.settings.mask;
      try { localStorage.setItem(MASK_KEY, S.settings.mask ? '1' : '0'); } catch (err) {}
      renderOverview();
    } else if (act === 'selectFitTest') {
      FIT.activeTest = Number(el.dataset.idx) || 0;
      saveFitState();
      renderFitTest();
    } else if (act === 'stepFitRep') {
      const mId = el.dataset.move;
      const delta = Number(el.dataset.delta) || 0;
      const tIdx = FIT.activeTest || 0;
      const cur = (FIT.scores[mId] || [])[tIdx] || 0;
      const next = Math.max(0, cur + delta);
      FIT.scores[mId][tIdx] = next > 0 ? next : null;
      saveFitState();
      renderFitTest();
    } else if (act === 'toggleFtTimer') {
      toggleFtTimer();
    } else if (act === 'resetFtTimer') {
      resetFtTimer();
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.classList && e.target.classList.contains('ft-input')) {
      const mId = e.target.dataset.move;
      const tIdx = FIT.activeTest || 0;
      const raw = e.target.value.trim();
      const n = raw === '' ? null : Math.max(0, parseInt(raw, 10));
      FIT.scores[mId][tIdx] = (n != null && isFinite(n)) ? n : null;
      saveFitState();
      renderFitTest();
    }
  });

  renderOverview();
  renderFitTest();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
