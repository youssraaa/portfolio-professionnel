let pageLang = "fr";

document.addEventListener("DOMContentLoaded", () => {
  setupLanguage();
  setupTheme();
  setupMenu();
  setupHeader();
  setupContactForm();
  setupProjectFilters();
  setupProjectDialogs();
  setupShotViewer();
  setupReveal();
});

function setupMenu() {
  const menuBtn = document.getElementById("menu-btn");
  const mobileNav = document.getElementById("mobile-nav");
  if (!menuBtn || !mobileNav) return;

  const setOpen = (open) => {
    menuBtn.classList.toggle("active", open);
    mobileNav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  };

  menuBtn.addEventListener("click", () => {
    setOpen(!menuBtn.classList.contains("active"));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("click", (event) => {
    if (!menuBtn.contains(event.target) && !mobileNav.contains(event.target)) {
      setOpen(false);
    }
  });
}

function setupHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 8);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupContactForm() {
  const form = document.getElementById("form");
  const status = document.getElementById("form-status");
  if (!form) return;

  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    if (String(data.get("_honey") || "").trim()) return;

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "").trim() || t("Contact via le portfolio");
    const message = String(data.get("message") || "").trim();

    if (submitBtn) submitBtn.disabled = true;
    setStatus(status, t("Envoi en cours…"));

    try {
      const response = await fetch("https://formsubmit.co/ajax/youssradahouane1@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: "Portfolio — " + subject,
          _replyto: email,
          _template: "table",
          _captcha: "false"
        })
      });

      const result = await response.json().catch(() => ({}));
      const info = String(result.message || "");

      if (/activ/i.test(info)) {
        setStatus(status, t("Presque prêt : ouvrez l'e-mail FormSubmit reçu sur youssradahouane1@gmail.com et cliquez sur Activate Form. Ensuite, les messages arriveront dans cette boîte."), true);
        return;
      }

      if (/web server|HTML files/i.test(info)) {
        setStatus(status, t("Le message part une fois le site publié sur internet. En attendant, écrivez à youssradahouane1@gmail.com."), true);
        return;
      }

      if (!response.ok || String(result.success) !== "true") {
        throw new Error(info || "envoi");
      }

      form.reset();
      setStatus(status, t("Merci {name}. Votre message est bien arrivé. Je vous réponds sous 24 heures.").replace("{name}", name));
    } catch (error) {
      setStatus(status, t("L'envoi n'a pas abouti. Écrivez directement à youssradahouane1@gmail.com."), true);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function setStatus(element, text, isError) {
  if (!element) return;
  element.className = isError ? "form-status is-error" : "form-status";
  element.textContent = text;
}

function setupProjectFilters() {
  const filters = document.querySelector(".lang-filters");
  if (!filters) return;

  const cards = [...document.querySelectorAll(".project-grid .project")];

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-lang]");
    if (!button) return;

    const lang = button.dataset.lang;
    filters.querySelectorAll("button").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-on", selected);
      item.setAttribute("aria-pressed", selected ? "true" : "false");
    });

    cards.forEach((card) => {
      const langs = (card.dataset.langs || "").split(/\s+/);
      card.hidden = lang !== "all" && !langs.includes(lang);
    });

    const visible = cards.filter((card) => !card.hidden);
    const narrow = window.matchMedia("(max-width: 980px)").matches;
    const spans = columnSpans(visible, narrow);

    cards.forEach((card) => {
      card.style.gridColumn = "";
    });
    visible.forEach((card, index) => {
      card.style.gridColumn = spans[index] || "span 6";
      card.style.transitionDelay = `${index * 0.07}s`;
      card.classList.remove("active");
    });
    requestAnimationFrame(() => {
      visible.forEach((card) => card.classList.add("active"));
    });

    const empty = document.querySelector(".projects-empty");
    if (empty) empty.hidden = visible.length > 0;
  });
}

function columnSpans(visible, narrow) {
  if (narrow || visible.length <= 1) return visible.map(() => "1 / -1");
  if (visible.length === 2) return ["span 6", "span 6"];

  return visible.map((card) => {
    if (card.classList.contains("project-side")) return "span 5";
    if (card.classList.contains("project-wide")) return "span 7";
    if (card.classList.contains("project-phone")) return "span 4";
    if (card.classList.contains("project-web") || card.classList.contains("project-span8")) return "span 8";
    if (card.classList.contains("project-line")) return "1 / -1";
    return "span 6";
  });
}

function setupProjectDialogs() {
  document.querySelectorAll("[data-open-dialog]").forEach((opener) => {
    opener.addEventListener("click", () => {
      const dialog = document.getElementById(opener.dataset.openDialog);
      if (dialog) dialog.showModal();
    });
  });

  document.querySelectorAll("dialog.project-dialog").forEach((dialog) => {
    dialog.querySelector("[data-close-dialog]")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
}

function setupShotViewer() {
  const viewer = document.getElementById("shot-viewer");
  if (!viewer) return;

  const image = viewer.querySelector("img");
  const caption = viewer.querySelector("figcaption");
  let shots = [];
  let index = 0;

  function show(next) {
    if (!shots.length) return;
    index = (next + shots.length) % shots.length;
    image.src = shots[index].src;
    image.alt = shots[index].alt;
    caption.textContent = shots[index].caption;
    if (!viewer.open) viewer.showModal();
  }

  function openFrom(grid, startImage) {
    shots = [...grid.querySelectorAll("figure")].map((figure) => {
      const shot = figure.querySelector("img");
      return {
        src: shot.currentSrc || shot.src,
        alt: shot.alt,
        caption: figure.querySelector("figcaption")?.textContent.trim() || ""
      };
    }).filter((shot) => shot.src);
    const start = shots.findIndex((shot) => shot.src === (startImage.currentSrc || startImage.src));
    show(start < 0 ? 0 : start);
  }

  document.querySelectorAll(".project .browser[data-open-dialog] img").forEach((shot) => {
    const dialog = document.getElementById(shot.closest("[data-open-dialog]").dataset.openDialog);
    const grid = dialog?.querySelector(".shot-grid");
    if (!grid || grid.querySelectorAll("img").length < 2) return;
    shot.classList.add("opens-shots");
    shot.addEventListener("click", (event) => {
      event.stopPropagation();
      openFrom(grid, shot);
    });
  });

  document.querySelectorAll(".shot-grid img").forEach((shot) => {
    shot.addEventListener("click", (event) => {
      event.stopPropagation();
      openFrom(shot.closest(".shot-grid"), shot);
    });
  });

  document.querySelectorAll("[data-open-shots]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const dialog = document.getElementById(button.dataset.openShots);
      const grid = dialog?.querySelector(".shot-grid");
      const first = grid?.querySelector("img");
      if (first) openFrom(grid, first);
    });
  });

  viewer.querySelector(".shot-prev").addEventListener("click", () => show(index - 1));
  viewer.querySelector(".shot-next").addEventListener("click", () => show(index + 1));
  viewer.querySelector("[data-close-viewer]").addEventListener("click", () => viewer.close());
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) viewer.close();
  });
  viewer.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") show(index + 1);
    if (event.key === "ArrowLeft") show(index - 1);
  });
}

function setupReveal() {
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("active");
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function t(text) {
  if (pageLang !== "en") return text;
  return window.PAGE_EN[text] || text;
}

function setupLanguage() {
  const saved = localStorage.getItem("youssra-lang");
  applyLanguage(saved === "en" ? "en" : "fr");
  document.querySelectorAll("[data-set-lang]").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.setLang));
  });
}

function applyLanguage(lang) {
  pageLang = lang === "en" ? "en" : "fr";
  localStorage.setItem("youssra-lang", pageLang);
  document.documentElement.lang = pageLang;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (!node.parentElement || node.parentElement.closest("script, style")) return;
    if (!node.__fr) node.__fr = node.nodeValue;
    const source = node.__fr;
    const trimmed = source.trim();
    if (!trimmed) return;
    const next = pageLang === "en" ? (window.PAGE_EN[trimmed] || trimmed) : trimmed;
    node.nodeValue = source.replace(trimmed, next);
  });

  [
    ["alt", "data-i18n-alt"],
    ["aria-label", "data-i18n-label"]
  ].forEach(([attr, store]) => {
    document.querySelectorAll("[" + attr + "]").forEach((element) => {
      if (!element.hasAttribute(store)) element.setAttribute(store, element.getAttribute(attr));
      const source = element.getAttribute(store);
      element.setAttribute(attr, pageLang === "en" ? (window.PAGE_EN[source] || source) : source);
    });
  });

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    if (!description.dataset.i18n) description.dataset.i18n = description.content;
    description.content = pageLang === "en" ? (window.PAGE_EN[description.dataset.i18n] || description.dataset.i18n) : description.dataset.i18n;
  }

  document.querySelectorAll("[data-set-lang]").forEach((button) => {
    const selected = button.dataset.setLang === pageLang;
    button.classList.toggle("is-on", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });

  updateThemeLabel();
}

function setupTheme() {
  const saved = localStorage.getItem("youssra-theme");
  setDark(saved === "dark");
  document.getElementById("theme-btn")?.addEventListener("click", () => {
    setDark(!document.body.classList.contains("dark"));
  });
}

function setDark(dark) {
  document.body.classList.toggle("dark", dark);
  localStorage.setItem("youssra-theme", dark ? "dark" : "light");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? "#1C1018" : "#FFF1F3";
  updateThemeLabel();
}

function updateThemeLabel() {
  const button = document.getElementById("theme-btn");
  if (!button) return;
  const dark = document.body.classList.contains("dark");
  const label = dark ? "Activer le thème clair" : "Activer le thème sombre";
  button.setAttribute("aria-label", t(label));
}
