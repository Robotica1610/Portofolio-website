// Applies the saved theme before the page is shown
(function () {
    const root = document.documentElement;
    const favicon = document.getElementById("favicon");

    // Creates a favicon with the current theme colors
    function updateThemeFavicon(backgroundColor, foregroundColor) {
        if (!favicon) return;

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="6" fill="${backgroundColor}"/>
                <text x="16" y="23" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="${foregroundColor}">J</text>
            </svg>
        `;

        favicon.type = "image/svg+xml";
        favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }

    window.updateThemeFavicon = updateThemeFavicon;
    updateThemeFavicon("#00c91e", "black");

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

    // Reads and applies the saved theme
    try {
        const darkModeEnabled = localStorage.getItem("darkMode") === "enabled";
        const lightModeEnabled = !darkModeEnabled && localStorage.getItem("lightmode") === "enabled";
        const savedThemeColor = localStorage.getItem("themeColor");
        const validThemeColor = /^#[0-9a-f]{6}$/i.test(savedThemeColor || "")
            ? savedThemeColor
            : null;

        root.classList.toggle("dark-theme", darkModeEnabled);
        root.classList.toggle("light-theme", lightModeEnabled);

        if (darkModeEnabled) {
            updateThemeFavicon("rgb(0, 13, 201)", "white");
        } else if (lightModeEnabled) {
            const lightColor = lightenColor(validThemeColor || "#00c91e", 0.82);
            root.style.setProperty("--color1", lightColor);
            updateThemeFavicon(lightColor, "black");
        } else if (!darkModeEnabled && validThemeColor) {
            const contrastColor = getContrastColor(validThemeColor);
            root.style.setProperty("--color1", validThemeColor);
            root.style.setProperty("--color2", darkenColor(validThemeColor, 0.24));
            root.style.setProperty("--color3", darkenColor(validThemeColor, 0.33));
            root.style.setProperty("--button-hover", darkenColor(validThemeColor, 0.45));
            root.style.setProperty("--highlight", contrastColor);
            root.style.setProperty("--title-color", contrastColor);
            updateThemeFavicon(validThemeColor, contrastColor);
        }
    } catch (error) {
        // Uses the default theme when storage is unavailable
    }
})();
