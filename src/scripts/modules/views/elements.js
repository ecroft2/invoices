const createElement = (props) => {
    const { tag = "div", id, className, attrs, html, type } = props;

    const fragment = document.createDocumentFragment();
    const element = document.createElement(tag);

    id && (element.id = id);
    className && (element.className = className);
    html && (element.innerHTML = html);
    type && (element.type = type);

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
        props.additionalClasses +
        " group text-xs h-12 p-4 rounded-3xl bg-purple-600 hover:bg-purple-500 font-bold transition-colors duration-100";
    latestProps.tag = "button";
    latestProps.type = props.type;

    latestProps.className
        ? (latestProps.className += " " + additionalClasses)
        : (latestProps.className = additionalClasses);

    return createElement({ ...latestProps });
};

const createInputElement = (field, labelText, type) => {
    const fragment = document.createDocumentFragment();
    const inputWrap = document.createElement("div");
    const input = document.createElement("input");
    const label = document.createElement("label");
    const fieldName = field.toLowerCase();

    inputWrap.className = "flex flex-col mb-6";

    input.name = fieldName;
    input.type = type;
    input.className =
        "p-4 text-xs rounded border border-solid border-slate-300 hover:border-slate-400 transition-colors w-full font-bold";

    label.for = fieldName;
    labelText && (label.innerHTML = labelText);
    label.className = "text-xs text-slate-500 mb-2";

    inputWrap.appendChild(label);
    inputWrap.appendChild(input);

    fragment.appendChild(inputWrap);

    return fragment;
};

const createStatusElement = (isComplete, props) => {
    const { tag, additionalClasses } = props;

    const fragment = document.createDocumentFragment();
    const element = document.createElement(tag);

    element.className = `max-w-[7rem] w-full text-center text-slate-500 font-semibold py-3 rounded transition-colors ${
        isComplete ? "bg-green-100 text-green-500" : "bg-orange-100 text-orange-500"
    }`;
    element.innerHTML = `
        <i class="fas fa-circle fa-xs mr-1"></i>
        ${isComplete ? "Paid" : "Pending"}
    `;

    additionalClasses && (element.className += " " + additionalClasses);

    fragment.appendChild(element);

    return fragment;
};

export { createElement, createInputElement, createButtonElement, createStatusElement };
