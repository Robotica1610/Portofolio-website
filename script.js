// Page elements
const themeRoot = document.documentElement;
const darkmodecheckbox = document.getElementById("darkmode");
const lightmodecheckbox = document.getElementById("lightmode");
const splashTextCheckbox = document.getElementById("splashtext");
const splashText = document.getElementById("splash");
const marqueemsg = document.getElementById("marquee-msg");
const clock = document.getElementById("clock");

// Header controls
function closeheader() {
    document.querySelector(".nav-header").classList.toggle("header-hidden");
    document.getElementById("close-header").classList.toggle("header-hidden");
}

// Marks the current navigation link
const currentPage = window.location.pathname.split("/").pop().toLowerCase() || "index.html";

document.querySelectorAll(".nav-header a[href]").forEach(function (link) {
    const linkPage = link.getAttribute("href").split("/").pop().toLowerCase();

    if (linkPage === currentPage) {
        link.setAttribute("aria-current", "page");
    }
});

// Theme elements and saved values
const themeColor = document.querySelector("#theme-color");
const colorPresets = document.querySelectorAll(".color-preset");
const savedThemeColor = localStorage.getItem("themeColor");
const defaultThemeColor = "#00c91e";
const darkModeEnabled = localStorage.getItem("darkMode") === "enabled";
const lightModeEnabled = !darkModeEnabled && localStorage.getItem("lightmode") === "enabled";

// Makes a color darker
function darkenColor(hex, factor) {
    const color = Number.parseInt(hex.slice(1), 16);
    const red = Math.round((color >> 16) * factor);
    const green = Math.round(((color >> 8) & 255) * factor);
    const blue = Math.round((color & 255) * factor);
    return `rgb(${red}, ${green}, ${blue})`;
}

// Makes a color lighter
function lightenColor(hex, factor) {
    const color = Number.parseInt(hex.slice(1), 16);
    const red = Math.round((color >> 16) + (255 - (color >> 16)) * factor);
    const greenValue = (color >> 8) & 255;
    const blueValue = color & 255;
    const green = Math.round(greenValue + (255 - greenValue) * factor);
    const blue = Math.round(blueValue + (255 - blueValue) * factor);
    return `rgb(${red}, ${green}, ${blue})`;
}

// Chooses readable text for a background color
function getContrastColor(hex) {
    const color = Number.parseInt(hex.slice(1), 16);
    const red = color >> 16;
    const green = (color >> 8) & 255;
    const blue = color & 255;
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

    return brightness > 128 ? "black" : "white";
}

// Applies the normal custom theme
function applyThemeColor(color) {
    const contrastColor = getContrastColor(color);

    themeRoot.style.setProperty("--color1", color);
    themeRoot.style.setProperty("--color2", darkenColor(color, 0.24));
    themeRoot.style.setProperty("--color3", darkenColor(color, 0.33));
    themeRoot.style.setProperty("--button-hover", darkenColor(color, 0.45));
    themeRoot.style.setProperty("--highlight", contrastColor);
    themeRoot.style.setProperty("--title-color", contrastColor);
    syncFavicon();
}

// Applies the light custom theme
function applyLightThemeColor(color) {
    themeRoot.style.setProperty("--color1", lightenColor(color, 0.82));
    syncFavicon();
}

// Updates the favicon colors
function syncFavicon() {
    if (typeof window.updateThemeFavicon !== "function") return;

    const themeStyles = getComputedStyle(themeRoot);
    const backgroundColor = themeStyles.getPropertyValue("--color1").trim();
    const foregroundColor = themeStyles.getPropertyValue("--title-color").trim();

    window.updateThemeFavicon(backgroundColor, foregroundColor);
}

// Removes custom theme variables
function clearCustomTheme() {
    ["--color1", "--color2", "--color3", "--button-hover", "--highlight", "--title-color"].forEach(function (property) {
        themeRoot.style.removeProperty(property);
    });
}

// Switches between normal, dark, and light themes
function setThemeMode(mode) {
    const darkEnabled = mode === "dark";
    const lightEnabled = mode === "light";

    themeRoot.classList.toggle("dark-theme", darkEnabled);
    themeRoot.classList.toggle("light-theme", lightEnabled);
    localStorage.setItem("darkMode", darkEnabled ? "enabled" : "disabled");
    localStorage.setItem("lightmode", lightEnabled ? "enabled" : "disabled");

    if (darkmodecheckbox) darkmodecheckbox.checked = darkEnabled;
    if (lightmodecheckbox) lightmodecheckbox.checked = lightEnabled;

    setThemeControlsLocked(darkEnabled);
    clearCustomTheme();

    const color = localStorage.getItem("themeColor");

    if (lightEnabled) {
        applyLightThemeColor(color || defaultThemeColor);
    } else if (!darkEnabled && color) {
        applyThemeColor(color);
    }

    syncFavicon();
}

// Disables color controls in dark mode
function setThemeControlsLocked(locked) {
    if (themeColor) themeColor.disabled = locked;

    colorPresets.forEach(function (preset) {
        preset.disabled = locked;
    });
}

// Loads the saved theme
themeRoot.classList.toggle("dark-theme", darkModeEnabled);
themeRoot.classList.toggle("light-theme", lightModeEnabled);

if (lightModeEnabled) {
    applyLightThemeColor(savedThemeColor || defaultThemeColor);
} else if (savedThemeColor && !darkModeEnabled) {
    applyThemeColor(savedThemeColor);
}

syncFavicon();
setThemeControlsLocked(darkModeEnabled);

// Handles the theme checkboxes
if (darkmodecheckbox) {
    darkmodecheckbox.checked = darkModeEnabled;
    darkmodecheckbox.addEventListener("change", function () {
        setThemeMode(darkmodecheckbox.checked ? "dark" : null);
    });
}

if (lightmodecheckbox) {
    lightmodecheckbox.checked = lightModeEnabled;
    lightmodecheckbox.addEventListener("change", function () {
        setThemeMode(lightmodecheckbox.checked ? "light" : null);
    });
}

// Handles the custom color picker
if (themeColor) {
    themeColor.value = savedThemeColor || themeColor.value;

    themeColor.addEventListener("input", function () {
        localStorage.setItem("themeColor", themeColor.value);

        if (themeRoot.classList.contains("light-theme")) {
            applyLightThemeColor(themeColor.value);
        } else {
            applyThemeColor(themeColor.value);
        }
    });
}

// Handles the color preset buttons
colorPresets.forEach(function (preset) {
    preset.addEventListener("click", function () {
        const color = preset.dataset.color;

        themeColor.value = color;
        localStorage.setItem("themeColor", color);

        if (themeRoot.classList.contains("light-theme")) {
            applyLightThemeColor(color);
        } else {
            applyThemeColor(color);
        }
    });
});

// Shows or hides the splash text
const splashTextEnabled = localStorage.getItem("splashText") !== "disabled";

if (splashText) {
    splashText.hidden = !splashTextEnabled;
}

if (splashTextCheckbox) {
    splashTextCheckbox.checked = splashTextEnabled;
    splashTextCheckbox.addEventListener("change", function () {
        const enabled = splashTextCheckbox.checked;

        if (splashText) splashText.hidden = !enabled;
        localStorage.setItem("splashText", enabled ? "enabled" : "disabled");
    });
}

// Updates the Amsterdam clock
function updateClock() {
    if (!clock) return;

    clock.textContent = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Europe/Amsterdam"
    });
}

if (marqueemsg && clock) {
    updateClock();

    marqueemsg.addEventListener("animationiteration", function (event) {
        if (event.target === marqueemsg && event.animationName === "scroll-text") {
            updateClock();
        }
    });
}

// Calculates the age on the About page
function updateAge() {
    const agetext = document.querySelector(".Age");
    if (!agetext) return;

    const birthDate = new Date(2010, 9, 16);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    agetext.textContent = age;
}

updateAge();

// Splits reusable text into individual letters
document.querySelectorAll(".SplitText").forEach(function (element) {
    const text = element.textContent;

    element.setAttribute("aria-label", text);
    element.textContent = "";

    [...text].forEach(function (character, index) {
        const letter = document.createElement("span");
        letter.textContent = character === " " ? "\u00A0" : character;
        letter.style.setProperty("--letter-index", index);
        letter.setAttribute("aria-hidden", "true");
        element.appendChild(letter);
    });
});

//https://codepen.io/yaclive/pen/EayLYO

document.querySelectorAll(".binary-rain").forEach(function (canvas) {
const ctx = canvas.getContext("2d");

// Setting the width and height of the canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Setting up.
var letters = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}<>+-=_~|:;,.?/',
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789CODEHTMLCSSJSDEVGAMEPIXELWEB0101010101',
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}<>+-=_~|:;,.?/',
  ...'♪♫♩♬ƒ▬▲▼◄►■□●○◆◇★☆※§¶†‡¤¢£¥€©®™±×÷≈≠≤≥∞√∑∏∆∇∫∴∵∷≡⊕⊗⊙⌂⌐¬¦¯°·•',
  ...'←↑→↓↔↕↖↗↘↙⇐⇑⇒⇓⇔⇕',
  ':)', ':D', ';)', ':P', ':(', ':O', ':/', ':|', 'XD', '<3',
  '01', '10', '::', '//', '>>', '<<', '[]', '{}', '<>', '&&', '||'
];

// Setting up the columns
var fontSize = 24, columns = canvas.width / fontSize;

// Setting up the drops
var drops = [];
for (var i = 0; i < columns; i++) {
  drops[i] = 1;
}

// Setting up the draw function
function draw() {
  ctx.fillStyle = 'rgba(0, 0, 0, .1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < drops.length; i++) {
    var text = letters[Math.floor(Math.random() * letters.length)];
    ctx.font = `${fontSize}px "Minecraft", monospace`;
    ctx.fillStyle = 'rgb(0, 255, 0)';
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    drops[i]++;
    if (drops[i] * fontSize > canvas.height && Math.random() > .95) {
      drops[i] = 0;
    }
  }
}

// Loop the animation
setInterval(draw, 33);
});

// Photo slider 
const sliderImage = document.querySelector("#slider-image");

if (sliderImage) {
    const sliderText = document.querySelector("#slidertext");
    const prevButton = document.querySelector("#prevbutton");
    const nextButton = document.querySelector("#nextbutton");
    const sliderDots = document.querySelectorAll(".sliderdot");
    
   
    const slides = Array.from(document.querySelectorAll(".slide-data")).map(slide => ({
        image: slide.querySelector("img").src,
        alt: slide.querySelector("img").alt,
        text: slide.querySelector("p").textContent.trim()
    }));

    let slideIndex = 0;

    const showSlide = (index) => {
        slideIndex = (index + slides.length) % slides.length;
        sliderImage.src = slides[slideIndex].image;
        sliderImage.alt = slides[slideIndex].alt;
        sliderText.textContent = slides[slideIndex].text;

        sliderDots.forEach((dot, i) => dot.classList.toggle("active", i === slideIndex));
    };

    // Event listeners
    prevButton?.addEventListener("click", () => showSlide(slideIndex - 1));
    nextButton?.addEventListener("click", () => showSlide(slideIndex + 1));
    
    sliderDots.forEach((dot, i) => {
        dot.addEventListener("click", () => showSlide(i));
    });
}

// Source - https://stackoverflow.com/a/39418437
// Posted by Pranav C Balan, modified by community. See post 'Timeline' for change history
// Retrieved 2026-10-29, License - CC BY-SA 4.0

var span = document.querySelector(".clock")

function time() {
if (span) {
  const d = new Date().toLocaleTimeString('nl-NL', {hour: '2-digit',minute: '2-digit', second: '2-digit'});
  span.textContent = d
}
}

setInterval(time, 1000);


// Random splash messages
const splashes = [
    "Epic website",
    "welcome!!",
    "hii",
    ":D",
    "hello",
    "made by jonathan",
    "font: oxanium",
    "hello there",
    "hello world",
    "splash text",
    "this is a website",
    "error 404",
    "101010101001",
    "this is a website",
    ":)",
    "boo",
    "click the buttons",
    "epic design",
    "premium edition",
    "loading...",
    "splashtext.txt",
    "Hypertext Markup Language",
    "Flexbox",
    "powering imagination",
    "!!!",
    "?",
    "ugly colors",
    "meow",
    "i<3e",
    "werkt op mijn pc",
    "media scaling",
    "no ai",
    "responsive-ish",
    "onder constructie",
    "Ctrl + S",
    "powered by CSS",
    "nu ook in kleur",
    "please stand by",
    "je leest de splashtext",
    "javascript",
    "css",
    "html",
    "yeaaah",
    "nover",
    "i love keyframes",
    "0-0",
    "renzo",
    "aizo aizo",
];

if (splashText) {
    const randomSplash = splashes[Math.floor(Math.random() * splashes.length)];
    splashText.textContent = randomSplash;
}
