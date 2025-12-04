document.addEventListener("DOMContentLoaded", function () {
    // ---------------------------------------------------------
    // --- 1. FAQ Аккордеон ---
    // ---------------------------------------------------------
    const accordionHeaders = document.querySelectorAll(".accordion-header");

    accordionHeaders.forEach((header) => {
        header.addEventListener("click", function () {
            const content = this.nextElementSibling;
            const isActive = this.classList.contains("active");

            document
                .querySelectorAll(".accordion-header.active")
                .forEach((otherHeader) => {
                    if (otherHeader !== this) {
                        otherHeader.classList.remove("active");
                        otherHeader.nextElementSibling.style.maxHeight = null;
                        otherHeader.setAttribute("aria-expanded", "false");
                    }
                });

            if (isActive) {
                content.style.maxHeight = null;
                this.classList.remove("active");
                this.setAttribute("aria-expanded", "false");
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                this.classList.add("active");
                this.setAttribute("aria-expanded", "true");
            }
        });
    });

    // ---------------------------------------------------------
    // --- 2. Плавный скролл ---
    // ---------------------------------------------------------
    const header = document.querySelector(".header");
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (href.length > 1 && href.startsWith("#")) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    // Закрываем мобильное меню если оно было бы (на будущее)
                    const headerOffset =
                        header &&
                        window.getComputedStyle(header).display !== "none"
                            ? header.offsetHeight
                            : 0;

                    const targetPosition =
                        target.getBoundingClientRect().top +
                        window.pageYOffset -
                        headerOffset -
                        20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: "smooth",
                    });
                }
            }
        });
    });

    // ---------------------------------------------------------
    // --- 3. Логика формы (Цвет и Цены) ---
    // ---------------------------------------------------------
    // (Код оставлен без изменений для краткости, он работает корректно)
    const styleButtons = document.querySelectorAll(".style-card .btn");
    styleButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const color = this.getAttribute("data-color");
            const rb = document.getElementById(
                color === "red" ? "color-red" : "color-black"
            );
            if (rb) rb.checked = true;
        });
    });

    const kitRadios = document.getElementsByName("kit");
    const newPriceElement = document.querySelector(".new-price");
    const oldPriceElement = document.querySelector(".old-price");
    const priceNoteElement = document.querySelector(".price-note");
    const PRICES = {
        full: {
            new: "3990 руб.",
            old: "5990 руб.",
            note: "* Цена указана за полный комплект",
        },
        front: {
            new: "2490 руб.",
            old: "3990 руб.",
            note: "* Цена указана за передний комплект",
        },
    };

    function updatePrices(kit) {
        if (PRICES[kit]) {
            newPriceElement.textContent = PRICES[kit].new;
            oldPriceElement.textContent = PRICES[kit].old;
            priceNoteElement.textContent = PRICES[kit].note;
        }
    }
    kitRadios.forEach((radio) =>
        radio.addEventListener("change", function () {
            updatePrices(this.value);
        })
    );

    // ---------------------------------------------------------
    // --- 4. Обработка отправки формы ---
    // ---------------------------------------------------------
    const orderForm = document.querySelector(".order-form");
    if (orderForm) {
        orderForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(orderForm);
            const citySelect = document.getElementById("city");
            const cityName = citySelect.options[citySelect.selectedIndex].text;

            const dataToSend = {
                name: formData.get("name"),
                phone: formData.get("phone"),
                city: cityName,
                color:
                    formData.get("color") === "red"
                        ? "Красная строчка"
                        : "Черная классика",
                configuration:
                    formData.get("kit") === "full"
                        ? "Полный комплект"
                        : "Только передние",
                total_price: document.querySelector(".new-price").textContent,
            };

            const modal = document.getElementById("modal-success");
            const nameSpan = document.getElementById("success-name");

            if (modal && nameSpan) {
                nameSpan.textContent = dataToSend.name;
                modal.classList.add("is-open");
                document.body.style.overflow = "hidden";
            } else {
                alert(`Спасибо, ${dataToSend.name}! Заказ принят.`);
            }

            // fetch('/send-order', ... ) // Раскомментировать для продакшена

            orderForm.reset();
            document.getElementById("color-red").checked = true;
            document.getElementById("kit-full").checked = true;
            updatePrices("full");
        });
    }

    window.closeModal = function () {
        const modal = document.getElementById("modal-success");
        if (modal) {
            modal.classList.remove("is-open");
            document.body.style.overflow = "";
        }
    };
    const modalOverlay = document.getElementById("modal-success");
    if (modalOverlay) {
        modalOverlay.addEventListener("click", function (e) {
            if (e.target === this) window.closeModal();
        });
    }

    // ---------------------------------------------------------
    // --- 6. Умный Хедер и ScrollSpy (PERFORMANCE V2.0) ---
    // ---------------------------------------------------------
    const headerEl = document.querySelector(".header");
    const navLinks = document.querySelectorAll(".nav-desktop a:not(.btn-nav)");
    const sections = document.querySelectorAll("section");

    // A. Оптимизация Хедера (requestAnimationFrame)
    let ticking = false;
    function updateHeaderState() {
        if (headerEl) {
            if (window.scrollY > 50) headerEl.classList.add("scrolled");
            else headerEl.classList.remove("scrolled");
        }
        ticking = false;
    }

    window.addEventListener(
        "scroll",
        function () {
            if (!ticking) {
                window.requestAnimationFrame(updateHeaderState);
                ticking = true;
            }
        },
        { passive: true }
    );

    // B. Оптимизация подсветки меню (IntersectionObserver)
    // Это полностью снимает нагрузку с JS при скролле
    const observerOptions = {
        root: null,
        // Считаем секцию активной, когда она пересекает центр экрана
        rootMargin: "-40% 0px -60% 0px",
        threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                navLinks.forEach((link) => link.classList.remove("active"));
                const id = entry.target.getAttribute("id");
                const activeLink = document.querySelector(
                    `.nav-desktop a[href="#${id}"]`
                );
                if (activeLink) activeLink.classList.add("active");
            }
        });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    // Инициализация хедера при загрузке
    updateHeaderState();
});
