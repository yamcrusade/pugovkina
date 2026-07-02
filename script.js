/* ============================================================
   ПУГОВКИНА — Ателье. Интерактив лендинга.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Хедер: фон при прокрутке ---------- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Мобильное меню ---------- */
  const burger = document.getElementById("burger");
  const nav = document.querySelector(".nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Галерея работ ---------- */
  const worksGrid = document.getElementById("worksGrid");
  if (worksGrid) {
    const works = [...worksGrid.querySelectorAll(".work")];
    const empty = document.getElementById("worksEmpty");
    let visible = works.length;

    // Проверяем наличие каждого фото зондом (не зависит от lazy-загрузки):
    // сначала .jpg, если нет — .png, если нет и его — скрываем слот.
    const probe = (src) =>
      new Promise((resolve) => {
        const t = new Image();
        t.onload = () => resolve(true);
        t.onerror = () => resolve(false);
        t.src = src;
      });

    works.forEach(async (fig) => {
      const img = fig.querySelector("img");
      const jpg = img.getAttribute("src");
      const png = jpg.replace(/\.jpg$/, ".png");
      if (await probe(jpg)) return;               // .jpg на месте
      if (await probe(png)) { img.src = png; return; } // нашёлся .png
      fig.classList.add("is-hidden");
      visible -= 1;
      if (visible === 0 && empty) empty.hidden = false;
    });

    /* Лайтбокс */
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightboxImg");
    const lbClose = document.getElementById("lightboxClose");
    const openLb = (src) => { lbImg.src = src; lb.hidden = false; document.body.style.overflow = "hidden"; };
    const closeLb = () => { lb.hidden = true; lbImg.src = ""; document.body.style.overflow = ""; };

    worksGrid.addEventListener("click", (e) => {
      const img = e.target.closest(".work img");
      if (img) openLb(img.src);
    });
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
    lbClose.addEventListener("click", closeLb);
    window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) closeLb(); });
  }

  /* ---------- Появление секций (reveal) ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Маска телефона ---------- */
  const phone = document.getElementById("phone");
  if (phone) {
    phone.addEventListener("input", () => {
      let d = phone.value.replace(/\D/g, "");
      if (d.startsWith("8")) d = "7" + d.slice(1);
      if (!d.startsWith("7")) d = "7" + d;
      d = d.slice(0, 11);
      let out = "+7";
      if (d.length > 1) out += " (" + d.slice(1, 4);
      if (d.length >= 4) out += ") " + d.slice(4, 7);
      if (d.length >= 7) out += "-" + d.slice(7, 9);
      if (d.length >= 9) out += "-" + d.slice(9, 11);
      phone.value = out;
    });
  }

  /* ---------- Отправка формы (демо) ---------- */
  const form = document.getElementById("bookForm");
  const status = document.getElementById("formStatus");
  if (form) {
    const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const clientName = form.elements["name"].value.trim();
      const tel = form.elements["phone"].value.replace(/\D/g, "");
      if (!clientName) { status.textContent = "Пожалуйста, укажите имя"; status.classList.remove("is-ok"); return; }
      if (tel.length < 11) { status.textContent = "Проверьте номер телефона"; status.classList.remove("is-ok"); return; }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      status.classList.remove("is-ok");
      status.textContent = "Отправляем…";

      try {
        if (!isLocal) {
          // Отправка заявки на почту клиента через FormSubmit
          const FORM_ENDPOINT = "https://formsubmit.co/ajax/olya.g.84@mail.ru";
          const res = await fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              _subject: "Заявка с сайта — Пуговкина Ателье",
              _template: "table",
              _honey: form.elements["_honey"].value,
              "Имя": form.elements["name"].value.trim(),
              "Телефон": form.elements["phone"].value,
              "Что нужно сделать": form.elements["task"].value.trim() || "—",
            }),
          });
          if (!res.ok) throw new Error("HTTP " + res.status);
        }
        status.classList.add("is-ok");
        status.textContent = "Спасибо! Мастер свяжется с вами в ближайшее время.";
        form.reset();
      } catch (err) {
        status.classList.remove("is-ok");
        status.textContent = "Не удалось отправить. Позвоните нам: +7 937 243-30-53";
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
