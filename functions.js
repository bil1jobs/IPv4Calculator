let nightModeButton = document.getElementById("nightMode");
let reloadButton = document.getElementById("reload");
let root = document.querySelector(":root");
let r = getComputedStyle(root);

nightModeButton.addEventListener("click", () => {
  let firstColor = r.getPropertyValue("--firstColor");
  if (firstColor == "#222") {
    root.style.setProperty("--firstColor", " #fff");
    root.style.setProperty("--secondColor", " #222");
    root.style.setProperty("--grange", " rgb(111, 148, 48)");
    nightModeButton.innerHTML =
      '<img src="Icons/light.png" alt="light mode button"/>';
  } else {
    root.style.setProperty("--firstColor", " #222");
    root.style.setProperty("--secondColor", " #fff");
    root.style.setProperty("--grange", " rgb(248, 71, 71)");
    nightModeButton.innerHTML =
      '<img src="Icons/dark.png" alt="dark mode button"/>';
  }
});
reloadButton.addEventListener("click", () => {
  location.reload();
});
window.onload = () => {
  reloadButton.classList.add("transition-reload");
};
