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
    // Целимся в контейнер, который скроллится (в твоем HTML это wrapper)
    const sliderWrapper = document.querySelector(".gallery__carousel-wrapper");
    const prevBtn = document.querySelector(".js-gallery-prev");
    const nextBtn = document.querySelector(".js-gallery-next");

    if (!sliderWrapper || !prevBtn || !nextBtn) return;

    const scrollSlider = (direction) => {
      // Проверяем, активен ли режим скролла (на ПК overflow: visible)
      const style = window.getComputedStyle(sliderWrapper);
      if (style.overflowX !== "auto") return;

      const slide = sliderWrapper.querySelector(".gallery__slide");
      if (!slide) return;

      const slideWidth = slide.offsetWidth;
      // Получаем актуальный gap из CSS Grid
      const gap = parseInt(style.columnGap || style.gap || 0);
      // Скроллим на ширину одного слайда + gap
      const scrollAmount = slideWidth + gap;

      sliderWrapper.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    };

    nextBtn.addEventListener("click", () => scrollSlider("next"));
    prevBtn.addEventListener("click", () => scrollSlider("prev"));
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

  // --- Инициализация всех модулей ---
  initMobileMenu();
  initAccordion();
  initGallerySlider();
  initStickyBarObserver();
  initOrderForm();
});
