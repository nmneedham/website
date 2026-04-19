(function () {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");

  function setLabel(theme) {
    if (!btn) return;
    btn.textContent = theme === "dark" ? "light mode" : "dark mode";
  }

  const stored = localStorage.getItem("theme");
  if (stored) {
    if (stored === "dark") root.setAttribute("data-theme", "dark");
    setLabel(stored);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    setLabel("dark");
  } else {
    setLabel("light");
  }

  if (!btn) return;

  btn.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    if (isDark) {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      setLabel("light");
    } else {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      setLabel("dark");
    }
  });
})();
