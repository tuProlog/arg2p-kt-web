// Light or dark: the system's choice, until the toggle in the navbar picks one
// (remembered by the browser). index.html applies it before the page is drawn;
// this keeps it up to date and tells the editors, which colour themselves.
const SETTING = "arg2p.theme";
const NAVBAR_COLOR = { light: "#f8f9fa", dark: "#1f2125" };
const listeners = [];

function current() {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function apply(theme) {
    document.documentElement.dataset.theme = theme;
    // The colour of the window of the installed app.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = NAVBAR_COLOR[theme];
    listeners.forEach(listener => listener(theme));
}

function stored() {
    try {
        const theme = window.localStorage.getItem(SETTING);
        return theme === "light" || theme === "dark" ? theme : null;
    } catch (error) {
        return null;
    }
}

function store(theme) {
    try {
        window.localStorage.setItem(SETTING, theme);
    } catch (error) {
        // Not remembered (private mode, storage disabled): it still applies.
    }
}

function init(toggle) {
    apply(current());
    toggle.addEventListener("click", () => {
        const theme = current() === "dark" ? "light" : "dark";
        store(theme);
        apply(theme);
    });
    // Follows the system while nothing has been picked.
    if (window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => {
            if (stored() === null) apply(event.matches ? "dark" : "light");
        });
    }
}

function onChange(listener) {
    listeners.push(listener);
}

export default { init, current, onChange }
