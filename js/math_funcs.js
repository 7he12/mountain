function ease_out_quart (x) {
    return 1 - Math.pow(1 - x, 4);
}

function ease_out_cubic (x) {
    return 1 - Math.pow(1 - x, 3);
}