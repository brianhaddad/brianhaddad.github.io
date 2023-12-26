function removeNonAlphanumeric(input) {
    return input.replace(/[^a-z0-9]|\s+|\r?\n|\r/gmi, '');
}

function capitalizeFirstLetter(input) {
    return input.substr(0, 1).toUpperCase() + input.substr(1);
}