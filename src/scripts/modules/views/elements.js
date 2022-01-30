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

const createInputElement = (props) => {
    let additionalClasses = "input";
    props.tag = "input";

    props.className
        ? (props.className += " " + additionalClasses)
        : (props.className = additionalClasses);

    return createElement({ ...props });
};

const createButtonElement = (props) => {
    let additionalClasses = "button";
    props.tag = "button";

    props.className
        ? (props.className += " " + additionalClasses)
        : (props.className = additionalClasses);

    return createElement({ ...props });
};

export { createElement, createInputElement, createButtonElement };
