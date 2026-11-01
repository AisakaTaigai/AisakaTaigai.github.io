// busuanzi.cc uses a separate dataset from the original ibruce service.
(() => {
  if (window.blogVisitorStatsInitialized) return;
  window.blogVisitorStatsInitialized = true;

  const metrics = ['site_uv', 'site_pv', 'page_pv'];
  let activeRequest;

  function display(message) {
    metrics.forEach(metric => {
      const element = document.getElementById('busuanzi_value_' + metric);
      if (element) element.textContent = message;
    });
  }

  async function update() {
    if (activeRequest) activeRequest.abort();
    if (!metrics.some(metric => document.getElementById('busuanzi_value_' + metric))) return;

    const controller = new AbortController();
    activeRequest = controller;
    const timeout = setTimeout(() => controller.abort(), 10000);
    display('加载中…');
    try {
      // Match the provider's public tracking script; no credentials are needed.
      const response = await fetch('https://cdn.busuanzi.cc/api.php', {
        method: 'POST',
        body: JSON.stringify({ url: location.href, referrer: document.referrer }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Statistics request failed');
      const data = await response.json();
      if (activeRequest !== controller) return;
      metrics.forEach(metric => {
        const element = document.getElementById('busuanzi_value_' + metric);
        const value = data['busuanzi_' + metric];
        if (element) element.textContent = Number.isSafeInteger(value) && value >= 0
          ? value.toLocaleString('zh-CN') : '暂不可用';
      });
    } catch (error) {
      if (activeRequest === controller) display('暂不可用');
    } finally {
      clearTimeout(timeout);
    }
  }

  document.addEventListener('pjax:complete', update);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', update, { once: true });
  } else {
    update();
  }
})();
