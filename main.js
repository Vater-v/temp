document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /**
   * =========================================================================
   * 0. Активная навигация (ScrollSpy)
   * =========================================================================
   */
  const initScrollSpy = () => {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-desktop__link");

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove("is-current"));
          const activeLink = document.querySelector(
            `.nav-desktop__link[href="#${entry.target.id}"]`
          );
          if (activeLink) {
            activeLink.classList.add("is-current");
          }
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      observer.observe(section);
    });
  };

  /**
   * =========================================================================
   * 1. Мобильное меню (Portal Pattern + Scroll Lock)
   * =========================================================================
   */
  const initMobileMenu = () => {
    const selectors = {
      menu: "#mobile-menu-portal",
      trigger: ".js-menu-toggle",
      close: ".js-menu-close",
      link: ".js-menu-link",
      header: ".header",
    };

    const menu = document.querySelector(selectors.menu);
    if (!menu) return;

    const triggers = document.querySelectorAll(selectors.trigger);
    const header = document.querySelector(selectors.header);

    const lockScroll = () => {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      body.style.paddingRight = `${scrollbarWidth}px`;
      if (header) header.style.paddingRight = `${scrollbarWidth}px`;
      body.classList.add("no-scroll");
    };

    const unlockScroll = () => {
      if (document.querySelector(".modal.is-visible")) return;

      body.style.paddingRight = "";
      if (header) header.style.paddingRight = "";
      body.classList.remove("no-scroll");
    };

    const openMenu = () => {
      menu.classList.add("is-active");
      menu.removeAttribute("inert");
      menu.setAttribute("aria-hidden", "false");
      triggers.forEach((btn) => btn.setAttribute("aria-expanded", "true"));
      lockScroll();
    };

    const closeMenu = () => {
      menu.classList.remove("is-active");
      menu.setAttribute("inert", "");
      menu.setAttribute("aria-hidden", "true");
      triggers.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
      unlockScroll();
    };

    triggers.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.contains("is-active") ? closeMenu() : openMenu();
      });
    });

    menu.querySelectorAll(selectors.close).forEach((btn) => {
      btn.addEventListener("click", closeMenu);
    });

    menu.querySelectorAll(selectors.link).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-active")) {
        closeMenu();
      }
    });
  };

  /**
   * =========================================================================
   * 2. FAQ Аккордеон
   * =========================================================================
   */
  const initAccordion = () => {
    const accordion = document.getElementById("faq-accordion");
    if (!accordion) return;

    accordion.addEventListener("click", (e) => {
      const button = e.target.closest(".js-accordion-toggle");
      if (!button) return;

      const item = button.closest(".accordion__item");
      if (!item) return;

      const isExpanded = button.getAttribute("aria-expanded") === "true";
      const shouldOpen = !isExpanded;

      if (shouldOpen) {
        const openItems = accordion.querySelectorAll(
          ".accordion__item.is-open"
        );
        openItems.forEach((openItem) => {
          if (openItem !== item) {
            openItem.classList.remove("is-open");
            const btn = openItem.querySelector(".js-accordion-toggle");
            if (btn) btn.setAttribute("aria-expanded", "false");
          }
        });
      }

      button.setAttribute("aria-expanded", shouldOpen);
      if (shouldOpen) {
        item.classList.add("is-open");
      } else {
        item.classList.remove("is-open");
      }
    });
  };

  /**
   * =========================================================================
   * 3. Галерея (Слайдер) — ОПТИМИЗИРОВАНО (IntersectionObserver)
   * =========================================================================
   */
  const initGallerySlider = () => {
    const sliderWrapper = document.querySelector(".gallery__carousel-wrapper");
    const prevBtn = document.querySelector(".js-gallery-prev");
    const nextBtn = document.querySelector(".js-gallery-next");
    const dotsContainer = document.querySelector(".js-gallery-dots");

    if (!sliderWrapper) return;

    const scrollSlider = (direction) => {
      const slide = sliderWrapper.querySelector(".gallery__slide");
      if (!slide) return;

      const slideWidth = slide.offsetWidth;
      // Хардкод отступа для скорости, либо вычисляем один раз
      const gap = 24;
      const scrollAmount = slideWidth + gap;

      sliderWrapper.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    };

    if (prevBtn && nextBtn) {
      nextBtn.addEventListener("click", () => scrollSlider("next"));
      prevBtn.addEventListener("click", () => scrollSlider("prev"));
    }

    // Инициализация точек и Наблюдатель
    const slides = sliderWrapper.querySelectorAll(".gallery__slide");
    if (dotsContainer && slides.length > 0) {
      dotsContainer.innerHTML = "";
      const dots = [];

      slides.forEach((slide, index) => {
        const dot = document.createElement("div");
        dot.classList.add("gallery__dot");
        if (index === 0) dot.classList.add("is-active");

        // Клик по точке
        dot.addEventListener("click", () => {
          slide.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        });

        dotsContainer.appendChild(dot);
        dots.push(dot);
      });

      // Observer вместо scroll event
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Находим индекс слайда в коллекции
              const index = Array.from(slides).indexOf(entry.target);

              // Обновляем активный класс
              dots.forEach((d) => d.classList.remove("is-active"));
              if (dots[index]) dots[index].classList.add("is-active");
            }
          });
        },
        {
          root: sliderWrapper,
          threshold: 0.5, // Считать активным, если виден на 50%
        }
      );

      slides.forEach((slide) => observer.observe(slide));
    }
  };

  /**
   * =========================================================================
   * 6. Слайдер Отзывов — ОПТИМИЗИРОВАНО (IntersectionObserver)
   * =========================================================================
   */
  const initReviewsSlider = () => {
    const sliderWrapper = document.getElementById("reviews-list");
    const dotsContainer = document.querySelector(".js-reviews-dots");

    if (!sliderWrapper || !dotsContainer) return;

    const cards = sliderWrapper.querySelectorAll(".review-card");
    if (cards.length === 0) return;

    dotsContainer.innerHTML = "";
    const dots = [];

    cards.forEach((card, index) => {
      const dot = document.createElement("div");
      dot.classList.add("reviews__dot"); // Убедитесь, что стили для .reviews__dot есть в CSS (обычно общие с gallery__dot)
      // Если стилей нет, можно добавить класс gallery__dot
      if (!dot.classList.contains("reviews__dot"))
        dot.classList.add("gallery__dot");

      if (index === 0) dot.classList.add("is-active");

      dot.addEventListener("click", () => {
        card.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      });

      dotsContainer.appendChild(dot);
      dots.push(dot);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(cards).indexOf(entry.target);
            dots.forEach((d) => d.classList.remove("is-active"));
            if (dots[index]) dots[index].classList.add("is-active");
          }
        });
      },
      {
        root: sliderWrapper,
        threshold: 0.5,
      }
    );

    cards.forEach((card) => observer.observe(card));
  };

  /**
   * =========================================================================
   * 5. Логика формы заказа
   * =========================================================================
   */
  const initOrderForm = () => {
    const form = document.getElementById("main-order-form");
    const modal = document.getElementById("modal-success");
    const successNameEl = document.getElementById("success-name");
    const orderImage = document.getElementById("order-image");
    const priceNewEl = document.querySelector(".js-price-new");
    const priceOldEl = document.querySelector(".js-price-old");
    const allSelectors = document.querySelectorAll(
      'input[name="color"], input[name="configuration"]'
    );

    if (!form || !modal) return;

    const imageMap = {
      red: {
        full: "media/RedStitch_Salon_Collage_v2.webp",
        front: "media/RedStitch_Front_Straight.webp",
      },
      black: {
        full: "media/Black_Salon_Collage.webp",
        front: "media/Black_Front_Pair_Best.webp",
      },
    };

    const updateProductState = () => {
      const selectedColorInput = document.querySelector(
        'input[name="color"]:checked'
      );
      const selectedKitInput = document.querySelector(
        'input[name="configuration"]:checked'
      );

      if (!selectedColorInput || !selectedKitInput) return;

      const colorKey = selectedColorInput.dataset.selectionColor;
      const kitKey = selectedKitInput.dataset.selectionKit;

      if (orderImage && imageMap[colorKey] && imageMap[colorKey][kitKey]) {
        const newSrc = imageMap[colorKey][kitKey];
        if (!orderImage.getAttribute("src").includes(newSrc)) {
          orderImage.classList.add("is-loading");
          setTimeout(() => {
            orderImage.src = newSrc;
            orderImage.onload = () => orderImage.classList.remove("is-loading");
            setTimeout(() => orderImage.classList.remove("is-loading"), 50);
          }, 300);
        }
      }

      if (priceNewEl && priceOldEl) {
        const newPrice = selectedKitInput.dataset.price;
        const oldPrice = selectedKitInput.dataset.oldPrice;

        if (priceNewEl.textContent !== `${newPrice} руб.`) {
          priceNewEl.style.opacity = 0;
          setTimeout(() => {
            priceNewEl.textContent = `${newPrice} руб.`;
            priceOldEl.textContent = `${oldPrice} руб.`;
            priceNewEl.style.opacity = 1;
          }, 200);
        }
      }
    };

    allSelectors.forEach((input) => {
      input.addEventListener("change", updateProductState);
    });

    const styleButtons = document.querySelectorAll(".js-select-color");
    styleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const colorKey = btn.dataset.color;
        const targetInput = document.getElementById(`color-${colorKey}`);
        if (targetInput) {
          targetInput.checked = true;
          targetInput.dispatchEvent(new Event("change"));
          const orderSection = document.getElementById("order");
          if (orderSection) {
            orderSection.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });

    let previousActiveElement = null;

    const openModal = (name) => {
      previousActiveElement = document.activeElement;
      successNameEl.textContent = name || "Клиент";
      modal.classList.add("is-visible");
      modal.setAttribute("aria-hidden", "false");

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      body.style.paddingRight = `${scrollbarWidth}px`;
      const header = document.querySelector(".header");
      if (header) header.style.paddingRight = `${scrollbarWidth}px`;
      body.classList.add("no-scroll");

      const firstBtn = modal.querySelector("button");
      if (firstBtn) firstBtn.focus();
      document.addEventListener("keydown", handleModalKeyboard);
    };

    const closeModal = () => {
      modal.classList.remove("is-visible");
      modal.setAttribute("aria-hidden", "true");

      const isMenuOpen = document
        .getElementById("mobile-menu-portal")
        ?.classList.contains("is-active");
      if (!isMenuOpen) {
        body.style.paddingRight = "";
        const header = document.querySelector(".header");
        if (header) header.style.paddingRight = "";
        body.classList.remove("no-scroll");
      }

      if (previousActiveElement) previousActiveElement.focus();
      document.removeEventListener("keydown", handleModalKeyboard);
    };

    const handleModalKeyboard = (e) => {
      if (e.key === "Escape") closeModal();
    };

    modal.querySelectorAll(".js-modal-close").forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      const activeKit = document.querySelector(
        'input[name="configuration"]:checked'
      );
      if (activeKit) {
        data.total_price = activeKit.dataset.price;
      }

      try {
        const response = await fetch("/send-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          openModal(data.name);
          form.reset();
          updateProductState();
        } else {
          alert("Ошибка при отправке заказа. Попробуйте позже.");
        }
      } catch (error) {
        console.error("Ошибка:", error);
        alert("Не удалось соединиться с сервером.");
      }
    });
  };

  // --- Инициализация ---
  initScrollSpy();
  initMobileMenu();
  initAccordion();
  initGallerySlider();
  initOrderForm();
  initReviewsSlider();
});
