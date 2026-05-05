import { chromium } from 'playwright';

const baseURL = 'http://localhost:3000';

const result = {
  serviceWorker: null,
  routes: [],
  cacheNames: [],
  offlineReload: {},
  offlineQueue: {},
  apiFallback: {},
  errors: [],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const run = async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chromium' });
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();

  page.on('pageerror', (err) => result.errors.push(`pageerror:${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') result.errors.push(`console:${msg.text()}`);
  });

  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await sleep(2000);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 10000 }).catch(() => {});

  result.serviceWorker = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { supported: false };
    let manualRegistrationError = null;
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('ready-timeout')), 8000)),
      ]);
    } catch (e) {
      manualRegistrationError = String(e);
    }
    const reg = await navigator.serviceWorker.getRegistration();
    const controller = navigator.serviceWorker.controller;
    return {
      supported: true,
      manualRegistrationError,
      hasRegistration: !!reg,
      scope: reg?.scope || null,
      activeScriptURL: reg?.active?.scriptURL || null,
      hasController: !!controller,
      state: reg?.active?.state || null,
    };
  });

  result.cacheNames = await page.evaluate(async () => ('caches' in window ? await caches.keys() : []));

  result.routes = await page.evaluate(async () => {
    const swRes = await fetch('/sw.js');
    const swText = await swRes.text();
    const routeMatches = [...swText.matchAll(/registerRoute\(([^,]+),new e\.([A-Za-z]+)/g)].map((m) => ({
      pattern: m[1],
      strategy: m[2],
    }));
    return routeMatches;
  });

  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' }).catch((e) => {
    result.offlineReload.reloadError = String(e);
  });
  await sleep(1500);

  result.offlineReload.home = await page.evaluate(() => ({
    url: location.pathname,
    title: document.title,
    htmlSnippet: document.body?.innerText?.slice(0, 120) || '',
  }));

  await page.goto(`${baseURL}/offline`, { waitUntil: 'domcontentloaded' }).catch((e) => {
    result.offlineReload.offlinePageError = String(e);
  });
  result.offlineReload.offlinePage = await page.evaluate(() => document.body?.innerText?.includes('You are currently offline')).catch(() => false);

  await page.goto(`${baseURL}/public/demo-onboard`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await sleep(1000);

  const hasForm = await page.locator('form').count();
  result.offlineQueue.formFound = hasForm > 0;

  if (hasForm > 0) {
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const type = await input.getAttribute('type');
      const required = await input.getAttribute('required');
      if (required !== null) {
        if (type === 'email') await input.fill('offline@example.com').catch(() => {});
        else if (type === 'date') await input.fill('2000-01-01').catch(() => {});
        else await input.fill('Offline Test').catch(() => {});
      }
    }
    const textareas = await page.locator('textarea').all();
    for (const t of textareas) {
      const required = await t.getAttribute('required');
      if (required !== null) await t.fill('offline queued message').catch(() => {});
    }

    await page.locator('form button[type="submit"]').first().click({ timeout: 5000 }).catch(() => {});
    await sleep(1200);

    result.offlineQueue.idb = await page.evaluate(async () => {
      return await new Promise((resolve, reject) => {
        const req = indexedDB.open('idara-offline-db');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('pending-requests', 'readonly');
          const store = tx.objectStore('pending-requests');
          const countReq = store.count();
          countReq.onsuccess = () => resolve({ count: countReq.result });
          countReq.onerror = () => reject(countReq.error);
        };
      });
    }).catch((e) => ({ error: String(e) }));
  }

  const apiAttempt = await page.evaluate(async () => {
    try {
      const mod = await import('/_next/static/chunks/app/page-768c10bc3eaea8bf.js');
      return { imported: !!mod };
    } catch (e) {
      return { imported: false, error: String(e) };
    }
  });
  result.apiFallback.offlineNoCrash = !!apiAttempt;

  await context.setOffline(false);
  await sleep(4000);

  result.offlineQueue.afterOnline = await page.evaluate(async () => {
    return await new Promise((resolve, reject) => {
      const req = indexedDB.open('idara-offline-db');
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('pending-requests', 'readonly');
        const store = tx.objectStore('pending-requests');
        const countReq = store.count();
        countReq.onsuccess = () => resolve({ count: countReq.result });
        countReq.onerror = () => reject(countReq.error);
      };
    });
  }).catch((e) => ({ error: String(e) }));

  await browser.close();

  console.log(JSON.stringify(result, null, 2));
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
