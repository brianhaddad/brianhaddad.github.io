function makeFieldset(legendText) {
    const fieldset = createElement('fieldset');
    const legend = createElement('legend', {}, legendText);
    fieldset.appendChild(legend);
    return fieldset;
}

function makeDetail(summaryText, child, isOpen) {
    const detailsAttributes = {'style': 'padding:8px 16px;margin:3px;border-radius:5px;border:1px solid black;'};
    if (isOpen) {
        detailsAttributes['open'] = 'true';
    }
    const details = createElement('details', detailsAttributes, null);
    const summary = createElement('summary', {'style': 'cursor:pointer;user-select:none;'}, summaryText);
    details.appendChild(summary);
    details.appendChild(child);
    return details;
}

function makeSelect(name, options) {
    const select = createElement('select', { 'name': name, 'id': name }, null);
    for (const v in options) {
        const option = createElement('option', { 'value': v }, options[v]);
        select.appendChild(option);
    }
    return select;
}

function makeNumberSelect(name, min, max) {
    const select = createElement('select', { 'name': name, 'id': name }, null);
    for (let i = min; i <= max; i++) {
        const option = createElement('option', { 'value': i }, i.toString());
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