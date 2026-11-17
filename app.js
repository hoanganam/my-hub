/* app.js — Quỹ Hưu Trí (giao diện + tích hợp Gemini API / ChatGPT API + cầu nối Gemini Web).
 * Mọi dữ liệu và API Key chỉ lưu cục bộ trong localStorage trên iPhone của bạn. */
(function () {
  'use strict';
  const R = window.Retire;
  const KEY = 'retire_state_v1';
  const COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#22d3ee', '#a3e635'];
  const TITLES = { overview: 'Tổng quan', portfolio: 'Danh mục', plan: 'Kế hoạch', gemini: 'Đồng bộ Gemini & AI' };

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(), p = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
  const fmt = (n) => Math.round(n).toLocaleString('vi-VN');
  const money = (n) => '<span class="money">' + fmt(n) + ' ₫</span>';
  const sgn = (n) => (n > 0 ? '+' : n < 0 ? '−' : '');
  const smoney = (n) => '<span class="money">' + sgn(n) + fmt(Math.abs(n)) + ' ₫</span>';
  const pct = (n, d) => (n == null ? '—' : n.toFixed(d === undefined ? 1 : d).replace('.', ',') + '%');
  const spct = (n, d) => (n == null ? '—' : sgn(n) + Math.abs(n).toFixed(d === undefined ? 1 : d).replace('.', ',') + '%');
  const dmy = (iso) => (iso ? iso.split('-').reverse().join('/') : '');
  const colorOf = (code) => { const i = S.assets.findIndex((a) => a.code === code); return COLORS[(i < 0 ? 0 : i) % COLORS.length]; };

  /* ---------- State ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        const d = R.defaultState();
        return Object.assign(d, s, { goal: Object.assign(d.goal, s.goal || {}), settings: Object.assign(d.settings, s.settings || {}) });
      }
    } catch (e) { /* dữ liệu hỏng -> nạp danh mục khởi đầu */ }
    const seed = R.initialPortfolioState ? R.initialPortfolioState() : R.defaultState();
    try { localStorage.setItem(KEY, JSON.stringify(seed)); } catch (e) {}
    return seed;
  }
  let S = load();
  let SUM = R.summarize(S);
  let pendingImport = null;
  let lastPlan = null;

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { toast('Không lưu được dữ liệu (bộ nhớ đầy?)'); }
  }
  function commit() { R.upsertSnapshot(S, today()); save(); renderAll(); }

  /* ---------- Tiện ích UI ---------- */
  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), 2600);
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* thử cách khác */ }
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function openModal(title, bodyHTML, opts) {
    opts = opts || {};
    $('#modalRoot').innerHTML = '<div class="modal"><div class="backdrop" data-action="closeModal"></div>' +
      '<form class="sheet" id="modalForm" novalidate><div class="handle"></div>' +
      '<div class="sheet-head"><h3>' + esc(title) + '</h3><button type="button" class="x" data-action="closeModal" aria-label="Đóng">×</button></div>' +
      bodyHTML + '</form></div>';
    const form = $('#modalForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(form));
      if (opts.onSubmit && opts.onSubmit(fd) === false) return;
      closeModal();
    });
    if (opts.onMount) opts.onMount(form);
  }
  function closeModal() { $('#modalRoot').innerHTML = ''; }

  function goTab(tab) {
    document.querySelectorAll('.tab').forEach((el) => el.classList.toggle('active', el.id === 'tab-' + tab));
    document.querySelectorAll('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.tab === tab));
    $('#hdrTitle').textContent = TITLES[tab] || '';
    window.scrollTo(0, 0);
  }

  /* ---------- Render ---------- */
  function renderAll() {
    SUM = R.summarize(S);
    document.body.classList.toggle('mask', !!S.settings.mask);
    renderOverview(); renderPortfolio(); renderPlan(); refreshGemini();
  }

  function noAssetsCard() {
    return '<div class="card empty"><div class="empty-ico">🪙</div><h2>Bắt đầu theo dõi quỹ hưu trí</h2>' +
      '<p>Bạn có thể nạp lại danh mục 3 kênh (Vàng 24K, DCDS, DCBF) hoặc đồng bộ từ Gemini.</p>' +
      '<button class="btn primary w100" data-action="loadSeedPortfolio">⚡ Nạp danh mục 3 kênh (7.672.000 ₫)</button>' +
      '<button class="btn w100" data-action="goTab" data-tab="gemini">✨ Lấy dữ liệu từ Gemini</button>' +
      '<button class="btn w100" data-action="addAsset">+ Thêm tài sản thủ công</button></div>';
  }

  function donut(sm) {
    let acc = 0, accT = 0, out = '';
    const tSum = sm.targetSum;
    sm.assets.forEach((a, i) => {
      const p = a.currentPct;
      out += '<circle cx="21" cy="21" r="16" fill="none" stroke="' + COLORS[i % COLORS.length] + '" stroke-width="5" pathLength="100" stroke-dasharray="' + p + ' ' + (100 - p) + '" stroke-dashoffset="' + (25 - acc) + '"></circle>';
      acc += p;
    });
    if (tSum > 0) {
      sm.assets.forEach((a, i) => {
        const p = (a.targetPct / tSum) * 100;
        out += '<circle cx="21" cy="21" r="10.5" fill="none" stroke="' + COLORS[i % COLORS.length] + '" stroke-opacity=".45" stroke-width="3" pathLength="100" stroke-dasharray="' + p + ' ' + (100 - p) + '" stroke-dashoffset="' + (25 - accT) + '"></circle>';
        accT += p;
      });
    }
    return '<svg class="donut" viewBox="0 0 42 42" role="img" aria-label="Tỷ trọng danh mục">' +
      '<circle cx="21" cy="21" r="16" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="5"></circle>' + out + '</svg>';
  }

  function historyChart() {
    const snaps = S.snapshots || [];
    if (snaps.length < 2) return '';
    const W = 320, H = 110, P = 14;
    const vals = snaps.flatMap((s) => [s.v, s.c]);
    const mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
    const rng = mx - mn || 1;
    const X = (i) => P + (i / (snaps.length - 1)) * (W - 2 * P);
    const Y = (v) => H - P - ((v - mn) / rng) * (H - 2 * P);
    const line = (k, c, dash) => '<polyline fill="none" stroke="' + c + '" stroke-width="2.5" stroke-linejoin="round" ' + (dash ? 'stroke-dasharray="5 4" ' : '') + 'points="' + snaps.map((s, i) => X(i) + ',' + Y(s[k])).join(' ') + '"/>';
    return '<div class="card"><h3>📈 Diễn biến tích sản</h3><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:110px">' +
      line('c', '#94a3b8', true) + line('v', '#fbbf24', false) + '</svg>' +
      '<div class="muted small"><span style="color:#fbbf24">━</span> Tổng giá trị &nbsp; <span style="color:#94a3b8">╌</span> Vốn đã góp &nbsp;·&nbsp; ' + dmy(snaps[0].d) + ' → ' + dmy(snaps[snaps.length - 1].d) + '</div></div>';
  }

  function renderOverview() {
    const el = $('#tab-overview'), sm = SUM;
    if (!S.assets.length) { el.innerHTML = noAssetsCard(); return; }
    const cls = sm.totalPnl >= 0 ? 'pos' : 'neg';
    const chips = [];
    if (sm.totalPending > 0) chips.push('<span class="chip info">⏳ Đang chờ khớp: ' + money(sm.totalPending) + ' (đã tính vào tổng ' + money(sm.totalCommitted) + ')</span>');
    if (sm.unvalued.length) chips.push('<span class="chip warn">💡 Bấm tab Gemini hoặc Cập nhật giá để tính lãi/lỗ theo giá thị trường hôm nay</span>');

    let goal = '';
    if (S.goal && S.goal.amount > 0) {
      const have = sm.totalCommitted;
      const p = Math.max(0, Math.min(100, (have / S.goal.amount) * 100));
      let line = '';
      if (S.goal.deadline) {
        const m = R.monthsBetween(today(), S.goal.deadline);
        const gap = Math.max(0, S.goal.amount - have);
        if (gap <= 0) line = '🎉 Đã đạt mục tiêu!';
        else if (m <= 0) line = '⏰ Đã quá hạn ' + dmy(S.goal.deadline) + ' — còn thiếu ' + money(gap);
        else line = 'Còn <b>' + m.toFixed(1).replace('.', ',') + '</b> tháng (hạn ' + dmy(S.goal.deadline) + ') — cần tích ~ ' + money(gap / m) + '/tháng';
      } else line = 'Còn thiếu ' + money(Math.max(0, S.goal.amount - have));
      goal = '<div class="card"><h3>🏁 Mục tiêu Năm 1: ' + money(S.goal.amount) + '</h3><div class="progress"><i style="width:' + p + '%"></i></div>' +
        '<div class="muted"><b style="color:var(--text)">' + pct(p) + '</b> hoàn thành (' + money(have) + ') · ' + line + '</div></div>';
    }

    const rows = sm.assets.map((a, i) => {
      const c = COLORS[i % COLORS.length];
      const targetAmt = S.goal && S.goal.amount > 0 ? Math.round((S.goal.amount * a.targetPct) / 100) : null;
      let drift = '<span class="muted drift">Chưa đặt mục tiêu</span>';
      if (sm.targetSum > 0 && a.targetPct > 0) {
        const d = a.driftPct;
        drift = d > 1 ? '<span class="drift warn">▲ Vượt tỷ trọng ' + pct(d) + ' (tạm ngưng mua thêm)</span>'
          : d < -1 ? '<span class="drift" style="color:var(--blue)">▼ Thiếu ' + pct(-d) + ' (ưu tiên dồn tiền mới)</span>'
            : '<span class="drift pos">✓ Đúng tỷ trọng mục tiêu</span>';
      }
      return '<div class="alloc-row"><div class="alloc-top"><span class="dot" style="background:' + c + '"></span>' + esc(a.name) +
        '<span class="alloc-nums"><b>' + pct(a.currentPct) + '</b> <span class="muted">/ mục tiêu ' + pct(a.targetPct, 0) + (targetAmt ? ' (~' + fmt(targetAmt / 1e6) + 'tr)' : '') + '</span></span></div>' +
        '<div class="bar"><i style="width:' + Math.min(100, a.currentPct) + '%;background:' + c + '"></i>' + (a.targetPct > 0 ? '<b style="left:calc(' + Math.min(100, a.targetPct) + '% - 1px)"></b>' : '') + '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' + drift +
        '<span class="muted small">' + money(a.effectiveValue) + (a.pending > 0 ? ' (chờ ' + fmt(a.pending) + ')' : '') + ' · <span class="' + (a.pnl >= 0 ? 'pos' : 'neg') + '">' + (a.valued ? smoney(a.pnl) : 'vốn') + '</span></span></div></div>';
    }).join('');

    el.innerHTML =
      '<div class="card hero"><div class="lbl">Tổng danh mục tích sản (gồm lệnh chờ khớp)</div><div class="big">' + money(sm.totalCommitted) + '</div>' +
      '<div class="hero-row"><div><div class="lbl">Vốn đã giải ngân</div><div class="val">' + money(sm.totalCommittedCost) + '</div></div>' +
      '<div><div class="lbl">Lãi / Lỗ tạm tính</div><div class="val ' + cls + '">' + smoney(sm.totalPnl) + ' <small>(' + spct(sm.totalPnlPct) + ')</small></div></div></div>' +
      (chips.length ? '<div class="chips">' + chips.join('') + '</div>' : '') + '</div>' +
      goal +
      '<div class="card"><h3>🥧 Tỷ trọng hiện tại vs Mục tiêu cuối năm 1</h3><div class="donut-wrap">' + donut(sm) +
      '<div class="donut-legend"><div class="legend-note"><span class="ring-key"></span> Vòng ngoài: Tỷ trọng hiện tại</div>' +
      '<div class="legend-note"><span class="ring-key t"></span> Vòng trong: Mục tiêu (28% / 52% / 20%)</div>' +
      (sm.targetSum > 0 && Math.abs(sm.targetSum - 100) > 0.5 ? '<div class="warn" style="margin-top:6px">Tổng mục tiêu = ' + pct(sm.targetSum) + ' (nên 100%)</div>' : '') + '</div></div>' +
      '<div style="margin-top:8px">' + rows + '</div></div>' +
      historyChart();
  }

  function txRow(t, unit) {
    const pend = t.status === 'pending';
    return '<div class="tx" data-action="editTx" data-id="' + esc(t.id) + '"><span class="d">' + dmy(t.date) + '</span>' +
      '<div><div class="a">' + money(t.amount) + (t.units != null ? ' <span class="muted small">· ' + String(t.units).replace('.', ',') + ' ' + esc(unit) + '</span>' : '') + '</div>' +
      (t.note ? '<div class="n">' + esc(t.note) + '</div>' : '') + '</div>' +
      (pend ? '<span class="badge pending">Chờ khớp</span><button class="btn sm mini" data-action="fillTx" data-id="' + esc(t.id) + '">✓ Đã khớp</button>' : '') + '</div>';
  }

  function renderPortfolio() {
    const el = $('#tab-portfolio');
    if (!S.assets.length) { el.innerHTML = noAssetsCard(); return; }
    const cards = SUM.assets.map((a, i) => {
      const txs = S.transactions.filter((t) => t.assetCode === a.code).sort((x, y) => (x.date < y.date ? 1 : -1));
      const notes = [];
      if (!a.valued && a.cost > 0) notes.push('<div class="note warn">💡 Đang hiển thị theo giá vốn. Bấm “💲 Cập nhật giá” để tính lãi/lỗ thực tế.</div>');
      if (a.note === 'units-incomplete') notes.push('<div class="note warn">⚠ Một số lệnh chưa điền số lượng (' + esc(a.unit) + '), hãy bấm vào lệnh bên dưới để bổ sung số ' + esc(a.unit) + ' hoặc nhập Tổng giá trị hiện tại.</div>');
      const priceLine = a.price && S.assets[i].valueBasis === 'price' ? money(a.price) + '/' + esc(a.unit) : '—';
      return '<div class="card"><div class="asset-top"><span class="dot" style="background:' + COLORS[i % COLORS.length] + '"></span>' +
        '<div><div class="asset-name">' + esc(a.name) + '</div><div class="asset-sub">' + esc(R.KIND_LABEL[a.kind] || 'Khác') + ' · mục tiêu ' + pct(a.targetPct, 0) + ' · mã ' + esc(a.code) + '</div></div>' +
        '<div class="asset-val">' + money(a.effectiveValue) + '<div class="p ' + (a.pnl >= 0 ? 'pos' : 'neg') + '">' + (a.valued ? smoney(a.pnl) + ' (' + spct(a.pnlPct) + ')' : 'Tỷ trọng ' + pct(a.currentPct)) + '</div></div></div>' +
        '<div class="kv"><div><span>Vốn đã khớp</span>' + money(a.cost) + '</div><div><span>Tỷ trọng hiện tại</span>' + pct(a.currentPct) + ' (mục tiêu ' + pct(a.targetPct, 0) + ')</div>' +
        '<div><span>Số lượng đang giữ</span>' + (a.unitsComplete ? String(+a.units.toFixed(4)).replace('.', ',') + ' ' + esc(a.unit) : (a.units > 0 ? '≥ ' + String(+a.units.toFixed(4)).replace('.', ',') + ' ' + esc(a.unit) : '—')) + '</div>' +
        '<div><span>Giá hiện tại' + (a.asOf ? ' · ' + dmy(a.asOf) : '') + '</span>' + priceLine + '</div>' +
        (a.pending > 0 ? '<div><span>Đang chờ khớp</span>' + money(a.pending) + '</div>' : '') + '</div>' +
        notes.join('') +
        '<div class="btn-row"><button class="btn sm" data-action="priceAsset" data-code="' + esc(a.code) + '">💲 Cập nhật giá</button>' +
        '<button class="btn sm" data-action="addTx" data-code="' + esc(a.code) + '">+ Giao dịch</button>' +
        '<button class="btn sm ghost" data-action="editAsset" data-code="' + esc(a.code) + '">⚙️ Sửa</button></div>' +
        '<details open><summary>Các khoản đã giải ngân (' + txs.length + ')</summary>' +
        (txs.length ? txs.map((t) => txRow(t, a.unit)).join('') : '<div class="muted small">Chưa có giao dịch.</div>') + '</details></div>';
    }).join('');
    el.innerHTML = cards + '<button class="btn w100" data-action="addAsset">+ Thêm kênh tài sản mới</button>';
  }

  function renderPlan() {
    const el = $('#tab-plan');
    if (!S.assets.length) { el.innerHTML = noAssetsCard(); return; }
    const ts = SUM.targetSum, tsOK = Math.abs(ts - 100) <= 0.5;
    const trows = SUM.assets.map((a) => '<div class="trow"><span class="dot" style="background:' + colorOf(a.code) + '"></span><span class="nm">' + esc(a.name) + '</span>' +
      '<input class="tinput" data-code="' + esc(a.code) + '" inputmode="decimal" value="' + (a.targetPct || '') + '" placeholder="0" aria-label="Tỷ trọng mục tiêu ' + esc(a.name) + '"><span>%</span></div>').join('');
    el.innerHTML =
      '<div class="card"><h3>🧮 Nhịp đi tiếp theo (Chia tiền tiết kiệm mới)</h3>' +
      '<p class="muted">Tự động ưu tiên dồn dòng tiền mới (VD: <b>3,5 – 4 triệu/tháng</b>) vào các kênh đang thiếu tỷ trọng (DCDS, DCBF) và tạm ngưng mua thêm kênh đã vượt trần (Vàng) để kéo danh mục về 28% / 52% / 20%.</p>' +
      '<label for="planAmount">Dòng tiền tiết kiệm tháng này (₫)</label><input id="planAmount" inputmode="numeric" placeholder="VD: 3.750.000" value="' + (S.monthlyContribution ? fmt(S.monthlyContribution) : '') + '">' +
      '<div class="row" style="margin-top:8px">' +
      '<button class="btn sm" data-action="setPlanAmt" data-amt="3500000">3,5 triệu</button>' +
      '<button class="btn sm" data-action="setPlanAmt" data-amt="3750000">3,75 triệu</button>' +
      '<button class="btn sm" data-action="setPlanAmt" data-amt="4000000">4,0 triệu</button></div>' +
      '<div id="planResult"></div></div>' +
      '<div class="card"><h3>🎯 Tỷ trọng mục tiêu (Cuối năm 1)</h3><div>' + trows + '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px"><span class="' + (tsOK ? 'pos' : 'warn') + '"><b>Tổng: ' + pct(ts) + '</b>' + (tsOK ? ' ✓' : ' (nên = 100%)') + '</span>' +
      (!tsOK && ts > 0 ? '<button class="btn sm" data-action="normalizeTargets">Chuẩn hóa về 100%</button>' : '') + '</div></div>' +
      '<div class="card"><h3>🏁 Mục tiêu tổng quỹ (Cuối năm 1)</h3><label for="goalAmount">Số tiền mục tiêu (₫)</label><input id="goalAmount" inputmode="numeric" placeholder="VD: 50.000.000" value="' + (S.goal.amount ? fmt(S.goal.amount) : '') + '">' +
      '<label for="goalDeadline">Hạn hoàn thành</label><input id="goalDeadline" type="date" value="' + esc(S.goal.deadline || '') + '">' +
      '<button class="btn primary w100" data-action="saveGoal">Lưu mục tiêu</button></div>';
    updatePlanResult();
  }

  function updatePlanResult() {
    const box = $('#planResult');
    if (!box) return;
    const amt = R.toNumber(($('#planAmount') || {}).value);
    const plan = amt > 0 ? R.planContribution(SUM, amt) : null;
    lastPlan = plan && plan.ok ? plan : null;
    if (!plan) { box.innerHTML = SUM.assets.some((a) => a.targetPct > 0) ? '' : '<div class="note warn">Hãy nhập tỷ trọng mục tiêu ở bên dưới trước.</div>'; return; }
    if (!plan.ok) { box.innerHTML = '<div class="note warn">Hãy đặt tỷ trọng mục tiêu (> 0%) cho ít nhất 1 tài sản.</div>'; return; }
    box.innerHTML = '<table class="plan-table"><thead><tr><th>Kênh</th><th>Hiện có</th><th>Góp thêm tháng này</th><th>Tỷ trọng sau góp</th></tr></thead><tbody>' +
      plan.rows.map((r) => '<tr><td><span class="dot" style="background:' + colorOf(r.code) + ';display:inline-block;margin-right:6px"></span>' + esc(r.name) + '</td>' +
        '<td>' + pct((r.value + r.pending) / (plan.after - plan.total) * 100) + '</td><td class="buy">' + (r.alloc > 0 ? money(r.alloc) : '0 ₫ (ngưng)') + '</td>' +
        '<td>' + pct(r.afterPct) + ' <span class="muted">/ ' + pct(r.targetPct, 0) + '</span></td></tr>').join('') + '</tbody></table>' +
      '<button class="btn primary w100" data-action="createPlanOrders">📝 Ghi các lệnh góp tháng này vào danh mục (chờ khớp)</button>';
  }

  /* ---------- Gemini & AI API Tab ---------- */
  function initGemini() {
    $('#tab-gemini').innerHTML =
      '<div class="card hero" style="border-color:#fbbf24">' +
      '<h3>🤖 Cách 1: Nhập lệnh / Hỏi AI trực tiếp bằng API</h3>' +
      '<p class="muted">Gõ tự nhiên giao dịch mới hoặc câu hỏi (VD: <i>“Lệnh DCBF 200k ngày 19/11 đã khớp được 7,65 CCQ; cập nhật giá vàng hôm nay 14,2 triệu/chỉ”</i>). Nếu bạn gắn Gemini API Key hoặc OpenAI API Key bên dưới, App sẽ tự gọi AI và cập nhật bảng tính ngay lập tức!</p>' +
      '<textarea id="aiQuickInput" style="min-height:80px;margin-top:8px;font-family:inherit" placeholder="VD: Mình vừa mua thêm 2.150.000đ quỹ DCDS và 1.800.000đ quỹ DCBF hôm nay..."></textarea>' +
      '<button class="btn primary w100" id="runAiBtn" data-action="runAiDirect">⚡ Gửi cho AI phân tích & tự cập nhật App</button>' +
      '<div id="aiDirectOutput"></div>' +
      '<details style="margin-top:10px"><summary>🔑 Cài đặt API Key (Gemini / OpenAI)</summary>' +
      '<label for="aiProviderSelect">Chọn bộ não AI</label>' +
      '<select id="aiProviderSelect"><option value="gemini">Google Gemini API (gemini-2.5-flash)</option><option value="openai">OpenAI ChatGPT API (gpt-4o-mini)</option></select>' +
      '<label for="geminiKeyInput">Gemini API Key (lấy tại aistudio.google.com)</label>' +
      '<input id="geminiKeyInput" type="password" placeholder="AIzaSy..." autocomplete="off">' +
      '<label for="openaiKeyInput">Hoặc OpenAI API Key (sk-...)</label>' +
      '<input id="openaiKeyInput" type="password" placeholder="sk-..." autocomplete="off">' +
      '<button class="btn sm w100" data-action="saveApiKeys">💾 Lưu API Key (chỉ lưu trên iPhone này)</button>' +
      '</details></div>' +

      '<div class="card"><h3>💬 Cách 2: Đồng bộ với đoạn chat Gemini “Hưu trí”</h3>' +
      '<p class="muted">Dùng khi bạn đang trò chuyện trực tiếp trong đoạn chat <b>“Hưu trí”</b> trên web/app Gemini:</p>' +
      '<ol class="steps"><li>Bấm <b>Copy câu hỏi</b> bên dưới.</li><li>Bấm <b>Mở đoạn chat Gemini “Hưu trí”</b>, dán và gửi.</li><li>Copy khối JSON Gemini trả lời → dán vào ô <b>Kết quả từ Gemini</b> bên dưới → bấm <b>Áp dụng</b>.</li></ol>' +
      '<div class="btn-col">' +
      '<button class="btn primary" data-action="copyPrompt" data-kind="sync">📋 Copy câu hỏi: Lấy toàn bộ chi tiết & số CCQ từ Gemini</button>' +
      '<button class="btn" data-action="copyPrompt" data-kind="price">📋 Copy câu hỏi: Nhờ Gemini tra giá Vàng & NAV DCDS/DCBF hôm nay</button>' +
      '<button class="btn" data-action="copyReport">📤 Copy Báo cáo danh mục gửi ngược vào chat Gemini</button>' +
      '<a id="openGemini" class="btn" target="_blank" rel="noopener">↗ Mở đúng đoạn chat Gemini “Hưu trí” của bạn</a></div></div>' +

      '<div class="card"><h3>📥 Dán kết quả JSON từ Gemini vào App</h3>' +
      '<textarea id="pasteBox" placeholder="Dán câu trả lời có chứa khối ```json ... ``` của Gemini vào đây — App sẽ tự đọc và xem trước thay đổi."></textarea>' +
      '<div class="row"><button class="btn" data-action="pasteClipboard">📎 Dán nhanh từ bộ nhớ tạm</button><button class="btn ghost" data-action="clearPaste">Xóa</button></div>' +
      '<label for="importMode">Chế độ cập nhật</label><select id="importMode"><option value="merge">Gộp thông minh: thêm mới, cập nhật lệnh chờ khớp, bỏ trùng (Khuyên dùng)</option><option value="replace">Thay thế toàn bộ lịch sử giao dịch bằng bản mới này</option></select>' +
      '<div id="importPreview"></div></div>' +

      '<div class="card"><h3>⚙️ Quản lý dữ liệu & Sao lưu</h3>' +
      '<label for="geminiUrl">Link đoạn chat Gemini “Hưu trí” của bạn</label>' +
      '<div class="row"><input id="geminiUrl" placeholder="https://gemini.google.com/u/4/app/f3feb48d96e6caae" inputmode="url"><button class="btn" style="flex:0 0 auto" data-action="saveGeminiUrl">Lưu</button></div>' +
      '<div class="btn-col"><button class="btn" data-action="copyBackup">📋 Copy bản sao lưu (JSON)</button>' +
      '<button class="btn" data-action="downloadBackup">💾 Tải file sao lưu (.json)</button>' +
      '<label class="btn" style="margin:0;cursor:pointer;color:var(--text)">📂 Khôi phục từ file sao lưu<input type="file" id="restoreFile" accept=".json,application/json" style="display:none"></label>' +
      '<button class="btn" data-action="loadSeedPortfolio">🔄 Khôi phục về bảng mẫu 17/11/2026 (7.672.000 ₫)</button>' +
      '<button class="btn danger" data-action="resetAll">🗑 Xóa trắng toàn bộ dữ liệu</button></div>' +
      '<p class="muted small" style="margin-top:10px">Bảo mật: Toàn bộ dữ liệu tài chính và API Key chỉ nằm trong bộ nhớ trình duyệt trên thiết bị của bạn.</p></div>';

    $('#pasteBox').addEventListener('input', debounce(previewImport, 300));
    $('#importMode').addEventListener('change', previewImport);
    $('#restoreFile').addEventListener('change', (e) => {
      const f = e.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { $('#pasteBox').value = String(rd.result || ''); previewImport(); };
      rd.readAsText(f); e.target.value = '';
    });
  }

  function safeGeminiUrl(u) {
    return /^https:\/\/(gemini\.google\.com|g\.co)\//i.test(u || '') ? u : 'https://gemini.google.com/u/4/app/f3feb48d96e6caae';
  }
  function refreshGemini() {
    const a = $('#openGemini'); if (a) a.href = safeGeminiUrl(S.settings.geminiUrl);
    const i = $('#geminiUrl'); if (i && document.activeElement !== i) i.value = S.settings.geminiUrl || 'https://gemini.google.com/u/4/app/f3feb48d96e6caae';
    const prov = $('#aiProviderSelect'); if (prov && document.activeElement !== prov) prov.value = S.settings.aiProvider || 'gemini';
    const gk = $('#geminiKeyInput'); if (gk && document.activeElement !== gk) gk.value = S.settings.geminiApiKey || '';
    const ok = $('#openaiKeyInput'); if (ok && document.activeElement !== ok) ok.value = S.settings.openaiApiKey || '';
  }

  async function callDirectAI(userText) {
    const outBox = $('#aiDirectOutput');
    const btn = $('#runAiBtn');
    const provider = S.settings.aiProvider || 'gemini';
    const gKey = (S.settings.geminiApiKey || '').trim();
    const oKey = (S.settings.openaiApiKey || '').trim();
    const activeProvider = (provider === 'gemini' && gKey) ? 'gemini' : (oKey ? 'openai' : (gKey ? 'gemini' : null));

    if (!activeProvider) {
      outBox.innerHTML = '<div class="preview err">Bạn chưa nhập API Key ở mục <b>🔑 Cài đặt API Key</b> bên dưới. Mình đã copy sẵn câu hỏi vào bộ nhớ tạm — bạn có thể dán vào đoạn chat Gemini Web hoặc mở mục Cài đặt API Key để dán key vào nhé!</div>';
      await copyText(R.buildReport(S, today()) + userText);
      return;
    }

    const sysPrompt = [
      'Bạn là trợ lý quản lý Quỹ Hưu Trí cá nhân của người dùng (3 kênh cốt lõi: GOLD - Vàng 24K mục tiêu 28%, DCDS - Quỹ cổ phiếu Dragon Capital mục tiêu 52%, DCBF - Quỹ trái phiếu Dragon Capital mục tiêu 20%; mục tiêu cuối năm 1: 50.000.000 VND, góp đều 3,5 - 4 triệu/tháng).',
      'Hôm nay là ngày ' + today() + '.',
      'Dữ liệu danh mục hiện tại của người dùng:',
      JSON.stringify(R.toExport(S, today()), null, 2),
      '',
      'Nhiệm vụ:',
      '1. Trả lời ngắn gọn, rõ ràng về tình hình lãi/lỗ, tỷ trọng và lời khuyên phân bổ cho yêu cầu của người dùng.',
      '2. Nếu người dùng thông báo giao dịch mới, khớp lệnh, thay đổi mục tiêu, hoặc cập nhật giá (vàng / NAV DCDS / NAV DCBF), BẮT BUỘC kèm theo khối ```json chứa ТОÀN BỘ phần cập nhật theo đúng schema:',
      '{ "asOf": "' + today() + '", "transactions": [ { "asset": "GOLD|DCDS|DCBF", "date": "YYYY-MM-DD", "amount": 0, "units": null, "status": "done|pending", "note": "" } ], "prices": [ { "asset": "GOLD|DCDS|DCBF", "price": 0, "source": "" } ] }',
      'Chỉ đưa vào mảng transactions những giao dịch MỚI hoặc giao dịch vừa đổi trạng thái/số lượng.'
    ].join('\n');

    btn.disabled = true;
    btn.textContent = '⏳ Đang gọi AI phân tích...';
    outBox.innerHTML = '<div class="preview">Đang kết nối ' + (activeProvider === 'gemini' ? 'Google Gemini API' : 'OpenAI API') + '...</div>';

    try {
      let replyText = '';
      if (activeProvider === 'gemini') {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(gKey);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: sysPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userText }] }],
            generationConfig: { temperature: 0.2 }
          })
        });
        const j = await res.json();
        if (!res.ok) throw new Error((j.error && j.error.message) || ('Lỗi HTTP ' + res.status));
        replyText = (((j.candidates || [])[0] || {}).content || {}).parts ? j.candidates[0].content.parts.map((p) => p.text || '').join('\n') : '';
      } else {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + oKey },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.2,
            messages: [
              { role: 'system', content: sysPrompt },
              { role: 'user', content: userText }
            ]
          })
        });
        const j = await res.json();
        if (!res.ok) throw new Error((j.error && j.error.message) || ('Lỗi HTTP ' + res.status));
        replyText = (((j.choices || [])[0] || {}).message || {}).content || '';
      }

      const cleanAdvice = replyText.replace(/```(?:json)?[\s\S]*?```/gi, '').trim();
      outBox.innerHTML = '<div class="preview" style="white-space:pre-wrap;line-height:1.55"><b>🤖 Phản hồi từ AI:</b>\n' + esc(cleanAdvice || 'Đã trích xuất dữ liệu cập nhật bên dưới.') + '</div>';

      const ex = R.extractJSON(replyText);
      if (ex.ok) {
        $('#pasteBox').value = replyText;
        previewImport();
        toast('AI đã tạo dữ liệu cập nhật — bấm “Áp dụng” bên dưới!');
      }
    } catch (err) {
      outBox.innerHTML = '<div class="preview err">Lỗi gọi API: ' + esc(err.message || String(err)) + '</div>';
    } finally {
      btn.disabled = false;
      btn.textContent = '⚡ Gửi cho AI phân tích & tự cập nhật App';
    }
  }

  function debounce(fn, ms) { let t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  function previewImport() {
    const box = $('#importPreview'), txt = $('#pasteBox').value;
    pendingImport = null;
    if (!txt.trim()) { box.innerHTML = ''; return; }
    const ex = R.extractJSON(txt);
    if (!ex.ok) { box.innerHTML = '<div class="preview err">' + esc(ex.error) + '</div>'; return; }
    const data = ex.data;
    if (data.__retireBackup && data.state && Array.isArray(data.state.assets) && Array.isArray(data.state.transactions)) {
      const d = R.defaultState();
      const st = Object.assign(d, data.state, { goal: Object.assign(d.goal, data.state.goal || {}), settings: Object.assign(d.settings, data.state.settings || {}) });
      pendingImport = { type: 'restore', state: st };
      box.innerHTML = '<div class="preview">♻️ Đây là <b>file sao lưu</b>: sẽ <b>thay toàn bộ</b> dữ liệu hiện tại bằng ' + st.assets.length + ' tài sản, ' + st.transactions.length + ' giao dịch.' +
        '<button class="btn primary w100" data-action="applyImport">Khôi phục</button></div>';
      return;
    }
    const res = R.mergeImport(S, data, { mode: $('#importMode').value, today: today() });
    if (!res.ok) { box.innerHTML = '<div class="preview err">' + esc(res.error) + '</div>'; return; }
    pendingImport = { type: 'merge', state: res.state };
    const s = res.summary, items = [];
    if (s.newAssets) items.push('Tài sản mới: <b>' + s.newAssets + '</b>');
    if (s.updatedAssets) items.push('Tài sản cập nhật: <b>' + s.updatedAssets + '</b>');
    if (s.newTx) items.push('Giao dịch mới: <b>' + s.newTx + '</b>');
    if (s.updatedTx) items.push('Giao dịch được cập nhật (vd. chờ khớp → đã khớp, thêm số lượng): <b>' + s.updatedTx + '</b>');
    if (s.skippedTx) items.push('Giao dịch bỏ qua (trùng/thiếu dữ liệu): <b>' + s.skippedTx + '</b>');
    if (s.priceUpdates) items.push('Giá cập nhật: <b>' + s.priceUpdates + '</b>');
    if (s.valueUpdates) items.push('Giá trị cập nhật: <b>' + s.valueUpdates + '</b>');
    if (s.goal) items.push('Mục tiêu tài sản được cập nhật');
    if (s.contribution) items.push('Số tiền góp hàng tháng được cập nhật');
    const nothing = !items.length;
    box.innerHTML = '<div class="preview">' + (nothing ? 'Không có gì thay đổi (dữ liệu này đã có sẵn trong app).' : '✅ Sẵn sàng áp dụng:<ul>' + items.map((x) => '<li>' + x + '</li>').join('') + '</ul>') +
      (res.warnings.length ? '<div class="warns">⚠ Lưu ý:<ul>' + res.warnings.slice(0, 8).map((w) => '<li>' + esc(w) + '</li>').join('') + '</ul></div>' : '') +
      (nothing ? '' : '<button class="btn primary w100" data-action="applyImport">Áp dụng vào danh mục</button>') + '</div>';
  }

  /* ---------- Form ---------- */
  function openAssetForm(code) {
    const a = code ? S.assets.find((x) => x.code === code) : null;
    const kinds = Object.keys(R.KIND_LABEL).map((k) => '<option value="' + k + '"' + (a && a.kind === k ? ' selected' : '') + '>' + R.KIND_LABEL[k] + '</option>').join('');
    openModal(a ? 'Sửa tài sản' : 'Thêm tài sản',
      '<label>Tên</label><input name="name" required value="' + esc(a ? a.name : '') + '" placeholder="VD: Vàng 24K, Quỹ cổ phiếu…">' +
      '<label>Mã (viết tắt, duy nhất)</label><input name="code" ' + (a ? 'readonly' : '') + ' value="' + esc(a ? a.code : '') + '" placeholder="VD: GOLD" autocapitalize="characters">' +
      '<label>Loại</label><select name="kind">' + kinds + '</select>' +
      '<label>Đơn vị tính</label><input name="unit" value="' + esc(a ? a.unit : '') + '" placeholder="chỉ / CCQ / cp (để trống = mặc định)">' +
      '<label>Tỷ trọng mục tiêu (%)</label><input name="targetPct" inputmode="decimal" value="' + (a && a.targetPct ? a.targetPct : '') + '" placeholder="VD: 28">' +
      '<button class="btn primary w100" type="submit">Lưu</button>' +
      (a ? '<button type="button" class="btn danger w100" data-action="deleteAsset" data-code="' + esc(a.code) + '">Xóa tài sản này (và các giao dịch của nó)</button>' : ''),
      {
        onSubmit(fd) {
          const name = (fd.name || '').trim();
          if (!name) { toast('Hãy nhập tên tài sản'); return false; }
          const tp = R.toNumber(fd.targetPct, { decimal: true });
          if (tp !== null && (tp < 0 || tp > 100)) { toast('Tỷ trọng phải từ 0 đến 100'); return false; }
          if (a) {
            a.name = name; a.kind = R.normKind(fd.kind); a.unit = (fd.unit || '').trim() || R.DEFAULT_UNIT[a.kind]; a.targetPct = tp || 0;
          } else {
            const c = R.normCode(fd.code || name);
            if (!c) { toast('Mã không hợp lệ'); return false; }
            if (S.assets.some((x) => x.code === c)) { toast('Mã "' + c + '" đã tồn tại'); return false; }
            S.assets.push(R.makeAsset({ code: c, name: name, kind: fd.kind, unit: (fd.unit || '').trim(), targetPct: tp || 0 }));
          }
          commit(); toast('Đã lưu');
        }
      });
  }

  function openTxForm(code, id) {
    const t = id ? S.transactions.find((x) => x.id === id) : null;
    const ac = t ? t.assetCode : code;
    const opts = S.assets.map((a) => '<option value="' + esc(a.code) + '"' + (a.code === ac ? ' selected' : '') + '>' + esc(a.name) + '</option>').join('');
    openModal(t ? 'Sửa giao dịch' : 'Thêm giao dịch',
      '<label>Tài sản</label><select name="asset">' + opts + '</select>' +
      '<label>Ngày</label><input type="date" name="date" value="' + (t ? esc(t.date) : today()) + '">' +
      '<label>Số tiền đã bỏ ra (₫)</label><input name="amount" inputmode="numeric" value="' + (t ? fmt(t.amount) : '') + '" placeholder="VD: 1.400.000">' +
      '<label>Số lượng mua được <span style="font-weight:400">(số chỉ vàng / số CCQ — tùy chọn, cần để tính lãi lỗ theo giá)</span></label>' +
      '<input name="units" inputmode="decimal" value="' + (t && t.units != null ? String(t.units).replace('.', ',') : '') + '" placeholder="VD: 0,1">' +
      '<label>Trạng thái</label><select name="status"><option value="done"' + (t && t.status === 'pending' ? '' : ' selected') + '>Đã khớp / đã mua</option><option value="pending"' + (t && t.status === 'pending' ? ' selected' : '') + '>Chờ khớp</option></select>' +
      '<label>Ghi chú</label><input name="note" value="' + esc(t ? t.note : '') + '" placeholder="VD: Huy Thanh Jewelry">' +
      '<button class="btn primary w100" type="submit">Lưu</button>' +
      (t ? '<button type="button" class="btn danger w100" data-action="deleteTx" data-id="' + esc(t.id) + '">Xóa giao dịch</button>' : ''),
      {
        onSubmit(fd) {
          const amount = R.toNumber(fd.amount);
          if (!(amount > 0)) { toast('Hãy nhập số tiền hợp lệ'); return false; }
          let units = R.toNumber(fd.units, { decimal: true });
          if (units !== null && units <= 0) units = null;
          const rec = { assetCode: fd.asset, date: fd.date || today(), amount: Math.round(amount), units: units, status: fd.status === 'pending' ? 'pending' : 'done', note: (fd.note || '').trim() };
          if (t) Object.assign(t, rec); else S.transactions.push(Object.assign({ id: R.uid() }, rec));
          commit(); toast('Đã lưu giao dịch');
        }
      });
  }

  function openPriceForm(code) {
    const a = S.assets.find((x) => x.code === code); if (!a) return;
    const hint = a.kind === 'gold' ? 'Vàng: nhập giá MUA VÀO của tiệm (số tiền bạn nhận nếu bán), không phải giá bán ra.' : 'Quỹ: nhập NAV/CCQ mới nhất hoặc tổng giá trị hiện tại trên app DragonX/Fmarket.';
    openModal('Cập nhật giá — ' + a.name,
      '<p class="muted" style="margin-top:8px">' + hint + '</p>' +
      '<label>Cách 1 — Giá hiện tại của 1 ' + esc(a.unit) + ' (₫)</label><input name="price" inputmode="decimal" value="' + (a.price && a.valueBasis === 'price' ? fmt(a.price) : '') + '" placeholder="VD: 14.000.000">' +
      '<label>Cách 2 — Tổng giá trị hiện tại của cả kênh này (₫)</label><input name="total" inputmode="numeric" value="' + (a.marketValue && a.valueBasis === 'manual' ? fmt(a.marketValue) : '') + '" placeholder="Dùng khi chưa nhập số lượng CCQ/chỉ">' +
      '<p class="muted small" style="margin-top:8px">Điền 1 trong 2 ô. Cách 2 cực tiện nếu bạn chỉ muốn nhìn tổng tiền hiện tại trên app quỹ rồi gõ vào để tính ngay lãi/lỗ!</p>' +
      '<button class="btn primary w100" type="submit">Lưu giá</button>',
      {
        onSubmit(fd) {
          const price = R.toNumber(fd.price, { decimal: true }), total = R.toNumber(fd.total);
          if (price > 0) { a.price = price; a.priceAsOf = today(); a.priceSource = 'nhập tay'; a.valueBasis = 'price'; }
          else if (total >= 0 && total !== null) { a.marketValue = total; a.valueAsOf = today(); a.valueBasis = 'manual'; }
          else { toast('Hãy nhập giá hoặc tổng giá trị'); return false; }
          commit(); toast('Đã cập nhật giá');
        }
      });
  }

  /* ---------- Hành động ---------- */
  const actions = {
    goTab: (d) => goTab(d.tab),
    toggleMask: () => { S.settings.mask = !S.settings.mask; save(); renderAll(); },
    closeModal: () => closeModal(),
    addAsset: () => openAssetForm(),
    editAsset: (d) => openAssetForm(d.code),
    deleteAsset: (d) => {
      const a = S.assets.find((x) => x.code === d.code); if (!a) return;
      const n = S.transactions.filter((t) => t.assetCode === d.code).length;
      if (!confirm('Xóa "' + a.name + '" và ' + n + ' giao dịch của nó? Không hoàn tác được.')) return;
      S.assets = S.assets.filter((x) => x.code !== d.code);
      S.transactions = S.transactions.filter((t) => t.assetCode !== d.code);
      closeModal(); commit(); toast('Đã xóa');
    },
    addTx: (d) => openTxForm(d.code),
    editTx: (d) => openTxForm(null, d.id),
    deleteTx: (d) => {
      if (!confirm('Xóa giao dịch này?')) return;
      S.transactions = S.transactions.filter((t) => t.id !== d.id);
      closeModal(); commit(); toast('Đã xóa giao dịch');
    },
    fillTx: (d, e) => {
      e.stopPropagation();
      const t = S.transactions.find((x) => x.id === d.id); if (!t) return;
      t.status = 'done'; commit(); toast('Đã đánh dấu khớp lệnh — nhớ bổ sung số CCQ nếu có');
    },
    priceAsset: (d) => openPriceForm(d.code),
    setPlanAmt: (d) => {
      const n = R.toNumber(d.amt);
      if (n > 0) {
        S.monthlyContribution = n;
        const inp = $('#planAmount');
        if (inp) inp.value = fmt(n);
        save(); updatePlanResult();
      }
    },
    normalizeTargets: () => {
      const ts = SUM.targetSum; if (!(ts > 0)) return;
      let acc = 0; const list = S.assets.filter((a) => a.targetPct > 0);
      list.forEach((a, i) => {
        if (i === list.length - 1) a.targetPct = Math.round((100 - acc) * 10) / 10;
        else { a.targetPct = Math.round((a.targetPct / ts) * 1000) / 10; acc += a.targetPct; }
      });
      commit(); toast('Đã chuẩn hóa tổng về 100%');
    },
    saveGoal: () => {
      const amt = R.toNumber($('#goalAmount').value), dl = $('#goalDeadline').value || null;
      S.goal.amount = amt > 0 ? amt : null; S.goal.deadline = dl;
      commit(); toast('Đã lưu mục tiêu');
    },
    createPlanOrders: () => {
      if (!lastPlan) return;
      const rows = lastPlan.rows.filter((r) => r.alloc > 0);
      if (!rows.length) { toast('Không có lệnh nào cần mua'); return; }
      if (!confirm('Ghi ' + rows.length + ' lệnh “chờ khớp” vào danh mục (tổng ' + fmt(lastPlan.total) + ' ₫)?')) return;
      rows.forEach((r) => S.transactions.push({ id: R.uid(), assetCode: r.code, date: today(), amount: r.alloc, units: null, status: 'pending', note: 'Kế hoạch góp tháng' }));
      commit(); goTab('portfolio'); toast('Đã ghi các lệnh chờ khớp');
    },
    copyPrompt: async (d) => {
      const ok = await copyText(R.buildPrompt(d.kind, S, today()));
      toast(ok ? 'Đã copy câu hỏi — dán vào chat Gemini nhé!' : 'Không copy được, hãy thử lại');
    },
    pasteClipboard: async () => {
      try { const t = await navigator.clipboard.readText(); $('#pasteBox').value = t; previewImport(); }
      catch (e) { toast('Hãy bấm giữ vào ô bên trên và chọn “Dán”'); }
    },
    clearPaste: () => { $('#pasteBox').value = ''; previewImport(); },
    applyImport: () => {
      if (!pendingImport) return;
      const type = pendingImport.type;
      S = pendingImport.state; S.lastSync = new Date().toISOString();
      pendingImport = null; $('#pasteBox').value = ''; $('#importPreview').innerHTML = '';
      commit(); goTab('overview');
      toast(type === 'restore' ? 'Đã khôi phục dữ liệu' : 'Đã cập nhật danh mục từ Gemini ✨');
    },
    copyReport: async () => {
      const ok = await copyText(R.buildReport(S, today()));
      toast(ok ? 'Đã copy báo cáo — dán vào chat Gemini' : 'Không copy được, hãy thử lại');
    },
    saveGeminiUrl: () => {
      const v = $('#geminiUrl').value.trim();
      if (v && !/^https:\/\/(gemini\.google\.com|g\.co)\//i.test(v)) { toast('Chỉ nhận link gemini.google.com'); return; }
      S.settings.geminiUrl = v; save(); refreshGemini(); toast('Đã lưu link');
    },
    saveApiKeys: () => {
      S.settings.aiProvider = ($('#aiProviderSelect') || {}).value || 'gemini';
      S.settings.geminiApiKey = (($('#geminiKeyInput') || {}).value || '').trim();
      S.settings.openaiApiKey = (($('#openaiKeyInput') || {}).value || '').trim();
      save();
      toast('Đã lưu API Key an toàn trên máy này');
    },
    runAiDirect: () => {
      const txt = (($('#aiQuickInput') || {}).value || '').trim();
      if (!txt) { toast('Hãy nhập nội dung giao dịch hoặc câu hỏi cho AI'); return; }
      callDirectAI(txt);
    },
    loadSeedPortfolio: () => {
      if (S.assets.length && !confirm('Khôi phục danh mục mẫu 3 kênh ngày 17/11/2026 (7.672.000 ₫)?')) return;
      const keepSettings = S.settings;
      S = R.initialPortfolioState();
      S.settings = Object.assign(S.settings, keepSettings);
      save(); renderAll(); goTab('overview'); toast('Đã nạp danh mục 7.672.000 ₫');
    },
    copyBackup: async () => {
      const ok = await copyText(JSON.stringify({ __retireBackup: 1, exportedAt: new Date().toISOString(), state: S }, null, 2));
      toast(ok ? 'Đã copy bản sao lưu' : 'Không copy được');
    },
    downloadBackup: () => {
      const blob = new Blob([JSON.stringify({ __retireBackup: 1, exportedAt: new Date().toISOString(), state: S }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'quy-huu-tri-' + today() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    },
    resetAll: () => {
      if (!confirm('Xóa TOÀN BỘ dữ liệu quỹ hưu trí trên máy này?')) return;
      S = R.emptyState(); save(); renderAll(); goTab('overview'); toast('Đã xóa trắng dữ liệu');
    }
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (fn) fn(el.dataset, e);
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'planAmount') {
      const n = R.toNumber(e.target.value);
      S.monthlyContribution = n > 0 ? n : null; save(); updatePlanResult();
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.classList && e.target.classList.contains('tinput')) {
      const a = S.assets.find((x) => x.code === e.target.dataset.code); if (!a) return;
      const v = R.toNumber(e.target.value, { decimal: true });
      if (v !== null && (v < 0 || v > 100)) { toast('Tỷ trọng phải từ 0 đến 100'); renderPlan(); return; }
      a.targetPct = v || 0; commit();
    }
  });

  /* ---------- Khởi động ---------- */
  initGemini();
  renderAll();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
