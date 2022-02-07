const createElement = (props) => {
    const { tag = "div", id, className, attrs, html } = props;

    const fragment = document.createDocumentFragment();
    const element = document.createElement(tag);

    id && (element.id = id);
    className && (element.className = className);
    html && (element.innerHTML = html);

    if (attrs) {
        for (let key of Object.keys(attrs)) {
            const value = attrs[key];

            if (key != key.toLowerCase()) {
                key = key.replace(/[A-Z]/g, (l) => "-" + l.toLowerCase());
            }
            element.setAttribute(`data-${key}`, value);
        }
    }

    return fragment.appendChild(element);
};

const createButtonElement = (props) => {
    let latestProps = props;

    let additionalClasses =
        "group text-xs h-12 p-4 rounded-3xl bg-purple-600 hover:bg-purple-500 font-bold text-white items-center flex";
    latestProps.tag = "button";

    latestProps.className
        ? (latestProps.className += " " + additionalClasses)
        : (latestProps.className = additionalClasses);

    return createElement({ ...latestProps });
};

// const createInvoiceListElement = (props) => {
//     let additionalClasses = "mb-16 bg-white p-16 w-full";

//     props.tag = "li";
//     props.attrs = {
//         invoiceRole: "list-item",
//     };

//     props.className
//         ? (props.className += " " + additionalClasses)
//         : (props.className = additionalClasses);

//     return createElement({ ...props });
// };

const createInputElement = (field, labelText, type) => {
    const fragment = document.createDocumentFragment();
    const input = document.createElement("input");
    const label = document.createElement("label");
    const fieldName = field.toLowerCase();

    input.name = fieldName;
    input.type = type;

    label.for = fieldName;
    label.innerHTML = labelText;

    fragment.appendChild(label);
    fragment.appendChild(input);

    return fragment;
};

export {
    createElement,
    createInputElement,
    createButtonElement,
    // createInvoiceListElement,
};
