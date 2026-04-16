function makeFieldset(legendText, fieldsetAttributes) {
    if (!fieldsetAttributes) {
        fieldsetAttributes = {};
    }
    const fieldset = createElement('fieldset', fieldsetAttributes, null);
    const legend = createElement('legend', {}, legendText);
    fieldset.appendChild(legend);
    return fieldset;
}

function makeDetail(summaryText, detailsAttributes, child, isOpen) {
    detailsAttributes ??= {};
    if (isOpen) {
        detailsAttributes['open'] = 'true';
    }
    const details = createElement('details', detailsAttributes, null);
    const summary = createElement('summary', {'style': 'cursor:pointer;user-select:none;'}, summaryText);
    details.appendChild(summary);
    if (child) {
        details.appendChild(child);
    }
    return details;
}

function makeSelect(name, options, selected) {
    const select = createElement('select', { 'name': name, 'id': name }, null);
    for (const v in options) {
        const attributes = { 'value': v };
        console.log(selected);
        if (selected && (selected.toString() === v.toString() || selected.toString() === options[v].toString())) {
            attributes['selected'] = true;
        }
        const option = createElement('option', attributes, options[v]);
        select.appendChild(option);
    }
    return select;
}

function makeNumberSelect(name, min, max, selected) {
    const select = createElement('select', { 'name': name, 'id': name }, null);
    for (let i = min; i <= max; i++) {
        const attributes = { 'value': i };
        if (selected !== null && selected === i) {
            attributes['selected'] = true;
        }
        const option = createElement('option', attributes, i.toString());
        select.appendChild(option);
    }
    return select;
}

function createElement(type, attributes, innerHTML) {
    const element = document.createElement(type);
    for (const a in attributes) {
        element.setAttribute(a, attributes[a]);
    }
    if (innerHTML) {
        element.innerHTML = innerHTML;
    }
    return element;
}