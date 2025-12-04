document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /**
   * =========================================================================
   * 1. Мобильное меню (Off-canvas Navigation)
   * =========================================================================
   * (Логика меню оставлена как в оригинале, но добавлена проверка на открытую модалку при снятии no-scroll)
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
        // Снимаем блокировку скролла, только если модалка тоже закрыта
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
   * 2. FAQ Аккордеон (FIXED)
   * =========================================================================
   * Исправлено: Теперь JS добавляет класс .is-open родительскому элементу
   * .accordion__item, так как CSS не может дотянуться до контента изнутри H3.
   */
  const initAccordion = () => {
    const accordion = document.getElementById("faq-accordion");
    if (!accordion) return;

    // Используем делегирование событий
    accordion.addEventListener("click", (e) => {
      const button = e.target.closest(".js-accordion-toggle");
      if (!button) return;

      // Находим родительский контейнер пункта (.accordion__item)
      const item = button.closest(".accordion__item");
      if (!item) return;

      const isExpanded = button.getAttribute("aria-expanded") === "true";
      const shouldOpen = !isExpanded;

      // Обновляем атрибут доступности на кнопке
      button.setAttribute("aria-expanded", shouldOpen);

      // Управляем классом состояния на родительском элементе
      // CSS использует этот класс для анимации открытия (grid-template-rows).
      if (shouldOpen) {
        item.classList.add("is-open");
      } else {
        item.classList.remove("is-open");
      }
    });
  };

  /**
   * =========================================================================
   * 3. Галерея (Горизонтальный скролл) (REFACTORED)
   * =========================================================================
   * Оптимизировано для работы с новым CSS Grid скроллом и существующим HTML.
   */
  const initGallerySlider = () => {
    const sliderWrapper = document.querySelector(".gallery__carousel-wrapper");
    const prevBtn = document.querySelector(".js-gallery-prev");
    const nextBtn = document.querySelector(".js-gallery-next");
    const dotsContainer = document.querySelector(".js-gallery-dots");

    if (!sliderWrapper) return;

    // --- 1. Логика кнопок (существующая) ---
    const scrollSlider = (direction) => {
      const style = window.getComputedStyle(sliderWrapper);
      // Если на ПК (grid) скролл не нужен, выходим (опционально)
      // if (style.overflowX !== "auto") return;

      const slide = sliderWrapper.querySelector(".gallery__slide");
      if (!slide) return;

      const slideWidth = slide.offsetWidth;
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

    // --- 2. Логика точек (новая) ---
    const slides = sliderWrapper.querySelectorAll(".gallery__slide");

    if (dotsContainer && slides.length > 0) {
      // Очищаем контейнер перед генерацией
      dotsContainer.innerHTML = "";

      // Генерируем точки
      slides.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.classList.add("gallery__dot");
        // Первая точка активна сразу
        if (index === 0) dot.classList.add("is-active");
        dotsContainer.appendChild(dot);
      });

      // Слушаем скролл для переключения активной точки
      sliderWrapper.addEventListener(
        "scroll",
        () => {
          const scrollLeft = sliderWrapper.scrollLeft;
          const slideWidth = slides[0].offsetWidth; // Ширина слайда
          // Вычисляем индекс центрального слайда
          // Добавляем половину ширины слайда к scrollLeft для точности
          const centerIndex = Math.round(scrollLeft / slideWidth);

          const dots = document.querySelectorAll(".gallery__dot");
          dots.forEach((dot, index) => {
            // Защита от выхода за пределы массива
            if (index === centerIndex) {
              dot.classList.add("is-active");
            } else {
              dot.classList.remove("is-active");
            }
          });
        },
        { passive: true }
      ); // passive для производительности скролла
    }
  };

  /**
   * =========================================================================
   * 4. Sticky Bar Observer
   * =========================================================================
   */
  const initStickyBarObserver = () => {
    // (Логика оставлена как в оригинале, так как она рабочая)
    // ... (код из оригинала) ...
  };

  /**
   * =========================================================================
   * 5. Логика формы заказа и Модальное окно (REFACTORED)
   * =========================================================================
   */
  const initOrderForm = () => {
    const form = document.getElementById("main-order-form");
    const modal = document.getElementById("modal-success");
    const successNameEl = document.getElementById("success-name");

    // (Логика калькулятора и выбора цвета опущена, так как она рабочая)

    if (!form || !modal) return;

    // --- 5.3. Модальное окно (Улучшено для A11y) ---
    let previousActiveElement = null;

    const openModal = (name) => {
      // Сохраняем активный элемент перед открытием (для возврата фокуса)
      previousActiveElement = document.activeElement;

      successNameEl.textContent = name || "Клиент";
      modal.classList.add("is-visible");
      modal.setAttribute("aria-hidden", "false");
      body.classList.add("no-scroll");

      // Перемещаем фокус внутрь модалки (на первую кнопку)
      const firstFocusableElement = modal.querySelector("button");
      if (firstFocusableElement) {
        firstFocusableElement.focus();
      }

      document.addEventListener("keydown", handleModalKeyboard);
    };

    const closeModal = () => {
      modal.classList.remove("is-visible");
      modal.setAttribute("aria-hidden", "true");

      // Снимаем блокировку скролла, если мобильное меню также закрыто
      const isMenuOpen = document
        .getElementById("navigation-wrapper")
        ?.classList.contains("is-active");
      if (!isMenuOpen) {
        body.classList.remove("no-scroll");
      }

      // Возвращаем фокус на элемент, который был активен до открытия
      if (previousActiveElement) {
        previousActiveElement.focus();
      }

      document.removeEventListener("keydown", handleModalKeyboard);
    };

    const handleModalKeyboard = (e) => {
      // Закрытие по Escape
      if (e.key === "Escape") {
        closeModal();
      }
    };

    // Назначаем обработчики на все элементы закрытия (кнопки, оверлей)
    modal.querySelectorAll(".js-modal-close").forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });

    // --- 5.4. Отправка формы (Симуляция) ---
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // (Логика отправки формы должна быть здесь)

      // Демонстрация работы модалки при отправке
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Имитация успешной отправки
      console.log("Form submitted (simulation)", data);
      openModal(data.name);
      form.reset();
    });
  };

  /**
   * =========================================================================
   * 6. Слайдер Отзывов (NEW: Dots + Logic)
   * =========================================================================
   */
  const initReviewsSlider = () => {
    const sliderWrapper = document.getElementById("reviews-list");
    const dotsContainer = document.querySelector(".js-reviews-dots");

    if (!sliderWrapper || !dotsContainer) return;

    const cards = sliderWrapper.querySelectorAll(".review-card");
    if (cards.length === 0) return;

    // 1. Генерируем точки
    dotsContainer.innerHTML = "";
    cards.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.classList.add("reviews__dot"); // Используем отдельный класс или общий с галереей
      if (index === 0) dot.classList.add("is-active");
      dotsContainer.appendChild(dot);
    });

    // 2. Слушаем скролл
    sliderWrapper.addEventListener(
      "scroll",
      () => {
        const scrollLeft = sliderWrapper.scrollLeft;
        const cardWidth = cards[0].offsetWidth;
        const style = window.getComputedStyle(sliderWrapper);
        const gap = parseInt(style.columnGap || style.gap || 0);

        // Учитываем gap при расчете центра
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

  // --- Инициализация всех модулей ---
  initMobileMenu();
  initAccordion();
  initGallerySlider();
  initStickyBarObserver();
  initOrderForm();
  initReviewsSlider(); // <--- Не забудьте добавить этот вызов!
});
