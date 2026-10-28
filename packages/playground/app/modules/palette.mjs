const LABEL_COLORS = {
    in: "#008080",
    out: "#800000",
    und: "#808080"
}

const UNLABELLED_COLOR = "#2b7ce9"

function labelColor(label) {
    return LABEL_COLORS[label] || UNLABELLED_COLOR
}

export { labelColor, UNLABELLED_COLOR }
