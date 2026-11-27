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
    if (document.body.dataset.page === "search") return;

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

  // ---------------------------------------------------------------------------
  // Search: sidebar box → search.html?q=… → article?hl=… (highlight + scroll)
  // ---------------------------------------------------------------------------

  // Resolve the docs root from this script's own URL (…/assets/app.js). Works on file:// too.
  const scriptSrc = (document.currentScript && document.currentScript.src) || "";
  const siteRoot = scriptSrc ? new URL("../", scriptSrc).href : "";
  const SKIP_HIGHLIGHT =
    "script, style, button, select, textarea, mark.search-hit, .chapter-help-bar, .pager, .search-hit-bar";

  function parseTerms(query) {
    const seen = new Set();
    return (query || "")
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => {
        const key = t.toLowerCase();
        if (!t || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Longer terms first so the longer one wins when terms overlap
  function termsRegExp(terms) {
    const sorted = terms.slice().sort((a, b) => b.length - a.length);
    return new RegExp(sorted.map(escapeRegExp).join("|"), "gi");
  }

  function termIndexOf(terms, matched) {
    const lower = matched.toLowerCase();
    return terms.findIndex((t) => t.toLowerCase() === lower);
  }

  function countOccurrences(haystackLower, needleLower) {
    let count = 0;
    let pos = haystackLower.indexOf(needleLower);
    while (pos !== -1) {
      count += 1;
      pos = haystackLower.indexOf(needleLower, pos + needleLower.length);
    }
    return count;
  }

  // DocumentFragment of `text` with every term wrapped in <mark class="search-hit">
  function highlightedFragment(text, terms) {
    const frag = document.createDocumentFragment();
    const re = termsRegExp(terms);
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const mark = document.createElement("mark");
      mark.className = "search-hit";
      mark.textContent = m[0];
      frag.appendChild(mark);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    return frag;
  }

  function goToSearch(query) {
    const q = query.trim();
    if (!q) return false;
    window.location.href = `${siteRoot}search.html?q=${encodeURIComponent(q)}`;
    return true;
  }

  function initSidebarSearch() {
    const controls = document.querySelector(".sidebar-controls");
    if (!controls) return;

    const form = document.createElement("form");
    form.className = "sidebar-search";
    form.setAttribute("role", "search");

    const input = document.createElement("input");
    input.type = "search";
    input.className = "sidebar-search-input";
    input.placeholder = "전체 검색 (Enter)";
    input.setAttribute("aria-label", "교과서 전체 검색");
    const params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || params.get("hl") || "";

    const btn = document.createElement("button");
    btn.type = "submit";
    btn.className = "btn";
    btn.textContent = "검색";

    form.appendChild(input);
    form.appendChild(btn);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!goToSearch(input.value)) input.focus();
    });
    controls.insertAdjacentElement("afterend", form);

    // "/" focuses the search box (ignored while typing in a field)
    document.addEventListener("keydown", (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      const sidebar = document.querySelector(".sidebar");
      if (sidebar) sidebar.classList.add("open");
      input.focus();
      input.select();
    });
  }

  function renderSearchPage() {
    if (document.body.dataset.page !== "search") return;
    const summary = document.getElementById("search-summary");
    const results = document.getElementById("search-results");
    if (!summary || !results) return;

    const query = (new URLSearchParams(window.location.search).get("q") || "").trim();
    const terms = parseTerms(query);
    if (!terms.length) {
      const input = document.querySelector(".sidebar-search-input");
      if (input) input.focus();
      return;
    }
    document.title = `"${query}" ${document.title}`; // "검색 | <title>" → "\"q\" 검색 | <title>"

    const index = window.SEARCH_INDEX;
    if (!Array.isArray(index)) {
      summary.textContent = "검색 인덱스(assets/search-index.js)를 불러오지 못했어요. build_search_index.py 를 실행해 주세요.";
      return;
    }

    const lowerTerms = terms.map((t) => t.toLowerCase());
    const hits = [];
    index.forEach((page, order) => {
      const pageTerms = new Set();
      let total = 0;
      const sections = [];
      page.sections.forEach((sec) => {
        const textLower = `${sec.h} ${sec.t}`.toLowerCase();
        let secTotal = 0;
        let secDistinct = 0;
        lowerTerms.forEach((t, i) => {
          const c = countOccurrences(textLower, t);
          if (c) {
            secTotal += c;
            secDistinct += 1;
            pageTerms.add(i);
          }
        });
        if (secTotal) sections.push({ sec, secTotal, secDistinct });
        total += secTotal;
      });
      if (!total) return;
      sections.sort((a, b) => b.secDistinct - a.secDistinct || b.secTotal - a.secTotal);
      hits.push({ page, order, total, distinct: pageTerms.size, sections });
    });
    hits.sort((a, b) => b.distinct - a.distinct || b.total - a.total || a.order - b.order);

    const grand = hits.reduce((n, h) => n + h.total, 0);
    summary.textContent = hits.length
      ? `"${query}" 검색 결과: 아티클 ${hits.length}개, 총 ${grand}곳 일치`
      : `"${query}"와 일치하는 내용이 없어요. 다른 키워드나 더 짧은 단어로 검색해 보세요.`;

    const list = document.createElement("ol");
    list.className = "search-result-list";
    hits.forEach((hit) => {
      const href = `${hit.page.url}?hl=${encodeURIComponent(query)}`;
      const li = document.createElement("li");
      li.className = "search-result";

      const head = document.createElement("div");
      head.className = "search-result-head";
      const a = document.createElement("a");
      a.href = href;
      a.className = "search-result-title";
      a.textContent = hit.page.title;
      head.appendChild(a);
      const badge = document.createElement("span");
      badge.className = "search-result-badge";
      badge.textContent =
        `${hit.total}곳` + (terms.length > 1 ? ` · 키워드 ${hit.distinct}/${terms.length}` : "");
      head.appendChild(badge);
      li.appendChild(head);

      hit.sections.slice(0, 3).forEach(({ sec }) => {
        const row = document.createElement("a");
        row.href = href;
        row.className = "search-snippet";
        const h = document.createElement("span");
        h.className = "search-snippet-heading";
        h.appendChild(highlightedFragment(sec.h, terms));
        row.appendChild(h);
        row.appendChild(document.createTextNode(" "));
        const body = document.createElement("span");
        body.className = "search-snippet-text";
        body.appendChild(highlightedFragment(makeSnippet(sec.t, lowerTerms), terms));
        row.appendChild(body);
        li.appendChild(row);
      });
      if (hit.sections.length > 3) {
        const more = document.createElement("div");
        more.className = "search-snippet-more";
        more.textContent = `외 ${hit.sections.length - 3}개 절에서도 일치`;
        li.appendChild(more);
      }
      list.appendChild(li);
    });
    results.appendChild(list);
  }

  function makeSnippet(text, lowerTerms) {
    const lower = text.toLowerCase();
    let pos = -1;
    lowerTerms.forEach((t) => {
      const p = lower.indexOf(t);
      if (p !== -1 && (pos === -1 || p < pos)) pos = p;
    });
    if (pos === -1) return text.slice(0, 160) + (text.length > 160 ? "…" : "");
    const start = Math.max(0, pos - 60);
    const end = Math.min(text.length, pos + 120);
    return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  }

  function openDetailsAncestors(el) {
    for (let p = el.parentElement; p; p = p.parentElement) {
      if (p.tagName === "DETAILS") p.open = true;
    }
  }

  function highlightFromQuery() {
    if (document.body.dataset.page === "search") return;
    const article = document.querySelector("article.content");
    if (!article) return;
    const query = (new URLSearchParams(window.location.search).get("hl") || "").trim();
    const terms = parseTerms(query);
    if (!terms.length) return;

    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.closest(SKIP_HIGHLIGHT)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    const re = termsRegExp(terms);
    textNodes.forEach((node) => {
      re.lastIndex = 0;
      if (!re.test(node.nodeValue)) return;
      const frag = highlightedFragment(node.nodeValue, terms);
      frag.querySelectorAll("mark.search-hit").forEach((mark) => {
        mark.dataset.term = String(termIndexOf(terms, mark.textContent));
      });
      node.parentNode.replaceChild(frag, node);
    });

    const marks = Array.from(article.querySelectorAll("mark.search-hit"));
    if (!marks.length) {
      showToast(`이 페이지에서 "${query}"를 찾지 못했어요`);
      return;
    }

    // Start at the first occurrence of the first keyword (else the first hit of any keyword)
    let current = marks.findIndex((m) => m.dataset.term === "0");
    if (current === -1) current = 0;

    const bar = document.createElement("div");
    bar.className = "search-hit-bar";
    bar.setAttribute("role", "status");
    const label = document.createElement("span");
    label.className = "search-hit-label";
    const mkBtn = (text, title, onClick) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = text;
      b.title = title;
      b.addEventListener("click", onClick);
      bar.appendChild(b);
      return b;
    };
    bar.appendChild(label);
    mkBtn("‹", "이전 일치 (Shift+Enter)", () => go(current - 1));
    mkBtn("›", "다음 일치 (Enter)", () => go(current + 1));
    mkBtn("✕", "하이라이트 지우기 (Esc)", clear);
    document.body.appendChild(bar);

    function go(i, smooth = true) {
      marks[current].classList.remove("current");
      current = (i + marks.length) % marks.length;
      const mark = marks[current];
      mark.classList.add("current");
      openDetailsAncestors(mark);
      label.textContent = `"${query}" ${current + 1} / ${marks.length}`;
      mark.scrollIntoView({ block: "center", behavior: smooth ? "smooth" : "instant" });
    }

    function onKey(e) {
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Escape") clear();
      else if (e.key === "Enter" && !["A", "BUTTON", "SUMMARY"].includes(tag)) {
        e.preventDefault();
        go(current + (e.shiftKey ? -1 : 1));
      }
    }

    function clear() {
      marks.forEach((m) => m.replaceWith(document.createTextNode(m.textContent)));
      article.normalize();
      bar.remove();
      document.removeEventListener("keydown", onKey);
      const url = new URL(window.location.href);
      url.searchParams.delete("hl");
      try {
        history.replaceState(null, "", url.href);
      } catch (_) {
        // Some browsers block this on file://; keep the URL as is
      }
    }

    document.addEventListener("keydown", onKey);
    // Jump after layout (help bar etc.) has settled
    requestAnimationFrame(() => go(current, false));
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
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  function initAll() {
    initSidebarSearch();
    initChapterHelpBar();
    initSelectionFloatingWidget();
    renderSearchPage();
    highlightFromQuery();
  }
})();
