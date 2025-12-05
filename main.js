document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /**
   * =========================================================================
   * 0. Активная навигация (ScrollSpy)
   * =========================================================================
   */
  const initScrollSpy = () => {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav__link");

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.4,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove("is-current"));
          const activeLink = document.querySelector(
            `.nav__link[href="#${entry.target.id}"]`
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

  initScrollSpy();

  /**
   * =========================================================================
   * 1. Мобильное меню (Off-canvas Navigation)
   * =========================================================================
   */
  const initMobileMenu = () => {
    const menuToggles = document.querySelectorAll(".js-menu-toggle");
    const navWrapper = document.getElementById("navigation-wrapper");
    const burgerBtn = document.getElementById("burgerBtn");
    const menuLinks = document.querySelectorAll(".js-menu-link");

    if (!navWrapper || !burgerBtn) return;

    const toggleMenu = (forceClose = false) => {
      const isActive = navWrapper.classList.contains("is-active");
      const shouldOpen = forceClose ? false : !isActive;

      if (shouldOpen) {
        navWrapper.classList.add("is-active");
        burgerBtn.setAttribute("aria-expanded", "true");
        body.classList.add("no-scroll");
        document.addEventListener("keydown", handleEscape);
      } else {
        navWrapper.classList.remove("is-active");
        burgerBtn.setAttribute("aria-expanded", "false");
        if (!document.querySelector(".modal.is-visible")) {
          body.classList.remove("no-scroll");
        }
        document.removeEventListener("keydown", handleEscape);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        toggleMenu(true);
      }
    };

    menuToggles.forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
      });
    });

    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (navWrapper.classList.contains("is-active")) {
          toggleMenu(true);
        }
      });
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

    const slides = sliderWrapper.querySelectorAll(".gallery__slide");
    if (dotsContainer && slides.length > 0) {
      dotsContainer.innerHTML = "";
      slides.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.classList.add("gallery__dot");
        if (index === 0) dot.classList.add("is-active");
        dotsContainer.appendChild(dot);
      });

      sliderWrapper.addEventListener(
        "scroll",
        () => {
          const scrollLeft = sliderWrapper.scrollLeft;
          const slideWidth = slides[0].offsetWidth;
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
    // Здесь может быть логика появления кнопки "Купить" при скролле,
    // если она была в вашем оригинальном проекте.
  };

  /**
   * =========================================================================
   * 5. Логика формы заказа, Калькулятор и Модальное окно (ОБНОВЛЕНО)
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

    // --- 5.1. База данных изображений (Матрица 2x2) ---
    // - используем доступные файлы
    const imageMap = {
      red: {
        full: "media/RedStitch_Salon_Collage_v2.webp", // Красный + Полный
        front: "media/RedStitch_Front_Straight.webp", // Красный + Перед
      },
      black: {
        full: "media/Black_Salon_Collage.webp", // Черный + Полный
        front: "media/Black_Front_Pair_Best.webp", // Черный + Перед
      },
    };

    // --- 5.2. Функция обновления Картинки и Цены ---
    const updateProductState = () => {
      // 1. Получаем текущий выбор
      const selectedColorInput = document.querySelector(
        'input[name="color"]:checked'
      );
      const selectedKitInput = document.querySelector(
        'input[name="configuration"]:checked'
      );

      if (!selectedColorInput || !selectedKitInput) return;

      const colorKey = selectedColorInput.dataset.selectionColor; // 'red' или 'black'
      const kitKey = selectedKitInput.dataset.selectionKit; // 'full' или 'front'

      // 2. Обновляем картинку
      if (orderImage && imageMap[colorKey] && imageMap[colorKey][kitKey]) {
        const newSrc = imageMap[colorKey][kitKey];

        // Меняем только если путь отличается
        if (!orderImage.getAttribute("src").includes(newSrc)) {
          orderImage.classList.add("is-loading");

          setTimeout(() => {
            orderImage.src = newSrc;
            orderImage.onload = () => orderImage.classList.remove("is-loading");
            setTimeout(() => orderImage.classList.remove("is-loading"), 50); // Fallback
          }, 300);
        }
      }

      // 3. Обновляем цену
      if (priceNewEl && priceOldEl) {
        const newPrice = selectedKitInput.dataset.price;
        const oldPrice = selectedKitInput.dataset.oldPrice;

        // Простая анимация текста цены
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

    // Слушаем изменения на всех радиокнопках
    allSelectors.forEach((input) => {
      input.addEventListener("change", updateProductState);
    });

    // --- 5.3. Кнопки "Выбрать этот стиль" (скролл + выбор) ---
    const styleButtons = document.querySelectorAll(".js-select-color");
    styleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const colorKey = btn.dataset.color; // 'red' или 'black'
        const targetInput = document.getElementById(`color-${colorKey}`);

        if (targetInput) {
          targetInput.checked = true;
          // Принудительно запускаем обновление
          targetInput.dispatchEvent(new Event("change"));

          // Плавный скролл к форме
          const orderSection = document.getElementById("order");
          if (orderSection) {
            orderSection.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });

    // --- 5.4. Модальное окно ---
    let previousActiveElement = null;

    const openModal = (name) => {
      previousActiveElement = document.activeElement;
      successNameEl.textContent = name || "Клиент";
      modal.classList.add("is-visible");
      modal.setAttribute("aria-hidden", "false");
      body.classList.add("no-scroll");

      const firstBtn = modal.querySelector("button");
      if (firstBtn) firstBtn.focus();
      document.addEventListener("keydown", handleModalKeyboard);
    };

    const closeModal = () => {
      modal.classList.remove("is-visible");
      modal.setAttribute("aria-hidden", "true");

      const isMenuOpen = document
        .getElementById("navigation-wrapper")
        ?.classList.contains("is-active");
      if (!isMenuOpen) {
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

      // Добавляем актуальную цену в данные
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
          // Сброс состояния к дефолтному после отправки (опционально)
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
  initMobileMenu();
  initAccordion();
  initGallerySlider();
  initStickyBarObserver();
  initOrderForm();
  initReviewsSlider();
});
