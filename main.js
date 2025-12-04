/* === Логика Шапки и Меню === */
const header = document.getElementById("header");
const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobile-menu");

// 1. Эффект стекла при скролле
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.classList.add("is-scrolled");
  } else {
    header.classList.remove("is-scrolled");
  }
});

// 2. Управление Меню
function toggleMenu() {
  const isExpanded = burgerBtn.getAttribute("aria-expanded") === "true";

  // Переключаем состояние (true/false)
  burgerBtn.setAttribute("aria-expanded", !isExpanded);
  mobileMenu.setAttribute("aria-hidden", isExpanded); // Инверсия

  // Добавляем класс для анимации крестика
  burgerBtn.classList.toggle("is-active");

  // Блокируем прокрутку сайта
  document.body.style.overflow = isExpanded ? "" : "hidden";
}

function closeMenu() {
  burgerBtn.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
  burgerBtn.classList.remove("is-active");
  document.body.style.overflow = "";
}
