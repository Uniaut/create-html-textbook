(function () {
  const root = document.documentElement;
  const themeKey = "indoor-robot-lab-theme";
  const providerKey = "adaptive-study-ai-provider";

  const AI_PROVIDERS = {
    chatgpt: { label: "ChatGPT", url: "https://chatgpt.com/?q=" },
    claude: { label: "Claude", url: "https://claude.ai/new?q=" },
    perplexity: { label: "Perplexity", url: "https://www.perplexity.ai/search?q=" },
  };

  function getProviderId() {
    const saved = localStorage.getItem(providerKey);
    return AI_PROVIDERS[saved] ? saved : "chatgpt";
  }

  function setProviderId(id) {
    if (!AI_PROVIDERS[id]) return;
    localStorage.setItem(providerKey, id);
    document.querySelectorAll(".ai-provider-select").forEach((sel) => {
      sel.value = id;
    });
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    return fallbackCopy(text);
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (_) {
      // Ignore if clipboard is unavailable
    }
    return Promise.resolve();
  }

  let toastTimer = null;
  function showToast(message) {
    let toast = document.querySelector(".study-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "study-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  function openAiQuery(promptText) {
    const provider = AI_PROVIDERS[getProviderId()];
    copyText(promptText);
    const targetUrl = provider.url + encodeURIComponent(promptText);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    showToast(`${provider.label}로 이동합니다 (프롬프트 복사 완료)`);
  }

  function createProviderSelect() {
    const select = document.createElement("select");
    select.className = "ai-provider-select";
    select.setAttribute("aria-label", "질문할 AI 서비스 선택");
    Object.entries(AI_PROVIDERS).forEach(([id, info]) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = info.label;
      select.appendChild(opt);
    });
    select.value = getProviderId();
    select.addEventListener("change", (e) => setProviderId(e.target.value));
    return select;
  }

  function normalizeWhitespace(str) {
    return str.replace(/\s+/g, " ").trim();
  }

  function extractSurroundingText(range, selectedText) {
    let node = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }
    const blockSelector = "p, li, td, th, blockquote, pre, .callout, article.content";
    const block = node && node.closest ? node.closest(blockSelector) : null;
    const raw = block ? block.innerText || block.textContent || "" : selectedText;
    const full = normalizeWhitespace(raw);
    const maxLen = 360;

    if (full.length <= maxLen) {
      return full;
    }

    const idx = full.indexOf(selectedText);
    if (idx === -1) {
      return full.slice(0, maxLen) + "...";
    }
    const pad = Math.floor((maxLen - selectedText.length) / 2);
    const start = Math.max(0, idx - Math.max(pad, 60));
    const end = Math.min(full.length, start + maxLen);
    return (start > 0 ? "..." : "") + full.slice(start, end).trim() + (end < full.length ? "..." : "");
  }

  function buildSelectionPrompt(surroundingText, selectedText) {
    return (
      "아래 내용을 공부하는데 어려워서 더 친절한 설명이 필요해\n" +
      `'${surroundingText}'\n` +
      `이 부분에서, '${selectedText}' 부분을 이해하고 싶어.`
    );
  }

  function initChapterHelpBar() {
    const article = document.querySelector("article.content");
    if (!article) return;
    const path = window.location.pathname;
    if (path.endsWith("/index.html") || path.endsWith("index.html")) return;

    const h1 = article.querySelector("h1");
    if (!h1) return;

    const bar = document.createElement("div");
    bar.className = "chapter-help-bar";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chapter-help-btn";
    btn.textContent = "이 챕터가 너무 어려워요 ↗";
    btn.addEventListener("click", () => {
      const title = normalizeWhitespace(h1.textContent || document.title);
      const topics = Array.from(article.querySelectorAll("h2"))
        .map((el) => normalizeWhitespace(el.textContent || ""))
        .filter(Boolean)
        .slice(0, 8)
        .join(", ");

      const prompt =
        "아래 챕터를 공부하는데 너무 어려워서 더 친절하고 쉽게 설명해 줘.\n" +
        `챕터: '${title}'\n` +
        (topics ? `다루는 주제: ${topics}\n` : "") +
        "핵심 개념을 직관적인 비유와 함께 단계별로 쉽게 풀어서 설명해 줘.";
      openAiQuery(prompt);
    });

    bar.appendChild(btn);
    bar.appendChild(createProviderSelect());

    const metaBar = article.querySelector(".meta-bar");
    if (metaBar && metaBar.parentNode === article) {
      metaBar.insertAdjacentElement("afterend", bar);
    } else {
      h1.insertAdjacentElement("afterend", bar);
    }
  }

  function initSelectionFloatingWidget() {
    const article = document.querySelector("article.content");
    if (!article) return;

    const widget = document.createElement("aside");
    widget.className = "selection-ask-widget";
    widget.setAttribute("aria-label", "선택한 텍스트 질문 위젯");

    const header = document.createElement("div");
    header.className = "saw-header";

    const title = document.createElement("span");
    title.className = "saw-title";
    title.textContent = "선택한 부분 질문하기";
    header.appendChild(title);
    header.appendChild(createProviderSelect());

    const quote = document.createElement("div");
    quote.className = "saw-quote";

    const actions = document.createElement("div");
    actions.className = "saw-actions";

    const askBtn = document.createElement("button");
    askBtn.type = "button";
    askBtn.className = "saw-ask-btn";
    askBtn.textContent = "친절한 설명 요청 ↗";

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "saw-copy-btn";
    copyBtn.textContent = "복사";

    actions.appendChild(askBtn);
    actions.appendChild(copyBtn);

    widget.appendChild(header);
    widget.appendChild(quote);
    widget.appendChild(actions);
    document.body.appendChild(widget);

    let currentPrompt = "";

    // Keep text selection alive when clicking widget buttons (except select dropdown)
    widget.addEventListener("mousedown", (e) => {
      if (e.target.tagName !== "SELECT" && e.target.tagName !== "OPTION") {
        e.preventDefault();
      }
    });

    askBtn.addEventListener("click", () => {
      if (!currentPrompt) return;
      openAiQuery(currentPrompt);
    });

    copyBtn.addEventListener("click", () => {
      if (!currentPrompt) return;
      copyText(currentPrompt).then(() => showToast("질문 프롬프트를 복사했습니다"));
    });

    function hideWidget() {
      widget.classList.remove("visible");
      currentPrompt = "";
    }

    function updateWidgetFromSelection() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        hideWidget();
        return;
      }

      const selectedText = normalizeWhitespace(sel.toString());
      if (selectedText.length < 2) {
        hideWidget();
        return;
      }

      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const el = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
      if (!el || !article.contains(el)) {
        hideWidget();
        return;
      }

      const surrounding = extractSurroundingText(range, selectedText);
      currentPrompt = buildSelectionPrompt(surrounding, selectedText);
      quote.textContent = `"${selectedText}"`;

      const rect = range.getBoundingClientRect();
      widget.classList.add("visible");
      const widgetHeight = widget.offsetHeight || 160;
      const idealTop = Math.max(72, Math.min(rect.top - 10, window.innerHeight - widgetHeight - 20));
      widget.style.top = `${Math.round(idealTop)}px`;
    }

    document.addEventListener("mouseup", (e) => {
      if (widget.contains(e.target)) return;
      setTimeout(updateWidgetFromSelection, 10);
    });

    document.addEventListener("keyup", () => {
      setTimeout(updateWidgetFromSelection, 10);
    });

    document.addEventListener("selectionchange", () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        hideWidget();
      }
    });
  }

  // Initialize theme
  const saved = localStorage.getItem(themeKey);
  applyTheme(saved || "light");

  document.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest("[data-theme-toggle]");
    if (toggleBtn) {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(themeKey, next);
      applyTheme(next);
      return;
    }

    const menuBtn = e.target.closest("[data-menu-toggle]");
    if (menuBtn) {
      const sidebar = document.querySelector(".sidebar");
      if (sidebar) sidebar.classList.toggle("open");
      return;
    }

    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
      const block = copyBtn.closest(".code-block");
      const code = block ? block.querySelector("pre code") : null;
      if (code) {
        copyText(code.textContent).then(() => {
          const orig = copyBtn.textContent;
          copyBtn.textContent = "Copied";
          setTimeout(() => { copyBtn.textContent = orig; }, 1200);
        });
      }
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initChapterHelpBar();
      initSelectionFloatingWidget();
    });
  } else {
    initChapterHelpBar();
    initSelectionFloatingWidget();
  }
})();
