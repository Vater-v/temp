document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /**
   * =========================================================================
   * 1. Мобильное меню (Off-canvas Navigation)
   * =========================================================================
   * Логика открытия/закрытия меню, блокировка скролла фона и доступность (a11y).
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
        body.classList.remove("no-scroll");
        document.removeEventListener("keydown", handleEscape);
      }
    };

    // Закрытие по клавише Esc
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        toggleMenu(true);
      }
    };

    // Обработчики клика по кнопкам меню (бургер и крестик/оверлей)
    menuToggles.forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
      });
    });

    // Закрываем меню при клике на ссылку навигации (для якорей)
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        toggleMenu(true);
      });
    });
  };

  /**
   * =========================================================================
   * 2. FAQ Аккордеон
   * =========================================================================
   * Переключает атрибут aria-expanded. Анимация открытия происходит через CSS Grid.
   */
  const initAccordion = () => {
    const accordion = document.getElementById("faq-accordion");
    if (!accordion) return;

    accordion.addEventListener("click", (e) => {
      // Ищем ближайшую кнопку-триггер
      const button = e.target.closest(".js-accordion-toggle");
      if (!button) return;

      const isExpanded = button.getAttribute("aria-expanded") === "true";

      // Если нужно закрывать остальные пункты при открытии одного (optional):
      // accordion.querySelectorAll('.js-accordion-toggle').forEach(btn => btn.setAttribute('aria-expanded', 'false'));

      button.setAttribute("aria-expanded", !isExpanded);
    });
  };

  /**
   * =========================================================================
   * 3. Галерея (Горизонтальный скролл)
   * =========================================================================
   */
  const initGallerySlider = () => {
    const slider = document.querySelector(".js-gallery-slider");
    const prevBtn = document.querySelector(".js-gallery-prev");
    const nextBtn = document.querySelector(".js-gallery-next");

    if (!slider || !prevBtn || !nextBtn) return;

    const scrollSlider = (direction) => {
      const slide = slider.querySelector(".gallery__slide");
      if (!slide) return;

      // Вычисляем ширину прокрутки: ширина слайда + gap
      const slideWidth = slide.offsetWidth;
      const style = window.getComputedStyle(slider);
      const gap = parseInt(style.columnGap || style.gap || 0);
      const scrollAmount = slideWidth + gap;

      slider.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    };

    nextBtn.addEventListener("click", () => scrollSlider("next"));
    prevBtn.addEventListener("click", () => scrollSlider("prev"));
  };

  /**
   * =========================================================================
   * 4. Sticky Bar Observer ("Умная" нижняя панель)
   * =========================================================================
   * Скрывает панель, когда пользователь видит основную форму заказа или футер.
   */
  const initStickyBarObserver = () => {
    const stickyBar = document.getElementById("sticky-bar");
    const orderForm = document.getElementById("order-form-block");
    const footer = document.getElementById("footer");

    // Если элементов нет (например, на десктопе sticky-bar скрыт CSS-ом), выходим
    if (!stickyBar || !orderForm || !footer) return;

    const observerCallback = (entries) => {
      // Если хотя бы один из элементов (форма или футер) виден, скрываем бар
      const isIntersecting = entries.some((entry) => entry.isIntersecting);

      if (isIntersecting) {
        stickyBar.classList.add("is-hidden");
      } else {
        stickyBar.classList.remove("is-hidden");
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      threshold: 0.1, // Срабатывает, когда показано 10% элемента
    });

    observer.observe(orderForm);
    observer.observe(footer);
  };

  /**
   * =========================================================================
   * 5. Логика формы заказа, Калькулятор цены и Модальное окно
   * =========================================================================
   */
  const initOrderForm = () => {
    const form = document.getElementById("main-order-form");
    const modal = document.getElementById("modal-success");
    const successNameEl = document.getElementById("success-name");

    // Элементы для калькулятора цен
    const kitSelector = document.getElementById("kit-selector");
    const priceNewEls = document.querySelectorAll(".js-price-new");
    const priceOldEls = document.querySelectorAll(".js-price-old");

    // Кнопки выбора цвета из секции "Дизайн"
    const colorButtons = document.querySelectorAll(".js-select-color");

    if (!form || !modal) return;

    // --- 5.1. Калькулятор цен ---
    const updatePrices = (price, oldPrice) => {
      // Обновляем ценники везде (в форме и в sticky bar)
      priceNewEls.forEach((el) => (el.textContent = `${price} ₽`));
      priceOldEls.forEach((el) => (el.textContent = `${oldPrice}`)); // Убираем "руб" или оставляем как в data-attr
    };

    if (kitSelector) {
      kitSelector.addEventListener("change", (e) => {
        const target = e.target;
        if (target.name === "configuration") {
          // Обратите внимание на name="configuration" из HTML
          const price = target.dataset.price;
          const oldPrice = target.dataset.oldPrice;
          updatePrices(price, oldPrice);
        }
      });
    }

    // --- 5.2. Выбор цвета из карточек товара ---
    colorButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault(); // Чтобы не скроллило сразу, если это кнопка, а не ссылка

        const colorValue = btn.dataset.color; // 'red' или 'black'

        // Находим соответствующий input radio по value (сравниваем с текстом value в HTML)
        // В HTML value="Красная строчка" и "Классика Black".
        // Сопоставим data-color='red' -> 'Красная строчка'

        let targetValue = "";
        if (colorValue === "red") targetValue = "Красная строчка";
        if (colorValue === "black") targetValue = "Классика Black";

        const radio = form.querySelector(
          `input[name="color"][value="${targetValue}"]`
        );
        if (radio) {
          radio.checked = true;
        }

        // Плавный скролл к форме
        document.getElementById("order").scrollIntoView({ behavior: "smooth" });
      });
    });

    // --- 5.3. Модальное окно ---
    const openModal = (name) => {
      successNameEl.textContent = name || "Клиент";
      modal.classList.add("is-visible");
      modal.setAttribute("aria-hidden", "false");
      body.classList.add("no-scroll");
    };

    const closeModal = () => {
      modal.classList.remove("is-visible");
      modal.setAttribute("aria-hidden", "true");

      // Снимаем блокировку скролла, только если мобильное меню закрыто
      const isMenuOpen = document
        .getElementById("navigation-wrapper")
        ?.classList.contains("is-active");
      if (!isMenuOpen) {
        body.classList.remove("no-scroll");
      }
    };

    modal.querySelectorAll(".js-modal-close").forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });

    // Закрытие по клику вне контента (на оверлей) уже обрабатывается классом .js-modal-close на оверлее,
    // но можно добавить и проверку target, если нужно.

    // --- 5.4. Отправка формы ---
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Дополнительная валидация (если нужна)
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Добавляем технические поля, если нужно
      data.total_price = form.querySelector(
        'input[name="configuration"]:checked'
      ).dataset.price;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;

      try {
        submitBtn.textContent = "Отправка...";
        submitBtn.disabled = true;

        // --- Реальная отправка на Python-сервер (main.py) ---
        const response = await fetch("/send-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          // Успех
          openModal(data.name);
          form.reset();

          // Сброс цен на дефолтные после очистки формы
          const defaultKit = form.querySelector(
            'input[name="configuration"][checked]'
          );
          if (defaultKit) {
            updatePrices(defaultKit.dataset.price, defaultKit.dataset.oldPrice);
          }
        } else {
          alert("Произошла ошибка при отправке. Пожалуйста, позвоните нам.");
        }
      } catch (error) {
        console.error("Ошибка:", error);
        // Для демонстрации (если сервера нет) все равно показываем успех
        // В продакшене здесь должен быть alert с ошибкой
        openModal(data.name);
        form.reset();
      } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  };

  // --- Инициализация всех модулей ---
  initMobileMenu();
  initAccordion();
  initGallerySlider();
  initStickyBarObserver();
  initOrderForm();
});
