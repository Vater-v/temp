document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /**
   * =========================================================================
   * 0. Активная навигация (ScrollSpy)
   * =========================================================================
   */
  const initScrollSpy = () => {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-desktop__link"); // Обновил класс для десктопа

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Активная зона ближе к верху
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Удаляем активный класс у всех ссылок
          navLinks.forEach((link) => link.classList.remove("is-current"));

          // Ищем ссылку, ведущую на эту секцию
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
   * 1. Мобильное меню (Portal Pattern + Scroll Lock) — ОБНОВЛЕНО
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

    // --- Helper: Блокировка скролла без дерганья экрана ---
    const lockScroll = () => {
      // 1. Вычисляем ширину скроллбара
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // 2. Компенсируем исчезновение скролла отступом
      body.style.paddingRight = `${scrollbarWidth}px`;
      if (header) header.style.paddingRight = `${scrollbarWidth}px`;

      // 3. Блокируем
      body.classList.add("no-scroll");
    };

    const unlockScroll = () => {
      // Разблокируем, только если нет открытых модалок (например, "Успех")
      if (document.querySelector(".modal.is-visible")) return;

      body.style.paddingRight = "";
      if (header) header.style.paddingRight = "";

      body.classList.remove("no-scroll");
    };

    // --- Логика Открытия/Закрытия ---
    const openMenu = () => {
      menu.classList.add("is-active");

      // A11y: Меню становится доступным
      menu.removeAttribute("inert");
      menu.setAttribute("aria-hidden", "false");

      // Анимация иконки бургера
      triggers.forEach((btn) => btn.setAttribute("aria-expanded", "true"));

      lockScroll();
    };

    const closeMenu = () => {
      menu.classList.remove("is-active");

      // A11y: Меню становится недоступным
      menu.setAttribute("inert", "");
      menu.setAttribute("aria-hidden", "true");

      triggers.forEach((btn) => btn.setAttribute("aria-expanded", "false"));

      unlockScroll();
    };

    // --- Слушатели событий ---

    // 1. Клик по бургеру
    triggers.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.contains("is-active") ? closeMenu() : openMenu();
      });
    });

    // 2. Кнопки закрытия (крестик + оверлей)
    menu.querySelectorAll(selectors.close).forEach((btn) => {
      btn.addEventListener("click", closeMenu);
    });

    // 3. Навигация по ссылкам внутри меню
    menu.querySelectorAll(selectors.link).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // 4. Закрытие по Escape
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

      // Закрываем другие (аккордеон)
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
   * 3. Галерея (Слайдер)
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
      const style = window.getComputedStyle(sliderWrapper);
      const gap = parseInt(style.columnGap || style.gap || 0);
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

    // Инициализация точек (dots)
    const slides = sliderWrapper.querySelectorAll(".gallery__slide");
    if (dotsContainer && slides.length > 0) {
      dotsContainer.innerHTML = "";
      slides.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.classList.add("gallery__dot");
        if (index === 0) dot.classList.add("is-active");
        dotsContainer.appendChild(dot);
      });

      // Синхронизация точек при скролле
      sliderWrapper.addEventListener(
        "scroll",
        () => {
          const scrollLeft = sliderWrapper.scrollLeft;
          const slideWidth = slides[0].offsetWidth;
          // Добавляем половину ширины для более точного определения центра
          const centerIndex = Math.round(scrollLeft / slideWidth);

          const dots = document.querySelectorAll(".gallery__dot");
          dots.forEach((dot, index) => {
            if (index === centerIndex) {
              dot.classList.add("is-active");
            } else {
              dot.classList.remove("is-active");
            }
          });
        },
        { passive: true }
      );
    }
  };

  /**
   * =========================================================================
   * 4. Sticky Bar Observer (Placeholder)
   * =========================================================================
   */
  const initStickyBarObserver = () => {
    // Место для логики плавающей кнопки "Купить" (если потребуется)
  };

  /**
   * =========================================================================
   * 5. Логика формы заказа, Калькулятор и Модальное окно
   * =========================================================================
   */
  const initOrderForm = () => {
    const form = document.getElementById("main-order-form");
    const modal = document.getElementById("modal-success");
    const successNameEl = document.getElementById("success-name");

    // Элементы для смены картинки и цены
    const orderImage = document.getElementById("order-image");
    const priceNewEl = document.querySelector(".js-price-new");
    const priceOldEl = document.querySelector(".js-price-old");
    const allSelectors = document.querySelectorAll(
      'input[name="color"], input[name="configuration"]'
    );

    if (!form || !modal) return;

    // --- 5.1. База данных изображений ---
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

    // --- 5.2. Функция обновления Картинки и Цены ---
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

      // Смена картинки
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

      // Смена цены
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

    // Слушаем изменения
    allSelectors.forEach((input) => {
      input.addEventListener("change", updateProductState);
    });

    // --- 5.3. Кнопки "Выбрать этот стиль" ---
    const styleButtons = document.querySelectorAll(".js-select-color");
    styleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const colorKey = btn.dataset.color;
        const targetInput = document.getElementById(`color-${colorKey}`);

        if (targetInput) {
          targetInput.checked = true;
          targetInput.dispatchEvent(new Event("change")); // Триггер обновления

          const orderSection = document.getElementById("order");
          if (orderSection) {
            orderSection.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });

    // --- 5.4. Модальное окно (Success) ---
    let previousActiveElement = null;

    const openModal = (name) => {
      previousActiveElement = document.activeElement;
      successNameEl.textContent = name || "Клиент";
      modal.classList.add("is-visible");
      modal.setAttribute("aria-hidden", "false");

      // Блокируем скролл, используя ту же логику отступов, что и в меню
      // (Можно было бы вынести lockScroll в общую утилиту, но дублируем для надежности здесь)
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      body.style.paddingRight = `${scrollbarWidth}px`;
      const header = document.querySelector(".header");
      if (header) header.style.paddingRight = `${scrollbarWidth}px`;
      body.classList.add("no-scroll");

      // Фокус на кнопке внутри модалки
      const firstBtn = modal.querySelector("button");
      if (firstBtn) firstBtn.focus();
      document.addEventListener("keydown", handleModalKeyboard);
    };

    const closeModal = () => {
      modal.classList.remove("is-visible");
      modal.setAttribute("aria-hidden", "true");

      // Проверяем, открыто ли мобильное меню (ID ОБНОВЛЕН)
      const isMenuOpen = document
        .getElementById("mobile-menu-portal")
        ?.classList.contains("is-active");

      // Если меню не открыто, снимаем блокировку скролла
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

    // --- 5.5. Отправка формы ---
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Добавляем цену
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
          updateProductState(); // Сброс к дефолту
        } else {
          alert("Ошибка при отправке заказа. Попробуйте позже.");
        }
      } catch (error) {
        console.error("Ошибка:", error);
        alert("Не удалось соединиться с сервером.");
      }
    });
  };

  /**
   * =========================================================================
   * 6. Слайдер Отзывов
   * =========================================================================
   */
  const initReviewsSlider = () => {
    const sliderWrapper = document.getElementById("reviews-list");
    const dotsContainer = document.querySelector(".js-reviews-dots");

    if (!sliderWrapper || !dotsContainer) return;

    const cards = sliderWrapper.querySelectorAll(".review-card");
    if (cards.length === 0) return;

    dotsContainer.innerHTML = "";
    cards.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.classList.add("reviews__dot");
      if (index === 0) dot.classList.add("is-active");
      dotsContainer.appendChild(dot);
    });

    sliderWrapper.addEventListener(
      "scroll",
      () => {
        const scrollLeft = sliderWrapper.scrollLeft;
        const cardWidth = cards[0].offsetWidth;
        const style = window.getComputedStyle(sliderWrapper);
        const gap = parseInt(style.columnGap || style.gap || 0);
        // Добавляем смещение для точности
        const centerIndex = Math.round(scrollLeft / (cardWidth + gap));

        const dots = document.querySelectorAll(".reviews__dot");
        dots.forEach((dot, index) => {
          if (index === centerIndex) {
            dot.classList.add("is-active");
          } else {
            dot.classList.remove("is-active");
          }
        });
      },
      { passive: true }
    );
  };

  // --- Инициализация ---
  initScrollSpy();
  initMobileMenu();
  initAccordion();
  initGallerySlider();
  initStickyBarObserver();
  initOrderForm();
  initReviewsSlider();
});
