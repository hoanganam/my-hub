/* app.js — Quỹ Hưu Trí "Kiềng 3 Chân" (Trang Tổng Quan Duy Nhất · Tín hiệu MUA / KHÔNG MUA rõ ràng). */
(function () {
  'use strict';
  const R = window.Retire;
  const MASK_KEY = 'retire_mask_v1';
  const COLORS = ['#f59e0b', '#10b981', '#3b82f6'];

  const PATHS = {
    check: '<polyline points="20 6 9 17 4 12"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'
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

    // Bảng Tín hiệu Cố vấn: MUA / KHÔNG MUA rõ từng kênh
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
        '<div class="brief-head"><div class="brief-title">' + ico('bell', 'sm') + ' <span>Hôm nay Mua gì · Ngưng gì?</span></div>' +
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

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action="toggleMask"]');
    if (!el) return;
    S.settings.mask = !S.settings.mask;
    try { localStorage.setItem(MASK_KEY, S.settings.mask ? '1' : '0'); } catch (err) {}
    renderOverview();
  });

  renderOverview();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
