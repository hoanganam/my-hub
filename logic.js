/* logic.js — Quỹ Hưu Trí "Kiềng 3 Chân": logic thuần (không đụng DOM).
 * Chạy được cả trên trình duyệt (window.Retire) lẫn Node (module.exports) để test. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Retire = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const KIND_LABEL = { gold: 'Vàng', fund: 'Quỹ', stock: 'Cổ phiếu', cash: 'Tiền mặt', other: 'Khác' };
  const DEFAULT_UNIT = { gold: 'chỉ', fund: 'CCQ', stock: 'cp', cash: '₫', other: 'đơn vị' };

  const isNum = (x) => typeof x === 'number' && isFinite(x);
  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const uid = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const str = (v) => (v === undefined || v === null ? '' : String(v).trim());

  function pick(o) {
    for (let i = 1; i < arguments.length; i++) {
      const k = arguments[i];
      if (o && o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
    }
    return undefined;
  }

  function emptyState() {
    return {
      version: 6,
      goal: { amount: null, deadline: null },
      monthlyContribution: null,
      assets: [],
      transactions: [],
      snapshots: [],
      advisorBriefing: null,
      settings: { mask: false, dcbfTransit: true },
      lastSync: null
    };
  }

  // Nguồn dữ liệu chính thức trên App (được Antigravity cập nhật định kỳ & khi bạn nhắn)
  function initialPortfolioState() {
    const s = emptyState();
    s.goal = { amount: 50000000, deadline: '2027-10-06' };
    s.monthlyContribution = 3750000;
    s.advisorBriefing = {
      updatedAt: '26/11/2026',
      headline: 'Hôm nay (26/11): VN-Index điều chỉnh mạnh về ~1.629 điểm kéo NAV DCDS chiết khấu về ~89.569 ₫/CCQ. Vì bạn mới có 400k ở DCDS (5,2%) nên hầu như không thiệt hại mà lại được MUA GIÁ RẺ cho kỳ lương tháng 12!',
      signals: [
        {
          code: 'DCDS',
          name: 'Quỹ cổ phiếu DCDS',
          action: 'buy',
          badge: 'CƠ HỘI GOM GIÁ CHIẾT KHẤU',
          reason: 'Thị trường chung giảm mạnh giúp NAV lùi về <b>~89.569 ₫/CCQ</b> (rẻ hơn mức 92.133 ₫ đầu tháng). Bạn mới giữ <b>400k (5,2%)</b> nên rất lợi thế: kỳ lương tháng 12 rót <b>~2.150.000 ₫</b> sẽ gom được nhiều CCQ giá rẻ hơn.'
        },
        {
          code: 'DCBF',
          name: 'Quỹ trái phiếu DCBF',
          action: 'hold',
          badge: 'TĂNG ỔN ĐỊNH · MUA ĐỀU',
          reason: 'Bất chấp chứng khoán đỏ lửa, trái phiếu DCBF vẫn tăng đều lên <b>~30.983 – 31.000 ₫/CCQ</b> (+6,8% từ đầu năm). Tháng 12 tiếp tục nạp <b>~1.750.000 – 1.850.000 ₫</b> làm đệm an toàn.'
        },
        {
          code: 'GOLD',
          name: 'Vàng 24K / Nhẫn 9999',
          action: 'stop',
          badge: 'KHÔNG MUA THÊM',
          reason: 'Giá nhẫn 9999 SJC tăng lên mức mua vào <b>12.950.000 ₫/chỉ</b> · bán ra <b>13.400.000 ₫/chỉ</b> (đang neo đỉnh cao và chiếm <b>92,2%</b> vốn). Tiếp tục giữ vàng hiện có làm khiên chắn, ngưng mua tiền mặt.'
        }
      ]
    };
    s.assets = [
      Object.assign(makeAsset({
        code: 'GOLD',
        name: 'Vàng (24K ép vỉ / 9999)',
        kind: 'gold',
        unit: 'chỉ',
        targetPct: 28
      }), {
        price: 12950000,
        priceAsOf: '2026-11-26',
        priceSource: 'Giá mua vào vàng nhẫn 9999 SJC ngày 26/11/2026 (bán ra ~13,40tr/chỉ)',
        valueBasis: 'price'
      }),
      Object.assign(makeAsset({
        code: 'DCDS',
        name: 'Quỹ cổ phiếu DCDS',
        kind: 'fund',
        unit: 'CCQ',
        targetPct: 52
      }), {
        price: 89568.86,
        priceAsOf: '2026-11-26',
        priceSource: 'NAV/CCQ DCDS Dragon Capital cập nhật 26/11/2026 (chiết khấu theo nhịp chỉnh VN-Index)',
        valueBasis: 'price'
      }),
      Object.assign(makeAsset({
        code: 'DCBF',
        name: 'Quỹ trái phiếu DCBF',
        kind: 'fund',
        unit: 'CCQ',
        targetPct: 20
      }), {
        price: 30982.76,
        priceAsOf: '2026-11-26',
        priceSource: 'NAV/CCQ DCBF Dragon Capital cập nhật 26/11/2026 (tăng ổn định ~6,8% YTD)',
        valueBasis: 'price'
      })
    ];
    s.transactions = [
      {
        id: 'tx_gold_261006',
        assetCode: 'GOLD',
        date: '2026-10-06',
        amount: 2860000,
        units: null,
        status: 'done',
        note: 'Đơn Huy Thanh 06/10 (mã 261006-HT27-251650, x3 sản phẩm)'
      },
      {
        id: 'tx_gold_261106',
        assetCode: 'GOLD',
        date: '2026-11-06',
        amount: 2812000,
        units: null,
        status: 'done',
        note: 'Đơn Huy Thanh 06/11 (mã 261106-HT27-288684, x4 sản phẩm)'
      },
      {
        id: 'tx_gold_261115',
        assetCode: 'GOLD',
        date: '2026-11-15',
        amount: 1400000,
        units: 0.1,
        status: 'done',
        note: 'Miếng vàng 0,1 chỉ mới mua'
      },
      {
        id: 'tx_dcds_261107',
        assetCode: 'DCDS',
        date: '2026-11-07',
        amount: 400000,
        units: null,
        status: 'done',
        note: 'Lệnh mua đầu tiên'
      },
      {
        id: 'tx_dcbf_261117',
        assetCode: 'DCBF',
        date: '2026-11-17',
        amount: 200000,
        units: null,
        status: 'pending',
        note: 'Mã lệnh 261117002955 (phiên khớp 19/11/2026 — chờ nhập số CCQ thực nhận)'
      }
    ];
    s.snapshots = [
      { d: '2026-10-06', v: 2860000, c: 2860000 },
      { d: '2026-11-06', v: 5672000, c: 5672000 },
      { d: '2026-11-07', v: 6072000, c: 6072000 },
      { d: '2026-11-15', v: 7472000, c: 7472000 },
      { d: '2026-11-18', v: 7607000, c: 7672000 },
      { d: '2026-11-22', v: 7555000, c: 7672000 }
    ];
    s.lastSync = '2026-11-22T21:22:00.000Z';
    return s;
  }

  function defaultState() {
    return emptyState();
  }

  /* ---------- Chuẩn hóa dữ liệu đầu vào ---------- */

  function toNumber(v, opts) {
    const decimal = !!(opts && opts.decimal);
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number') return isFinite(v) ? v : null;
    let s = String(v).trim().toLowerCase();
    if (!s) return null;
    let mult = 1;
    if (/(tỷ|ty)\b/.test(s)) mult = 1e9;
    else if (/(triệu|trieu|tr)\b/.test(s)) mult = 1e6;
    else if (/(nghìn|nghin|ngàn|ngan|k)\b/.test(s)) mult = 1e3;
    s = s.replace(/[^0-9,.\-]/g, '');
    if (!s || s === '-' || !/\d/.test(s)) return null;
    const hasDot = s.indexOf('.') >= 0;
    const hasComma = s.indexOf(',') >= 0;
    if (hasDot && hasComma) {
      if (s.lastIndexOf('.') > s.lastIndexOf(',')) s = s.replace(/,/g, '');
      else s = s.replace(/\./g, '').replace(',', '.');
    } else if (hasDot) {
      const groups = /^-?\d{1,3}(\.\d{3})+$/.test(s) && !/^-?0\./.test(s);
      if (groups && !(decimal && (s.match(/\./g) || []).length === 1)) s = s.replace(/\./g, '');
    } else if (hasComma) {
      const groups = /^-?\d{1,3}(,\d{3})+$/.test(s) && !/^-?0,/.test(s);
      if (groups && !(decimal && (s.match(/,/g) || []).length === 1)) s = s.replace(/,/g, '');
      else s = s.replace(',', '.');
    }
    const n = parseFloat(s);
    return isFinite(n) ? n * mult : null;
  }

  function toISODate(v, fallbackYear) {
    if (!v) return null;
    const s = String(v).trim();
    const pad = (n) => String(n).padStart(2, '0');
    let y, m, d, mt;
    if ((mt = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) { y = +mt[1]; m = +mt[2]; d = +mt[3]; }
    else if ((mt = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/))) { d = +mt[1]; m = +mt[2]; y = +mt[3]; }
    else if ((mt = s.match(/^(\d{1,2})[\/\-.](\d{1,2})$/)) && fallbackYear) { d = +mt[1]; m = +mt[2]; y = +fallbackYear; }
    else return null;
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    const dt = new Date(y, m - 1, d);
    if (dt.getMonth() !== m - 1) return null;
    return y + '-' + pad(m) + '-' + pad(d);
  }

  function normCode(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd')
      .toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 12);
  }

  function normStatus(v) {
    if (v === undefined || v === null) return 'done';
    const s = String(v).toLowerCase();
    return /pend|chờ|cho khop|^cho$|wait|open|queued|đặt lệnh|dat lenh/.test(s) ? 'pending' : 'done';
  }

  function normKind(v) {
    const s = String(v || '').toLowerCase();
    if (KIND_LABEL[s]) return s;
    if (/vàng|vang|gold/.test(s)) return 'gold';
    if (/quỹ|quy |fund|ccq|etf/.test(s)) return 'fund';
    if (/cổ phiếu|co phieu|stock|equity|share/.test(s)) return 'stock';
    if (/tiền|tien|cash|gửi|deposit|savings|tiết kiệm/.test(s)) return 'cash';
    return 'other';
  }

  function makeAsset(p) {
    const kind = normKind(p.kind);
    return {
      code: p.code,
      name: p.name || p.code,
      kind: kind,
      unit: p.unit || DEFAULT_UNIT[kind],
      targetPct: isNum(p.targetPct) ? p.targetPct : 0,
      price: null, priceAsOf: null, priceSource: null,
      marketValue: null, valueAsOf: null,
      valueBasis: null
    };
  }

  /* ---------- Định giá & tổng hợp ---------- */

  function valueAsset(asset, txs) {
    const mine = txs.filter((t) => t.assetCode === asset.code);
    const done = mine.filter((t) => t.status !== 'pending');
    const pend = mine.filter((t) => t.status === 'pending');
    const cost = sum(done, (t) => t.amount);
    const pending = sum(pend, (t) => t.amount);
    const committedCost = cost + pending;
    const doneWithUnits = done.filter((t) => isNum(t.units) && t.units > 0);
    const doneWithoutUnits = done.filter((t) => !(isNum(t.units) && t.units > 0));
    const units = sum(doneWithUnits, (t) => t.units);
    const unitsComplete = done.length > 0 && doneWithoutUnits.length === 0;
    const priceOK = asset.valueBasis === 'price' && isNum(asset.price) && asset.price > 0;

    let value = cost, source = 'cost', asOf = null, note = null;
    if (priceOK && unitsComplete) {
      value = Math.round(units * asset.price);
      source = 'price';
      asOf = asset.priceAsOf;
    } else if (isNum(asset.marketValue) && asset.valueBasis === 'manual') {
      value = asset.marketValue;
      source = 'manual';
      asOf = asset.valueAsOf;
      if (priceOK && !unitsComplete) note = 'units-incomplete';
    } else if (priceOK && doneWithUnits.length > 0) {
      value = Math.round(sum(doneWithUnits, (t) => t.units * asset.price) + sum(doneWithoutUnits, (t) => t.amount));
      source = 'price';
      asOf = asset.priceAsOf;
      note = 'units-incomplete';
    } else if (isNum(asset.marketValue)) {
      value = asset.marketValue;
      source = 'manual';
      asOf = asset.valueAsOf;
      if (priceOK && !unitsComplete) note = 'units-incomplete';
    } else if (priceOK && !unitsComplete && done.length > 0) {
      note = 'units-incomplete';
    }
    const effectiveValue = value + pending;
    return {
      cost, pending, committedCost, units, unitsComplete,
      missingUnitsCount: doneWithoutUnits.length,
      value, effectiveValue, source, asOf, note,
      valued: source !== 'cost',
      pnl: value - cost,
      pnlPct: cost > 0 ? ((value - cost) / cost) * 100 : null,
      txCount: mine.length
    };
  }

  function summarize(state) {
    const rows = state.assets.map((a) => {
      const v = valueAsset(a, state.transactions);
      return Object.assign({
        code: a.code, name: a.name, kind: a.kind, unit: a.unit, targetPct: a.targetPct || 0,
        price: a.price, priceAsOf: a.priceAsOf, priceSource: a.priceSource,
        marketValue: a.marketValue, valueAsOf: a.valueAsOf
      }, v);
    });
    const totalValue = sum(rows, (r) => r.value);
    const totalCost = sum(rows, (r) => r.cost);
    const totalPending = sum(rows, (r) => r.pending);
    const totalCommitted = totalValue + totalPending;
    const totalCommittedCost = totalCost + totalPending;
    const denom = totalCommitted > 0 ? totalCommitted : totalValue;
    rows.forEach((r) => {
      r.currentPct = denom > 0 ? ((r.value + r.pending) / denom) * 100 : 0;
      r.driftPct = r.currentPct - r.targetPct;
    });
    return {
      assets: rows, totalValue, totalCost, totalPending, totalCommitted, totalCommittedCost,
      totalPnl: totalValue - totalCost,
      totalPnlPct: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : null,
      targetSum: sum(rows, (r) => r.targetPct),
      unvalued: rows.filter((r) => !r.valued && r.cost > 0).map((r) => r.code),
      incompleteUnits: rows.filter((r) => r.note === 'units-incomplete').map((r) => r.code)
    };
  }

  function planContribution(sm, contribution, step, opts) {
    if (typeof step === 'object' && step !== null) { opts = step; step = 1000; }
    step = step || 1000;
    opts = opts || {};
    const C = Math.max(0, Math.round(contribution || 0));
    const list = sm.assets.filter((a) => a.targetPct > 0);
    if (!list.length || C <= 0) return { rows: [], total: C, ok: false };
    const tSum = sum(list, (a) => a.targetPct);
    const eff = (a) => a.value + a.pending;
    const T = sum(list, eff) + C;

    const has3Pillar = opts.dcbfTransit && list.some((a) => a.code === 'DCDS') && list.some((a) => a.code === 'DCBF');
    const rows = list.map((a) => {
      const effTargetPct = has3Pillar
        ? (a.code === 'GOLD' ? 0 : a.code === 'DCDS' ? 53.75 : a.code === 'DCBF' ? 46.25 : a.targetPct)
        : a.targetPct;
      const desired = (T * effTargetPct) / (has3Pillar ? 100 : tSum);
      return {
        code: a.code, name: a.name, targetPct: a.targetPct, value: a.value, pending: a.pending,
        desired, need: has3Pillar ? (effTargetPct > 0 ? effTargetPct : 0) : Math.max(0, desired - eff(a))
      };
    });
    const needSum = sum(rows, (r) => r.need);
    const weights = needSum > 0 ? rows.map((r) => r.need / needSum) : rows.map((r) => r.targetPct / tSum);
    const roundStep = has3Pillar ? 50000 : step;
    const alloc = weights.map((w) => Math.floor((C * w) / roundStep) * roundStep);
    const rest = C - sum(alloc, (x) => x);
    let top = 0;
    weights.forEach((w, i) => { if (w > weights[top]) top = i; });
    alloc[top] += rest;
    rows.forEach((r, i) => {
      r.alloc = alloc[i];
      r.after = eff(list[i]) + alloc[i];
      r.afterPct = (r.after / T) * 100;
    });
    return { rows, total: C, ok: true, after: T };
  }

  function upsertSnapshot(state, today) {
    const sm = summarize(state);
    if (sm.totalCommitted <= 0 && sm.totalCommittedCost <= 0) return;
    const snaps = (state.snapshots = state.snapshots || []);
    const rec = { d: today, v: Math.round(sm.totalCommitted), c: Math.round(sm.totalCommittedCost) };
    const i = snaps.findIndex((s) => s.d === today);
    if (i >= 0) snaps[i] = rec; else snaps.push(rec);
    snaps.sort((a, b) => (a.d < b.d ? -1 : 1));
    if (snaps.length > 500) snaps.splice(0, snaps.length - 500);
  }

  function monthsBetween(fromISO, toISO) {
    const a = new Date(fromISO + 'T00:00:00'), b = new Date(toISO + 'T00:00:00');
    return (b - a) / 86400000 / 30.4375;
  }

  function extractJSON(text) {
    if (!text || !String(text).trim()) return { ok: false, error: 'Chưa có nội dung.' };
    const cands = [];
    const fence = /```(?:json)?\s*([\s\S]*?)```/gi;
    let m;
    while ((m = fence.exec(text))) cands.push(m[1]);
    const f = text.indexOf('{'), l = text.lastIndexOf('}');
    if (f >= 0 && l > f) cands.push(text.slice(f, l + 1));
    for (const c of cands) {
      const cleaned = c.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'")
        .replace(/,\s*([}\]])/g, '$1').trim();
      try {
        const d = JSON.parse(cleaned);
        if (d && typeof d === 'object') return { ok: true, data: d };
      } catch (e) {}
    }
    return { ok: false, error: 'Không tìm thấy khối JSON hợp lệ.' };
  }

  function mergeImport(state, data, opts) {
    opts = opts || {};
    const today = opts.today || new Date().toISOString().slice(0, 10);
    const mode = opts.mode === 'replace' ? 'replace' : 'merge';
    const next = clone(state);
    const sm = { newAssets: 0, updatedAssets: 0, newTx: 0, updatedTx: 0, skippedTx: 0, priceUpdates: 0, valueUpdates: 0, goal: false, contribution: false };
    const warnings = [];
    const known = ['assets', 'transactions', 'prices', 'values', 'goal', 'monthlyContribution'];
    if (!data || typeof data !== 'object' || !known.some((k) => data[k] !== undefined)) {
      return { ok: false, error: 'JSON không có mục nào (assets / transactions / prices …) để nhập.' };
    }
    const asOf = toISODate(pick(data, 'asOf', 'as_of', 'date')) || today;
    const yr = Number(asOf.slice(0, 4));
    const findAsset = (c) => next.assets.find((a) => a.code === c);
    const ensureAsset = (code, why) => {
      let a = findAsset(code);
      if (!a) {
        a = makeAsset({ code: code, name: code, kind: 'other' });
        next.assets.push(a); sm.newAssets++;
        warnings.push('Tự tạo tài sản "' + code + '" (' + why + ') — hãy kiểm tra tên/loại/tỷ trọng.');
      }
      return a;
    };

    (Array.isArray(data.assets) ? data.assets : []).forEach((x) => {
      let code = normCode(pick(x, 'code', 'asset', 'symbol', 'id'));
      const name = str(pick(x, 'name', 'label'));
      if (!code && name) code = normCode(name);
      if (!code) { warnings.push('Bỏ qua 1 tài sản không có mã.'); return; }
      let tp = toNumber(pick(x, 'targetPct', 'target', 'targetPercent', 'target_pct'));
      if (isNum(tp) && tp > 0 && tp < 1) { tp = tp * 100; warnings.push('Tỷ trọng mục tiêu của ' + code + ' <1 nên đã hiểu là phân số (×100).'); }
      if (isNum(tp) && (tp < 0 || tp > 100)) { warnings.push('Tỷ trọng mục tiêu của ' + code + ' không hợp lệ, bỏ qua.'); tp = null; }
      const existing = findAsset(code);
      if (existing) {
        if (name) existing.name = name;
        if (pick(x, 'kind', 'type')) existing.kind = normKind(pick(x, 'kind', 'type'));
        if (pick(x, 'unit')) existing.unit = str(pick(x, 'unit'));
        if (isNum(tp)) existing.targetPct = tp;
        sm.updatedAssets++;
      } else {
        next.assets.push(makeAsset({ code: code, name: name, kind: pick(x, 'kind', 'type'), unit: str(pick(x, 'unit')), targetPct: isNum(tp) ? tp : 0 }));
        sm.newAssets++;
      }
    });

    if (mode === 'replace' && Array.isArray(data.transactions)) next.transactions = [];
    const pool = next.transactions.slice();
    const matched = new Set();
    (Array.isArray(data.transactions) ? data.transactions : []).forEach((t) => {
      const code = normCode(pick(t, 'asset', 'assetCode', 'code'));
      const amount = toNumber(pick(t, 'amount', 'value', 'cost', 'vnd'));
      if (!code || !isNum(amount) || amount <= 0) { sm.skippedTx++; warnings.push('Bỏ qua 1 giao dịch thiếu mã tài sản hoặc số tiền.'); return; }
      let date = toISODate(pick(t, 'date', 'orderDate'), yr);
      if (!date) { date = asOf; warnings.push('Giao dịch ' + code + ' ' + Math.round(amount) + ' thiếu ngày — dùng ngày ' + asOf + '.'); }
      const status = normStatus(pick(t, 'status', 'state'));
      let units = toNumber(pick(t, 'units', 'quantity', 'qty'), { decimal: true });
      if (!isNum(units) || units <= 0) units = null;
      const note = str(pick(t, 'note', 'memo', 'description'));
      ensureAsset(code, 'có giao dịch nhưng chưa khai báo');
      const key = code + '|' + date + '|' + Math.round(amount);
      const ex = pool.find((p) => !matched.has(p) && p.assetCode + '|' + p.date + '|' + Math.round(p.amount) === key);
      if (ex && mode === 'merge') {
        matched.add(ex);
        let changed = false;
        if (ex.status === 'pending' && status === 'done') { ex.status = 'done'; changed = true; }
        if (units !== null && ex.units !== units) { ex.units = units; changed = true; }
        if (note && note !== ex.note) { ex.note = note; changed = true; }
        if (changed) sm.updatedTx++; else sm.skippedTx++;
      } else {
        next.transactions.push({ id: uid(), assetCode: code, date: date, amount: Math.round(amount), units: units, status: status, note: note });
        sm.newTx++;
      }
    });

    (Array.isArray(data.prices) ? data.prices : []).forEach((p) => {
      const code = normCode(pick(p, 'asset', 'assetCode', 'code'));
      const price = toNumber(pick(p, 'price', 'nav', 'value'), { decimal: true });
      if (!code || !isNum(price) || price <= 0) { warnings.push('Bỏ qua 1 mục giá không hợp lệ' + (code ? ' (' + code + ')' : '') + '.'); return; }
      const a = ensureAsset(code, 'có giá nhưng chưa khai báo');
      a.price = price;
      a.priceAsOf = toISODate(pick(p, 'asOf', 'date')) || asOf;
      a.priceSource = str(pick(p, 'source')) || null;
      a.valueBasis = 'price';
      sm.priceUpdates++;
    });

    (Array.isArray(data.values) ? data.values : []).forEach((v) => {
      const code = normCode(pick(v, 'asset', 'assetCode', 'code'));
      const mv = toNumber(pick(v, 'marketValue', 'value', 'amount'));
      if (!code || !isNum(mv) || mv < 0) { warnings.push('Bỏ qua 1 mục giá trị không hợp lệ.'); return; }
      const a = ensureAsset(code, 'có giá trị nhưng chưa khai báo');
      a.marketValue = mv;
      a.valueAsOf = toISODate(pick(v, 'asOf', 'date')) || asOf;
      a.valueBasis = 'manual';
      sm.valueUpdates++;
    });

    if (data.goal && typeof data.goal === 'object') {
      const amt = toNumber(pick(data.goal, 'amount', 'target'));
      const dl = toISODate(pick(data.goal, 'deadline', 'date'));
      if (isNum(amt) && amt > 0) { next.goal.amount = amt; sm.goal = true; }
      if (dl) { next.goal.deadline = dl; sm.goal = true; }
    }
    const mc = toNumber(data.monthlyContribution);
    if (isNum(mc) && mc > 0) { next.monthlyContribution = mc; sm.contribution = true; }

    const targets = next.assets.filter((a) => a.targetPct > 0);
    if (targets.length) {
      const ts = sum(targets, (a) => a.targetPct);
      if (Math.abs(ts - 100) > 0.5) warnings.push('Tổng tỷ trọng mục tiêu hiện là ' + ts.toFixed(1) + '% (nên bằng 100%).');
    }
    return { ok: true, state: next, summary: sm, warnings: warnings };
  }

  function toExport(state, today) {
    const prices = state.assets.filter((a) => isNum(a.price)).map((a) => ({ asset: a.code, price: a.price, source: a.priceSource || null }));
    const values = state.assets.filter((a) => isNum(a.marketValue) && a.valueBasis === 'manual').map((a) => ({ asset: a.code, marketValue: a.marketValue }));
    const out = {
      asOf: today,
      assets: state.assets.map((a) => ({ code: a.code, name: a.name, kind: a.kind, unit: a.unit, targetPct: a.targetPct })),
      transactions: state.transactions.slice().sort((x, y) => (x.date < y.date ? -1 : 1)).map((t) => ({
        asset: t.assetCode, date: t.date, amount: t.amount, units: t.units == null ? null : t.units, status: t.status, note: t.note || '' }))
    };
    if (prices.length) out.prices = prices;
    if (values.length) out.values = values;
    if (state.goal && (state.goal.amount || state.goal.deadline)) out.goal = { amount: state.goal.amount, deadline: state.goal.deadline };
    if (state.monthlyContribution) out.monthlyContribution = state.monthlyContribution;
    return out;
  }

  const fmtInt = (n) => Math.round(n).toLocaleString('vi-VN');
  const fmtPct = (n, d) => n.toFixed(d === undefined ? 1 : d).replace('.', ',');
  const dmy = (iso) => (iso ? iso.split('-').reverse().join('/') : '');

  function buildPrompt(kind, state, today) {
    const assets = state.assets || [];
    const list = assets.map((a) => '- ' + a.code + ' — ' + a.name + ' (đơn vị: ' + a.unit + ')').join('\n');
    if (kind === 'price') {
      return 'Tra cứu giá mới nhất cho: ' + list + ' và xuất ```json { "asOf": "' + (today || '') + '", "prices": [] }';
    }
    if (kind === 'tx') {
      return 'Chuyển giao dịch cho ' + list + ' thành ```json { "transactions": [] }';
    }
    return 'Xuất danh mục thành ```json (KHÔNG bịa số): ' + list;
  }

  function buildReport(state, today) {
    const sm = summarize(state);
    return '# Báo cáo ' + dmy(today) + ' (' + fmtInt(sm.totalCommitted) + ' ₫)\n```json\n' + JSON.stringify(toExport(state, today), null, 2) + '\n```';
  }

  return {
    KIND_LABEL, DEFAULT_UNIT,
    defaultState, emptyState, initialPortfolioState, makeAsset, uid, clone,
    toNumber, toISODate, normCode, normStatus, normKind,
    valueAsset, summarize, planContribution, upsertSnapshot, monthsBetween,
    extractJSON, mergeImport, toExport, buildPrompt, buildReport,
    fmtInt, fmtPct
  };
});
