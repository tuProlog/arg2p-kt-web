// Files the user downloads, named after the tab they come from.

// `Tweety` -> `Tweety.pl`; a name that already has the extension keeps it,
// and characters file systems refuse become `_`.
function fileName(name, extension, keep = []) {
    const safe = (name || "").replace(/[\\/:*?"<>|]+/g, "_").trim() || "theory";
    const known = [extension, ...keep].map(it => it.replace(/^\./, "").toLowerCase());
    const current = (safe.match(/\.([a-z0-9]+)$/i) || [])[1];
    if (current && known.includes(current.toLowerCase())) return safe;
    return `${current && /^(pl|pro|prolog|txt|apx|tgf|png)$/i.test(current) ? safe.replace(/\.[a-z0-9]+$/i, "") : safe}.${known[0]}`;
}

function downloadText(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    downloadUrl(name, url);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadUrl(name, url) {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

// The whole graph of a vis network as a PNG: fitted for the picture, on the
// page's background (so it reads in either theme), then the user's view back.
function graphPng(network, container) {
    const position = network.getViewPosition();
    const scale = network.getScale();
    network.fit({ animation: false });
    network.redraw();
    const canvas = container.querySelector("canvas");
    const picture = document.createElement("canvas");
    picture.width = canvas.width;
    picture.height = canvas.height;
    const context = picture.getContext("2d");
    const background = getComputedStyle(document.body).backgroundColor;
    context.fillStyle = !background || background === "rgba(0, 0, 0, 0)" ? "#ffffff" : background;
    context.fillRect(0, 0, picture.width, picture.height);
    context.drawImage(canvas, 0, 0);
    network.moveTo({ position, scale, animation: false });
    network.redraw();
    return picture.toDataURL("image/png");
}

export default { fileName, downloadText, downloadUrl, graphPng }
