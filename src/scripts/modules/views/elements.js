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

// Additional classes on top of additional classes?
// const createInputElement = (props) => {
//     let additionalClasses = "input";
//     props.tag = "input";

//     props.className
//         ? (props.className += " " + additionalClasses)
//         : (props.className = additionalClasses);

//     return createElement({ ...props });
// };

// const createButtonElement = (props) => {
//     let additionalClasses =
//         "group text-xs h-12 p-4 rounded-3xl bg-purple-600 hover:bg-purple-500 font-bold text-white items-center flex";
//     props.tag = "button";

//     props.className
//         ? (props.className += " " + additionalClasses)
//         : (props.className = additionalClasses);

//     return createElement({ ...props });
// };

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

export {
    createElement,
    // createInputElement,
    // createButtonElement,
    // createInvoiceListElement,
};
