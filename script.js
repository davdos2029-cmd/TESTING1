/**
 * NexaCloud — vanilla JS interactions
 * - Sticky nav + mobile menu
 * - Smooth section links
 * - Scroll reveal
 * - Pricing → form plan prefill
 * - Lead form client-side validation
 */

(function () {
  "use strict";

  /* ---------- DOM refs ---------- */
  const header = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const iconOpen = document.getElementById("icon-open");
  const iconClose = document.getElementById("icon-close");
  const yearEl = document.getElementById("year");
  const form = document.getElementById("lead-form");
  const successEl = document.getElementById("form-success");
  const serviceSelect = document.getElementById("service");

  /* ---------- Footer year ---------- */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Sticky header on scroll ---------- */
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  function setMenuOpen(open) {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.toggle("hidden", !open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (iconOpen && iconClose) {
      iconOpen.classList.toggle("hidden", open);
      iconClose.classList.toggle("hidden", !open);
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });
  }

  document.querySelectorAll(".mobile-link").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenuOpen(false);
    });
  });

  /* Close menu on Escape */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenuOpen(false);
  });

  /* ---------- Pricing plan → contact select ---------- */
  document.querySelectorAll("[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const plan = btn.getAttribute("data-plan");
      if (serviceSelect && plan) {
        const match = Array.from(serviceSelect.options).find(function (opt) {
          return opt.value === plan;
        });
        if (match) {
          serviceSelect.value = plan;
          clearFieldError(serviceSelect);
        }
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.getAttribute("data-reveal-delay") || 0);
          window.setTimeout(function () {
            el.classList.add("is-visible");
          }, delay);
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Form validation helpers ---------- */
  function fieldWrap(input) {
    return input.closest(".field");
  }

  function setFieldError(input, message) {
    const wrap = fieldWrap(input);
    const errorId = input.id + "-error";
    const errorEl = document.getElementById(errorId);
    if (wrap) wrap.classList.add("is-invalid");
    if (errorEl) errorEl.textContent = message;
    input.setAttribute("aria-invalid", "true");
  }

  function clearFieldError(input) {
    const wrap = fieldWrap(input);
    const errorId = input.id + "-error";
    const errorEl = document.getElementById(errorId);
    if (wrap) wrap.classList.remove("is-invalid");
    if (errorEl) errorEl.textContent = "";
    input.removeAttribute("aria-invalid");
  }

  function isValidEmail(value) {
    // Practical RFC-ish check — not overly strict
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function validateName(value) {
    const trimmed = value.trim();
    if (!trimmed) return "Please enter your name.";
    if (trimmed.length < 2) return "Name must be at least 2 characters.";
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return "Use letters only in your name.";
    return "";
  }

  function validateEmail(value) {
    const trimmed = value.trim();
    if (!trimmed) return "Please enter your email.";
    if (!isValidEmail(trimmed)) return "Enter a valid email address.";
    return "";
  }

  function validateService(value) {
    if (!value) return "Please select a plan.";
    return "";
  }

  function validateMessage(value) {
    const trimmed = value.trim();
    if (!trimmed) return "Please add a short message.";
    if (trimmed.length < 10) return "Message should be at least 10 characters.";
    return "";
  }

  const validators = {
    name: validateName,
    email: validateEmail,
    service: validateService,
    message: validateMessage,
  };

  function validateField(input) {
    const fn = validators[input.name];
    if (!fn) return true;
    const error = fn(input.value);
    if (error) {
      setFieldError(input, error);
      return false;
    }
    clearFieldError(input);
    return true;
  }

  /* Live validation on blur / input */
  if (form) {
    ["name", "email", "service", "message"].forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener("blur", function () {
        validateField(el);
      });

      el.addEventListener("input", function () {
        if (el.getAttribute("aria-invalid") === "true") {
          validateField(el);
        }
        if (successEl) successEl.classList.add("hidden");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const fields = ["name", "email", "service", "message"].map(function (id) {
        return document.getElementById(id);
      });

      let firstInvalid = null;
      let allValid = true;

      fields.forEach(function (field) {
        if (!field) return;
        const ok = validateField(field);
        if (!ok) {
          allValid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (!allValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      /* Simulated success (no backend) */
      const submitBtn = document.getElementById("submit-btn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      window.setTimeout(function () {
        form.reset();
        fields.forEach(function (field) {
          if (field) clearFieldError(field);
        });

        if (successEl) successEl.classList.remove("hidden");

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send message";
        }

        /* Optional: scroll success into view on small screens */
        if (successEl && window.matchMedia("(max-width: 768px)").matches) {
          successEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 650);
    });
  }
})();
