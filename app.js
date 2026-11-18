/* app.js — Quỹ Hưu Trí "Kiềng 3 Chân" (Giao diện Sáng · Icon nét mảnh Lucide · Tối giản).
 * Mọi dữ liệu và API Key chỉ lưu cục bộ trong localStorage trên iPhone của bạn. */
(function () {
  'use strict';
  const R = window.Retire;
  const KEY = 'retire_state_v3';
  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316'];
  const TITLES = { overview: 'Quỹ Hưu Trí', portfolio: 'Tài sản của tôi', plan: 'Nhịp góp tháng tới', gemini: 'Cố vấn Gemini' };
  const ICON_BG = { gold: '#fef3c7', fund: '#d1fae5', stock: '#dbeafe', cash: '#e0e7ff', other: '#f3e8ff' };
  const ICON_FG = { gold: '#d97706', fund: '#059669', stock: '#2563eb', cash: '#4f46e5', other: '#7c3aed' };

  // Bộ icon nét mảnh tối giản (Lucide SVG style)
  const PATHS = {
    gold: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/>',
    fund: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="8" x2="14" y2="8"/><line x1="18" y1="16" x2="22" y2="16"/>',
    sparkle: '<path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/>',
    ext: '<path d="M7 17L17 7"/><path d="M7 7h10v10"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
  };
  const ico = (name, cls) => '<svg class="svg-ico ' + (cls || '') + '" viewBox="0 0 24 24">' + (PATHS[name] || PATHS.fund) + '</svg>';

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(), p = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
  const fmt = (n) => Math.round(n).toLocaleString('vi-VN');
  const shortVnd = (n) => {
    const a = Math.abs(n || 0);
    if (a >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, '').replace('.', ',') + ' tỷ';
    if (a >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, '').replace('.', ',') + ' tr';
    if (a >= 1e3) return Math.round(n / 1e3) + 'k';
    return fmt(n) + ' ₫';
  };
  const money = (n) => '<span class="money">' + fmt(n) + ' ₫</span>';
  const sgn = (n) => (n > 0 ? '+' : n < 0 ? '−' : '');
  const smoney = (n) => '<span class="money">' + sgn(n) + fmt(Math.abs(n)) + ' ₫</span>';
  const pct = (n, d) => (n == null ? '—' : n.toFixed(d === undefined ? 1 : d).replace('.', ',') + '%');
  const dmyFull = (iso) => (iso ? iso.split('-').reverse().join('/') : '');
  const colorOf = (code) => {
    if (code === 'GOLD') return '#f59e0b';
    if (code === 'DCDS') return '#10b981';
    if (code === 'DCBF') return '#3b82f6';
    const i = S.assets.findIndex((a) => a.code === code);
    return COLORS[(i < 0 ? 0 : i) % COLORS.length];
  };
  const iconOf = (a, cls) => {
    const k = a.code === 'DCBF' ? 'shield' : (a.kind === 'gold' ? 'gold' : 'fund');
    return ico(k, cls);
  };
  const iconBgOf = (a) => (a.code === 'DCBF' ? '#dbeafe' : (ICON_BG[a.kind] || '#f1f5f9'));
  const iconFgOf = (a) => (a.code === 'DCBF' ? '#2563eb' : (ICON_FG[a.kind] || '#0f172a'));

  /* ---------- State ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        const d = R.defaultState();
        return Object.assign(d, s, { goal: Object.assign(d.goal, s.goal || {}), settings: Object.assign(d.settings, s.settings || {}) });
      }
    } catch (e) {}
    const seed = R.initialPortfolioState ? R.initialPortfolioState() : R.defaultState();
    try {
      const oldRaw = localStorage.getItem('retire_state_v2') || localStorage.getItem('retire_state_v1');
      if (oldRaw) {
        const old = JSON.parse(oldRaw);
        if (old && old.settings) seed.settings = Object.assign(seed.settings, old.settings);
      }
      localStorage.setItem(KEY, JSON.stringify(seed));
    } catch (e) {}
    return seed;
  }
  let S = load();
  let SUM = R.summarize(S);
  let pendingImport = null;
  let lastPlan = null;

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { toast('Không lưu được dữ liệu'); }
  }
  function commit() { R.upsertSnapshot(S, today()); save(); renderAll(); }

  /* ---------- Tiện ích UI ---------- */
  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), 2400);
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
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
    return '<div class="card empty"><h2>Khởi động Quỹ Hưu Trí</h2>' +
      '<button class="btn primary w100" data-action="loadSeedPortfolio">Nạp danh mục Kiềng 3 Chân (7.672.000 ₫)</button>' +
      '<button class="btn w100" data-action="goTab" data-tab="gemini">Đồng bộ từ Gemini</button></div>';
  }

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
    const el = $('#tab-overview'), sm = SUM;
    if (!S.assets.length) { el.innerHTML = noAssetsCard(); return; }

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

    const rows = sm.assets.map((a) => {
      const c = colorOf(a.code);
      const d = a.driftPct;
      const tag = d > 1
        ? '<span class="pill-tag pause">Đủ rồi · Ngưng mua</span>'
        : d < -1
          ? '<span class="pill-tag buy">Ưu tiên gom thêm</span>'
          : '<span class="pill-tag ok">Đúng chuẩn</span>';
      return '<div class="alloc-row">' +
        '<div class="alloc-top"><span class="dot" style="background:' + c + '"></span><span>' + esc(a.name) + '</span>' +
        '<span class="alloc-nums">' + pct(a.currentPct) + ' <span class="muted" style="font-weight:600">/ ' + pct(a.targetPct, 0) + '</span></span></div>' +
        '<div class="bar"><i style="width:' + Math.min(100, a.currentPct) + '%;background:' + c + '"></i>' +
        (a.targetPct > 0 ? '<b style="left:calc(' + Math.min(100, a.targetPct) + '% - 1px)"></b>' : '') + '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' + tag +
        '<span class="muted small"><b>' + money(a.committedCost) + '</b>' + (a.pending > 0 ? ' (chờ 19/11)' : '') + '</span></div></div>';
    }).join('');

    const legend = sm.assets.map((a) =>
      '<div class="leg-item"><span class="dot" style="background:' + colorOf(a.code) + '"></span><span>' + esc(a.code) + '</span><span class="pct">' + pct(a.currentPct) + '</span></div>'
    ).join('');

    const pendTx = S.transactions.find((t) => t.status === 'pending');
    const pendingBanner = pendTx
      ? '<div class="card" style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fffbeb;border-color:#fde68a">' +
        '<div style="font-size:13px;color:#92400e"><b>Lệnh ' + esc(pendTx.assetCode) + ' ' + shortVnd(pendTx.amount) + '</b> · Khớp 19/11/2026</div>' +
        '<button class="btn sm primary" data-action="fillTx" data-id="' + esc(pendTx.id) + '">Xác nhận khớp</button></div>'
      : '';

    el.innerHTML =
      '<div class="card hero">' +
      '<div class="lbl">Tài sản tích lũy của bạn</div>' +
      '<div class="big">' + money(total) + '</div>' +
      '<div class="hero-badges">' +
      '<span class="hbadge gold">' + ico('check', 'sm') + ' ' + txCount + ' lệnh kỷ luật</span>' +
      '<span class="hbadge">Kiềng 3 Chân</span>' +
      (sm.totalPending > 0 ? '<span class="hbadge">' + ico('clock', 'sm') + ' ' + shortVnd(sm.totalPending) + ' chờ khớp</span>' : '') +
      '</div></div>' +
      pendingBanner +

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

  function txRow(t, unit) {
    const pend = t.status === 'pending';
    const missingUnits = !pend && (t.units == null || t.units <= 0);
    return '<div class="tx" data-action="editTx" data-id="' + esc(t.id) + '">' +
      '<span class="d">' + dmyFull(t.date) + '</span>' +
      '<div style="flex:1"><div class="a">' + money(t.amount) + (t.units != null ? ' <span class="pos small">· ' + String(t.units).replace('.', ',') + ' ' + esc(unit) + '</span>' : '') + '</div>' +
      (t.note ? '<div class="n">' + esc(t.note) + '</div>' : '') + '</div>' +
      (missingUnits ? '<span class="badge pending">+ Số ' + esc(unit) + '</span>' : '') +
      (pend ? '<button class="btn sm mini primary" data-action="fillTx" data-id="' + esc(t.id) + '">Đã khớp</button>' : '') +
      '</div>';
  }

  function renderPortfolio() {
    const el = $('#tab-portfolio');
    if (!S.assets.length) { el.innerHTML = noAssetsCard(); return; }
    const cards = SUM.assets.map((a) => {
      const txs = S.transactions.filter((t) => t.assetCode === a.code).sort((x, y) => (x.date < y.date ? 1 : -1));
      const priceStr = a.price ? shortVnd(a.price) + '/' + a.unit : '—';
      const qtyStr = a.units > 0 ? String(+a.units.toFixed(3)).replace('.', ',') + ' ' + a.unit : 'Chưa nhập';
      return '<div class="card">' +
        '<div class="asset-top">' +
        '<div class="asset-ico" style="background:' + iconBgOf(a) + ';color:' + iconFgOf(a) + '">' + iconOf(a) + '</div>' +
        '<div><div class="asset-name">' + esc(a.name) + '</div><div class="asset-sub">Mục tiêu ' + pct(a.targetPct, 0) + ' · Hiện tại ' + pct(a.currentPct) + '</div></div>' +
        '<div class="asset-val">' + money(a.committedCost) + '<div class="p ' + (a.pnl >= 0 ? 'pos' : 'neg') + '">' + (a.valued && a.pnl !== 0 ? smoney(a.pnl) : (a.pending > 0 ? 'Chờ khớp 19/11' : 'Đã giải ngân')) + '</div></div></div>' +
        '<div class="stat-pills">' +
        '<div class="sp"><span>Số lượng</span><b>' + esc(qtyStr) + '</b></div>' +
        '<div class="sp"><span>Giá / NAV</span><b>' + esc(priceStr) + '</b></div>' +
        '<div class="sp"><span>Số lệnh</span><b>' + txs.length + ' lệnh</b></div></div>' +
        '<div class="btn-row">' +
        '<button class="btn sm primary" data-action="addTx" data-code="' + esc(a.code) + '">' + ico('plus', 'sm') + ' Mua thêm</button>' +
        '<button class="btn sm" data-action="priceAsset" data-code="' + esc(a.code) + '">Giá hôm nay</button>' +
        '<button class="btn sm ghost" data-action="editAsset" data-code="' + esc(a.code) + '" aria-label="Sửa">' + ico('sliders', 'sm') + '</button></div>' +
        '<details' + (a.pending > 0 ? ' open' : '') + '><summary>Xem ' + txs.length + ' lệnh đã mua</summary>' +
        (txs.length ? txs.map((t) => txRow(t, a.unit)).join('') : '<div class="muted small">Chưa có giao dịch.</div>') + '</details></div>';
    }).join('');
    el.innerHTML = cards + '<button class="btn w100" data-action="addAsset">' + ico('plus', 'sm') + ' Thêm kênh mới</button>';
  }

  function renderPlan() {
    const el = $('#tab-plan');
    if (!S.assets.length) { el.innerHTML = noAssetsCard(); return; }
    const ts = SUM.targetSum, tsOK = Math.abs(ts - 100) <= 0.5;
    const trows = SUM.assets.map((a) => '<div class="trow"><span class="dot" style="background:' + colorOf(a.code) + '"></span><span class="nm">' + esc(a.name) + '</span>' +
      '<input class="tinput" data-code="' + esc(a.code) + '" inputmode="decimal" value="' + (a.targetPct || '') + '" placeholder="0"><span>%</span></div>').join('');
    el.innerHTML =
      '<div class="card"><h3>Chia tiền tiết kiệm tháng tới</h3>' +
      '<div class="row" style="margin-top:4px">' +
      '<button class="btn sm" data-action="setPlanAmt" data-amt="3500000">3,5 triệu</button>' +
      '<button class="btn sm" data-action="setPlanAmt" data-amt="3750000">3,75 triệu</button>' +
      '<button class="btn sm" data-action="setPlanAmt" data-amt="4000000">4,0 triệu</button></div>' +
      '<label for="planAmount">Ngân sách tháng này (₫)</label>' +
      '<input id="planAmount" inputmode="numeric" placeholder="3.750.000" value="' + (S.monthlyContribution ? fmt(S.monthlyContribution) : '') + '">' +
      '<div id="planResult"></div>' +
      '<div class="cheer-banner" style="margin-top:12px;background:#eff6ff;border-color:#bfdbfe;color:#1e40af;font-weight:600">Chiến lược cuối năm: Rút ~12,6tr từ DCBF mua nốt 0,9 chỉ vàng 9999 · Giữ lại 10tr đệm an toàn.</div></div>' +
      '<details class="card"><summary>Chỉnh mục tiêu Năm 1 (' + pct(ts, 0) + ' · ' + shortVnd(S.goal.amount || 50000000) + ')</summary>' +
      '<div style="margin-top:8px">' + trows + '</div>' +
      (!tsOK && ts > 0 ? '<button class="btn sm w100" data-action="normalizeTargets">Chuẩn hóa về 100%</button>' : '') +
      '<label for="goalAmount">Mục tiêu tổng quỹ (₫)</label><input id="goalAmount" inputmode="numeric" value="' + (S.goal.amount ? fmt(S.goal.amount) : '') + '">' +
      '<label for="goalDeadline">Hạn hoàn thành</label><input id="goalDeadline" type="date" value="' + esc(S.goal.deadline || '') + '">' +
      '<button class="btn primary w100" data-action="saveGoal">Lưu mục tiêu</button></details>';
    updatePlanResult();
  }

  function updatePlanResult() {
    const box = $('#planResult');
    if (!box) return;
    const amt = R.toNumber(($('#planAmount') || {}).value);
    const plan = amt > 0 ? R.planContribution(SUM, amt, 1000, { dcbfTransit: S.settings.dcbfTransit !== false }) : null;
    lastPlan = plan && plan.ok ? plan : null;
    if (!plan || !plan.ok) { box.innerHTML = ''; return; }
    box.innerHTML = '<div class="plan-cards">' +
      plan.rows.map((r) => {
        const a = S.assets.find((x) => x.code === r.code) || { kind: 'fund', code: r.code };
        const buy = r.alloc > 0;
        const subHint = r.code === 'DCBF' && buy
          ? 'Đệm 20% + Trạm gom mua 0,9 chỉ vàng'
          : ('Tỷ trọng lên ' + pct(r.afterPct) + ' / mục tiêu ' + pct(r.targetPct, 0));
        return '<div class="pcard ' + (buy ? 'active-buy' : '') + '">' +
          '<div class="pcard-left"><div class="asset-ico" style="width:36px;height:36px;background:' + iconBgOf(a) + ';color:' + iconFgOf(a) + '">' + iconOf(a, 'sm') + '</div>' +
          '<div><div class="pcard-name">' + esc(r.name) + '</div>' +
          '<div class="pcard-sub">' + esc(subHint) + '</div></div></div>' +
          '<div class="pcard-amt ' + (buy ? '' : 'zero') + '">' + (buy ? '+' + money(r.alloc) : 'Tạm ngưng') + '</div></div>';
      }).join('') + '</div>' +
      '<button class="btn primary w100" data-action="createPlanOrders">Ghi lệnh góp tháng này vào danh mục</button>';
  }

  /* ---------- Gemini & AI Tab (Tinh gọn) ---------- */
  function initGemini() {
    $('#tab-gemini').innerHTML =
      '<div class="card">' +
      '<h3>Báo giao dịch / Hỏi Cố vấn AI</h3>' +
      '<textarea id="aiQuickInput" style="min-height:74px" placeholder="VD: Lệnh DCBF 200k đã khớp 6,46 CCQ; tháng 12 có 3,8 triệu chia sao..."></textarea>' +
      '<button class="btn primary w100" id="runAiBtn" data-action="runAiDirect">' + ico('sparkle', 'sm') + ' Gửi AI & Tự cập nhật</button>' +
      '<div id="aiDirectOutput"></div></div>' +

      '<div class="card"><h3>Đồng bộ với chat Gemini “Hưu trí”</h3>' +
      '<div class="btn-col">' +
      '<a id="openGemini" class="btn gold" target="_blank" rel="noopener">Mở chat Gemini “Hưu trí” ' + ico('ext', 'sm') + '</a>' +
      '<div class="row" style="margin-top:0">' +
      '<button class="btn sm" data-action="copyPrompt" data-kind="price">' + ico('copy', 'sm') + ' Bản tin giá 9h sáng</button>' +
      '<button class="btn sm" data-action="copyReport">' + ico('copy', 'sm') + ' Copy Báo cáo</button></div></div>' +
      '<label for="pasteBox">Dán JSON từ Gemini vào đây</label>' +
      '<textarea id="pasteBox" style="min-height:74px" placeholder="Dán khối ```json ... ``` của Gemini vào đây"></textarea>' +
      '<div class="row"><button class="btn sm" data-action="pasteClipboard">Dán nhanh</button><button class="btn sm ghost" data-action="clearPaste">Xóa</button></div>' +
      '<select id="importMode" class="hidden"><option value="merge" selected>Gộp</option><option value="replace">Thay thế</option></select>' +
      '<div id="importPreview"></div></div>' +

      '<details class="card"><summary>Cài đặt API Key & Sao lưu dữ liệu</summary>' +
      '<label for="aiProviderSelect">Bộ não AI trực tiếp</label>' +
      '<select id="aiProviderSelect"><option value="gemini">Google Gemini API (gemini-2.5-flash)</option><option value="openai">OpenAI ChatGPT API (gpt-4o-mini)</option></select>' +
      '<label for="geminiKeyInput">Gemini API Key</label><input id="geminiKeyInput" type="password" placeholder="AIzaSy..." autocomplete="off">' +
      '<label for="openaiKeyInput">OpenAI API Key</label><input id="openaiKeyInput" type="password" placeholder="sk-..." autocomplete="off">' +
      '<button class="btn sm primary w100" data-action="saveApiKeys">Lưu API Key</button>' +
      '<label for="geminiUrl">Link chat Gemini “Hưu trí”</label>' +
      '<div class="row"><input id="geminiUrl" inputmode="url"><button class="btn sm" style="flex:0 0 auto" data-action="saveGeminiUrl">Lưu</button></div>' +
      '<div class="btn-col"><button class="btn sm" data-action="downloadBackup">Tải file sao lưu (.json)</button>' +
      '<label class="btn sm" style="margin:0;cursor:pointer">Khôi phục từ file<input type="file" id="restoreFile" accept=".json,application/json" style="display:none"></label>' +
      '<button class="btn sm" data-action="loadSeedPortfolio">Khôi phục dữ liệu chuẩn 18/11/2026</button></div></details>';

    $('#pasteBox').addEventListener('input', debounce(previewImport, 250));
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
      outBox.innerHTML = '<div class="preview err">Chưa có API Key trong mục <b>Cài đặt API Key</b>. Mình đã copy sẵn nội dung — bạn chỉ cần bấm <b>Mở chat Gemini “Hưu trí”</b> rồi dán vào nhé!</div>';
      await copyText(R.buildReport(S, today()) + userText);
      return;
    }

    const sysPrompt = [
      'Bạn là Cố vấn Quản lý Quỹ Hưu Trí Tự Động theo chiến lược "Kiềng 3 Chân" (Mục tiêu 50.000.000 VND hạn 2027-10-06):',
      '- DCDS (Quỹ cổ phiếu Dragon Capital): mục tiêu 52% (~26tr). Ưu tiên gom khi NAV điều chỉnh giảm.',
      '- GOLD (Vàng 24K ép vỉ / nhẫn 9999): mục tiêu 28% (~14tr = 1 chỉ). Hiện đã giải ngân 7.072.000đ (92,2%) nên TẠM DỪNG mua vàng bằng tiền mặt hàng tháng; chỉ mua khi săn được thẻ 1 phân 0đ tiền công.',
      '- DCBF (Quỹ trái phiếu Dragon Capital): mục tiêu giữ lại 20% (~10tr) + làm trạm trung chuyển hưởng lãi kép 7,5-8,5%/năm. Mỗi tháng (ngân sách 3,5-4tr) chia ~2,15tr vào DCDS và ~1,75-1,85tr vào DCBF; cuối năm rút ~12,6tr từ DCBF mua nốt 0,9 chỉ vàng.',
      'Hôm nay là ' + today() + '. Danh mục hiện tại:',
      JSON.stringify(R.toExport(S, today()), null, 2),
      'Hãy trả lời ngắn gọn, truyền động lực (dưới 80 từ) và nếu có giao dịch/khớp lệnh/giá mới thì BẮT BUỘC kèm khối ```json theo schema:',
      '{ "asOf": "' + today() + '", "transactions": [ { "asset": "GOLD|DCDS|DCBF", "date": "YYYY-MM-DD", "amount": 0, "units": null, "status": "done|pending", "note": "" } ], "prices": [ { "asset": "GOLD|DCDS|DCBF", "price": 0, "source": "" } ] }'
    ].join('\n');

    btn.disabled = true; btn.textContent = 'Đang phân tích...';
    outBox.innerHTML = '';

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
            messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: userText }]
          })
        });
        const j = await res.json();
        if (!res.ok) throw new Error((j.error && j.error.message) || ('Lỗi HTTP ' + res.status));
        replyText = (((j.choices || [])[0] || {}).message || {}).content || '';
      }

      const cleanAdvice = replyText.replace(/```(?:json)?[\s\S]*?```/gi, '').trim();
      outBox.innerHTML = '<div class="preview" style="white-space:pre-wrap">' + esc(cleanAdvice || 'Đã trích xuất dữ liệu bên dưới.') + '</div>';

      const ex = R.extractJSON(replyText);
      if (ex.ok) {
        $('#pasteBox').value = replyText;
        previewImport();
        toast('Bấm “Áp dụng” bên dưới để lưu!');
      }
    } catch (err) {
      outBox.innerHTML = '<div class="preview err">' + esc(err.message || String(err)) + '</div>';
    } finally {
      btn.disabled = false; btn.innerHTML = ico('sparkle', 'sm') + ' Gửi AI & Tự cập nhật';
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
    if (data.__retireBackup && data.state && Array.isArray(data.state.assets)) {
      const d = R.defaultState();
      const st = Object.assign(d, data.state, { goal: Object.assign(d.goal, data.state.goal || {}), settings: Object.assign(d.settings, data.state.settings || {}) });
      pendingImport = { type: 'restore', state: st };
      box.innerHTML = '<div class="preview">File sao lưu (' + st.transactions.length + ' lệnh)<button class="btn primary w100" data-action="applyImport">Khôi phục ngay</button></div>';
      return;
    }
    const res = R.mergeImport(S, data, { mode: ($('#importMode') || {}).value || 'merge', today: today() });
    if (!res.ok) { box.innerHTML = '<div class="preview err">' + esc(res.error) + '</div>'; return; }
    pendingImport = { type: 'merge', state: res.state };
    const s = res.summary, items = [];
    if (s.newAssets) items.push('+' + s.newAssets + ' kênh mới');
    if (s.newTx) items.push('+' + s.newTx + ' giao dịch mới');
    if (s.updatedTx) items.push('Cập nhật ' + s.updatedTx + ' giao dịch');
    if (s.priceUpdates) items.push('Cập nhật ' + s.priceUpdates + ' mức giá');
    const nothing = !items.length && !s.updatedAssets && !s.goal && !s.contribution;
    box.innerHTML = '<div class="preview">' + (nothing ? 'Dữ liệu đã khớp sẵn trong App.' : (items.join(' · ') || 'Sẵn sàng cập nhật') + '<button class="btn primary w100" data-action="applyImport">Áp dụng ngay</button>') + '</div>';
  }

  /* ---------- Form ---------- */
  function openAssetForm(code) {
    const a = code ? S.assets.find((x) => x.code === code) : null;
    const kinds = Object.keys(R.KIND_LABEL).map((k) => '<option value="' + k + '"' + (a && a.kind === k ? ' selected' : '') + '>' + R.KIND_LABEL[k] + '</option>').join('');
    openModal(a ? 'Sửa kênh tài sản' : 'Thêm kênh tài sản',
      '<label>Tên kênh</label><input name="name" required value="' + esc(a ? a.name : '') + '" placeholder="VD: Vàng 24K">' +
      '<label>Mã viết tắt</label><input name="code" ' + (a ? 'readonly' : '') + ' value="' + esc(a ? a.code : '') + '" placeholder="VD: GOLD" autocapitalize="characters">' +
      '<label>Loại</label><select name="kind">' + kinds + '</select>' +
      '<label>Đơn vị</label><input name="unit" value="' + esc(a ? a.unit : '') + '" placeholder="chỉ / CCQ">' +
      '<label>Tỷ trọng mục tiêu (%)</label><input name="targetPct" inputmode="decimal" value="' + (a && a.targetPct ? a.targetPct : '') + '" placeholder="28">' +
      '<button class="btn primary w100" type="submit">Lưu</button>' +
      (a ? '<button type="button" class="btn danger w100" data-action="deleteAsset" data-code="' + esc(a.code) + '">Xóa kênh này</button>' : ''),
      {
        onSubmit(fd) {
          const name = (fd.name || '').trim();
          if (!name) { toast('Hãy nhập tên'); return false; }
          const tp = R.toNumber(fd.targetPct, { decimal: true });
          if (a) {
            a.name = name; a.kind = R.normKind(fd.kind); a.unit = (fd.unit || '').trim() || R.DEFAULT_UNIT[a.kind]; a.targetPct = tp || 0;
          } else {
            const c = R.normCode(fd.code || name);
            if (!c || S.assets.some((x) => x.code === c)) { toast('Mã không hợp lệ hoặc đã có'); return false; }
            S.assets.push(R.makeAsset({ code: c, name: name, kind: fd.kind, unit: (fd.unit || '').trim(), targetPct: tp || 0 }));
          }
          commit(); toast('Đã lưu');
        }
      });
  }

  function openTxForm(code, id) {
    const t = id ? S.transactions.find((x) => x.id === id) : null;
    const ac = t ? t.assetCode : code;
    const assetObj = S.assets.find((a) => a.code === ac);
    const unitLbl = assetObj ? assetObj.unit : 'đơn vị';
    const estUnits = (t && assetObj && assetObj.price > 0) ? +(t.amount / assetObj.price).toFixed(3) : null;
    const opts = S.assets.map((a) => '<option value="' + esc(a.code) + '"' + (a.code === ac ? ' selected' : '') + '>' + esc(a.name) + '</option>').join('');
    openModal(t ? 'Chi tiết giao dịch' : 'Ghi giao dịch mới',
      '<label>Kênh tài sản</label><select name="asset">' + opts + '</select>' +
      '<label>Ngày</label><input type="date" name="date" value="' + (t ? esc(t.date) : today()) + '">' +
      '<label>Số tiền (₫)</label><input name="amount" inputmode="numeric" value="' + (t ? fmt(t.amount) : '') + '" placeholder="1.400.000">' +
      '<label>Số lượng (' + esc(unitLbl) + ')</label>' +
      '<input id="txUnitsInput" name="units" inputmode="decimal" value="' + (t && t.units != null ? String(t.units).replace('.', ',') : '') + '" placeholder="VD: 0,2 hoặc 4,34">' +
      (estUnits ? '<button type="button" class="btn sm w100" onclick="document.getElementById(\'txUnitsInput\').value=\'' + String(estUnits).replace('.', ',') + '\'">Điền nhanh ~' + String(estUnits).replace('.', ',') + ' ' + esc(unitLbl) + '</button>' : '') +
      '<label>Trạng thái</label><select name="status"><option value="done"' + (t && t.status === 'pending' ? '' : ' selected') + '>Đã khớp</option><option value="pending"' + (t && t.status === 'pending' ? ' selected' : '') + '>Chờ khớp</option></select>' +
      '<label>Ghi chú</label><input name="note" value="' + esc(t ? t.note : '') + '" placeholder="VD: Huy Thanh Jewelry">' +
      '<button class="btn primary w100" type="submit">Lưu</button>' +
      (t ? '<button type="button" class="btn danger w100" data-action="deleteTx" data-id="' + esc(t.id) + '">Xóa lệnh này</button>' : ''),
      {
        onSubmit(fd) {
          const amount = R.toNumber(fd.amount);
          if (!(amount > 0)) { toast('Hãy nhập số tiền'); return false; }
          let units = R.toNumber(fd.units, { decimal: true });
          if (units !== null && units <= 0) units = null;
          const rec = { assetCode: fd.asset, date: fd.date || today(), amount: Math.round(amount), units: units, status: fd.status === 'pending' ? 'pending' : 'done', note: (fd.note || '').trim() };
          if (t) Object.assign(t, rec); else S.transactions.push(Object.assign({ id: R.uid() }, rec));
          commit(); toast('Đã lưu');
        }
      });
  }

  function openPriceForm(code) {
    const a = S.assets.find((x) => x.code === code); if (!a) return;
    openModal('Giá hôm nay — ' + a.name,
      '<label>Giá 1 ' + esc(a.unit) + ' (₫)</label><input name="price" inputmode="decimal" value="' + (a.price && a.valueBasis === 'price' ? String(a.price).replace('.', ',') : '') + '" placeholder="VD: 13.350.000">' +
      '<label>Hoặc nhập thẳng tổng giá trị hiện tại của kênh này (₫)</label><input name="total" inputmode="numeric" value="' + (a.marketValue && a.valueBasis === 'manual' ? fmt(a.marketValue) : '') + '" placeholder="VD: 7.200.000">' +
      '<button class="btn primary w100" type="submit">Cập nhật</button>',
      {
        onSubmit(fd) {
          const price = R.toNumber(fd.price, { decimal: true }), total = R.toNumber(fd.total);
          if (price > 0) { a.price = price; a.priceAsOf = today(); a.priceSource = 'Cập nhật thủ công'; a.valueBasis = 'price'; }
          else if (total >= 0 && total !== null) { a.marketValue = total; a.valueAsOf = today(); a.valueBasis = 'manual'; }
          else { toast('Hãy nhập 1 trong 2 ô'); return false; }
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
      if (!confirm('Xóa kênh này?')) return;
      S.assets = S.assets.filter((x) => x.code !== d.code);
      S.transactions = S.transactions.filter((t) => t.assetCode !== d.code);
      closeModal(); commit(); toast('Đã xóa');
    },
    addTx: (d) => openTxForm(d.code),
    editTx: (d) => openTxForm(null, d.id),
    deleteTx: (d) => {
      if (!confirm('Xóa lệnh này?')) return;
      S.transactions = S.transactions.filter((t) => t.id !== d.id);
      closeModal(); commit(); toast('Đã xóa');
    },
    fillTx: (d, e) => {
      e.stopPropagation();
      const t = S.transactions.find((x) => x.id === d.id); if (!t) return;
      t.status = 'done';
      const a = S.assets.find((x) => x.code === t.assetCode);
      if (t.units == null && a && a.price > 0) t.units = +(t.amount / a.price).toFixed(2);
      commit(); toast('Đã khớp lệnh!');
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
      commit(); toast('Đã chuẩn hóa 100%');
    },
    saveGoal: () => {
      const amt = R.toNumber($('#goalAmount').value), dl = $('#goalDeadline').value || null;
      S.goal.amount = amt > 0 ? amt : null; S.goal.deadline = dl;
      commit(); toast('Đã lưu mục tiêu');
    },
    createPlanOrders: () => {
      if (!lastPlan) return;
      const rows = lastPlan.rows.filter((r) => r.alloc > 0);
      if (!rows.length) return;
      if (!confirm('Ghi ' + rows.length + ' lệnh góp tháng này (' + fmt(lastPlan.total) + ' ₫)?')) return;
      rows.forEach((r) => S.transactions.push({ id: R.uid(), assetCode: r.code, date: today(), amount: r.alloc, units: null, status: 'pending', note: 'Góp định kỳ tháng' }));
      commit(); goTab('portfolio'); toast('Đã ghi lệnh tháng mới');
    },
    copyPrompt: async (d) => {
      const ok = await copyText(R.buildPrompt(d.kind, S, today()));
      toast(ok ? 'Đã copy — dán vào Gemini nhé!' : 'Không copy được');
    },
    pasteClipboard: async () => {
      try { const t = await navigator.clipboard.readText(); $('#pasteBox').value = t; previewImport(); }
      catch (e) { toast('Hãy chạm giữ vào ô và chọn Dán'); }
    },
    clearPaste: () => { $('#pasteBox').value = ''; previewImport(); },
    applyImport: () => {
      if (!pendingImport) return;
      S = pendingImport.state; S.lastSync = new Date().toISOString();
      pendingImport = null; $('#pasteBox').value = ''; $('#importPreview').innerHTML = '';
      commit(); goTab('overview'); toast('Đã cập nhật danh mục');
    },
    copyReport: async () => {
      const ok = await copyText(R.buildReport(S, today()));
      toast(ok ? 'Đã copy báo cáo' : 'Không copy được');
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
      save(); toast('Đã lưu API Key');
    },
    runAiDirect: () => {
      const txt = (($('#aiQuickInput') || {}).value || '').trim();
      if (!txt) { toast('Hãy nhập nội dung trước'); return; }
      callDirectAI(txt);
    },
    loadSeedPortfolio: () => {
      if (S.assets.length && !confirm('Khôi phục dữ liệu chuẩn ngày 18/11/2026?')) return;
      const keepSettings = S.settings;
      S = R.initialPortfolioState();
      S.settings = Object.assign(S.settings, keepSettings);
      save(); renderAll(); goTab('overview'); toast('Đã nạp dữ liệu 18/11/2026');
    },
    downloadBackup: () => {
      const blob = new Blob([JSON.stringify({ __retireBackup: 1, exportedAt: new Date().toISOString(), state: S }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'quy-huu-tri-' + today() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
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
      if (v !== null && (v < 0 || v > 100)) { renderPlan(); return; }
      a.targetPct = v || 0; commit();
    }
  });

  initGemini();
  renderAll();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
