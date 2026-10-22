/* Site behaviour shared by every page: light/dark toggle (dark is the
   default), mobile menu, header shadow, and the small motion touches.
   No dependencies. Everything degrades to a static, fully visible page. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var AR = (root.lang || "").toLowerCase().indexOf("ar") === 0;

  /* ---- Light / dark ---------------------------------------------- */
  var btn = document.querySelector(".theme-toggle");
  function isLight() { return root.getAttribute("data-mode") === "light"; }
  function sync() {
    if (btn) {
      btn.setAttribute("aria-label", isLight()
        ? (AR ? "التبديل إلى الوضع الداكن" : "Switch to dark mode")
        : (AR ? "التبديل إلى الوضع الفاتح" : "Switch to light mode"));
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isLight() ? "#FFFFFF" : "#001B2A");
  }
  if (btn) {
    btn.addEventListener("click", function () {
      var next = isLight() ? "dark" : "light";
      if (next === "light") root.setAttribute("data-mode", "light");
      else root.removeAttribute("data-mode");
      try { localStorage.setItem("mode", next); } catch (e) {}
      sync();
    });
  }
  sync();

  /* ---- Mobile menu ------------------------------------------------ */
  var menuBtn = document.querySelector(".menu-toggle");
  var nav = document.getElementById("nav");
  if (menuBtn && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
    };
    menuBtn.addEventListener("click", function () {
      setOpen(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); menuBtn.focus(); }
    });
  }

  /* ---- Header shadow once the page scrolls ----------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Motion ----------------------------------------------------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Order for the page-load sequence (read by CSS as --i / --j).
  [].forEach.call(document.querySelectorAll(".hero-seq > *"), function (el, i) { el.style.setProperty("--i", i); });
  [].forEach.call(document.querySelectorAll(".skills-card .tags li"), function (el, j) { el.style.setProperty("--j", j); });

  // Scroll reveal: only blocks that start below the first screen are
  // hidden, and each batch comes in with a short stagger.
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      var shown = entries.filter(function (en) { return en.isIntersecting; });
      shown.forEach(function (en, k) {
        en.target.style.transitionDelay = (k * 90) + "ms";
        en.target.classList.remove("pre");
        io.unobserve(en.target);
        setTimeout(function () { en.target.style.transitionDelay = ""; }, 900 + k * 90);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    [].forEach.call(document.querySelectorAll(".reveal"), function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("pre"); io.observe(el); }
    });
  }
})();

/* Case-study figures: marks animate in when the figure enters the screen. */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.remove("pre"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -10% 0px" });
  [].forEach.call(document.querySelectorAll(".fig"), function (f) {
    if (f.getBoundingClientRect().top > window.innerHeight * 0.9) { f.classList.add("pre"); io.observe(f); }
  });
})();
