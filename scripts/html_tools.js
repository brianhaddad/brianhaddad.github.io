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