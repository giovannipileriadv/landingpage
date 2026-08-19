/* Giovanni Pileri — Analytics com consentimento (LGPD)
 * ----------------------------------------------------------------------------
 * PREENCHA OS IDs ABAIXO PARA ATIVAR. Enquanto estiverem vazios, este arquivo
 * não define cookies, não carrega scripts externos e não exibe o aviso de
 * consentimento — o site continua 100% livre de rastreamento.
 *
 *   GA4_MEASUREMENT_ID : formato "G-XXXXXXXXXX" (Google Analytics 4)
 *   CLARITY_PROJECT_ID : ID do projeto no Microsoft Clarity
 */
(function () {
  var CONFIG = {
    GA4_MEASUREMENT_ID: "",
    CLARITY_PROJECT_ID: ""
  };

  var STORAGE_KEY = "pileri_consent_v1";
  var hasTools = !!(CONFIG.GA4_MEASUREMENT_ID || CONFIG.CLARITY_PROJECT_ID);
  if (!hasTools) return;

  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }

  function loadGA() {
    if (!CONFIG.GA4_MEASUREMENT_ID || window.__pileriGA) return;
    window.__pileriGA = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + CONFIG.GA4_MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CONFIG.GA4_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function loadClarity() {
    if (!CONFIG.CLARITY_PROJECT_ID || window.__pileriClarity) return;
    window.__pileriClarity = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CONFIG.CLARITY_PROJECT_ID);
  }

  /* Eventos de conversão — sem dados pessoais, apenas o tipo de interação. */
  function bindEvents() {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (href.indexOf("wa.me") > -1) track("contato_whatsapp", { origem: a.dataset.origem || "link" });
      else if (href.indexOf("mailto:") === 0) track("contato_email");
      else if (href.indexOf("tel:") === 0) track("contato_telefone");
      else if (href === "#contato") track("cta_conversa_inicial");
    }, true);

    document.addEventListener("submit", function (e) {
      if (e.target && e.target.tagName === "FORM") track("formulario_enviado");
    }, true);
  }

  function activate() {
    loadGA();
    loadClarity();
    bindEvents();
  }

  function banner() {
    var wrap = document.createElement("div");
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Aviso de cookies");
    wrap.style.cssText = "position:fixed;left:16px;right:16px;bottom:16px;z-index:120;max-width:560px;margin:0 auto;background:#161616;color:#e4e4e4;border:1px solid rgba(255,255,255,.16);border-radius:14px;padding:20px 22px;font-family:'Source Sans 3',system-ui,sans-serif;font-size:15px;line-height:1.55;box-shadow:0 18px 48px rgba(0,0,0,.45)";
    wrap.innerHTML =
      '<p style="margin:0 0 14px">Utilizamos cookies de medição para entender como o site é usado. Você pode aceitar ou recusar — recusar não afeta o funcionamento da página.</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button type="button" data-act="ok" style="background:#f5f3ef;color:#161616;border:none;font:inherit;font-weight:600;padding:11px 20px;border-radius:8px;cursor:pointer">Aceitar</button>' +
      '<button type="button" data-act="no" style="background:transparent;color:#e4e4e4;border:1px solid rgba(255,255,255,.35);font:inherit;font-weight:600;padding:11px 20px;border-radius:8px;cursor:pointer">Recusar</button>' +
      '</div>';
    wrap.addEventListener("click", function (e) {
      var act = e.target && e.target.dataset ? e.target.dataset.act : null;
      if (!act) return;
      try { localStorage.setItem(STORAGE_KEY, act === "ok" ? "granted" : "denied"); } catch (err) {}
      wrap.remove();
      if (act === "ok") activate();
    });
    document.body.appendChild(wrap);
  }

  function start() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (err) {}
    if (saved === "granted") activate();
    else if (saved !== "denied") banner();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
