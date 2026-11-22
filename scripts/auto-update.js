#!/usr/bin/env node
/* scripts/auto-update.js — Chạy tự động mỗi 9:00 sáng (giờ VN) trên GitHub Actions Cloud */
const fs = require('fs');
const path = require('path');

const now = new Date(Date.now() + 7 * 3600 * 1000);
const yyyy = now.getUTCFullYear();
const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
const dd = String(now.getUTCDate()).padStart(2, '0');
const isoDate = `${yyyy}-${mm}-${dd}`;
const vnDate = `${dd}/${mm}/${yyyy}`;

async function fetchText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    });
    return res.ok ? await res.text() : '';
  } catch (e) {
    return '';
  } finally {
    clearTimeout(t);
  }
}

(async () => {
  const logicPath = path.join(__dirname, '..', 'logic.js');
  const swPath = path.join(__dirname, '..', 'sw.js');
  let logic = fs.readFileSync(logicPath, 'utf8');
  let sw = fs.readFileSync(swPath, 'utf8');

  // Cập nhật ngày bản tin sang ngày hôm nay
  logic = logic.replace(/updatedAt:\s*'[^']*'/, `updatedAt: '${vnDate}'`);
  logic = logic.replace(/Hôm nay \([0-9/]+\):/, `Hôm nay (${dd}/${mm}):`);
  logic = logic.replace(/priceAsOf:\s*'[^']*'/g, `priceAsOf: '${isoDate}'`);
  logic = logic.replace(/lastSync = '[^']*'/, `lastSync = '${new Date().toISOString()}'`);

  // Thử lấy giá vàng SJC/BTMC mới nhất nếu truy cập được từ cloud
  const goldHtml = await fetchText('https://btmc.vn/');
  const mGold = goldHtml.match(/1[234][.,]\d{2,3}/);
  if (mGold) {
    const raw = parseFloat(mGold[0].replace(',', '.'));
    if (raw > 10 && raw < 20) {
      const vndPerChi = Math.round(raw * 1000000);
      logic = logic.replace(/price:\s*\d+,\s*\n\s*priceAsOf:\s*'[^']*',\s*\n\s*priceSource:\s*'Giá mua vào vàng/, `price: ${vndPerChi},\n        priceAsOf: '${isoDate}',\n        priceSource: 'Giá mua vào vàng`);
    }
  }

  // Tăng version cache trong sw.js để iPhone nhận bản mới
  sw = sw.replace(/my-hub-retire-v(\d+)/, (_, n) => `my-hub-retire-v${Number(n) + 1}`);

  fs.writeFileSync(logicPath, logic, 'utf8');
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('Updated briefing date to', vnDate);
})();
