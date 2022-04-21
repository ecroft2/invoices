import {
    createElement,
    createInputElement,
    createButtonElement,
    createStatusElement,
} from "./elements.js";

import { createPrettyCurrencyAmount } from "../helpers/helpers.js";

class View {
    constructor() {
        this.root = document.querySelector(".root");
        this.body = document.querySelector(".body");
        this.header = document.querySelector(".header");
        this.content = document.querySelector(".content");

        this.headerControls = document.querySelector("[data-invoice-role='header-controls']");
        this.totalInvoices = document.querySelector("[data-invoice-role='count-invoices']");
        this.newFormButton = document.querySelector("[data-invoice-role='get-new-form']");

        this.newFormButton.addEventListener("click", () => {
            this.root.querySelector("[data-invoice-role='form-wrap']") === null && this.viewForm();
        });

        this.rootOverlay = createElement({
            tag: "div",
            className:
                "after:absolute after:w-full after:h-full after:top-0 after:left-0 after:opacity-100 after:z-[1] after:transition-all after:content-[''] after:bg-black after:opacity-20 hidden",
        });
        this.root.appendChild(this.rootOverlay);
        this.invoices;

        this.filterSelect = document.querySelector("[data-invoice-role='filter']");

        this.filterSelect.addEventListener("change", (event) => {
            this.sortOrder = event.target.value;
            this.createInvoiceList(this.invoices, this.sortOrder);
        });

        this.backToInvoicesControl = document.querySelector(
            "[data-invoice-role='back-to-invoices']"
        );
    }

    createDeletePrompt(invoiceId) {
        const deletePromptElem = createElement({
            className:
                "absolute bg-white z-[1] rounded p-8 max-w-[16rem] md:max-w-lg mx-auto md:m-0 w-100 top-1/2 -translate-y-2/4 left-1/2 -translate-x-2/4 w-full",
        });
        const deleteButtonWrapElem = createElement({
            className: "flex justify-end",
        });
        const deletePromptCancelElem = createButtonElement({
            attrs: {
                dataInvoiceRole: "del-prompt-cancel",
            },
            html: "Cancel",
            additionalClasses: "inline mr-2 bg-blue-500 hover:bg-blue-400 text-white",
        });
        const deletePromptConfirmElem = createButtonElement({
            attrs: {
                dataInvoiceRole: "del-prompt-confirm",
            },
            html: "Delete",
            additionalClasses: "inline bg-red-500 hover:bg-red-400 text-white",
        });
        deleteButtonWrapElem.appendChild(deletePromptCancelElem);
        deleteButtonWrapElem.appendChild(deletePromptConfirmElem);

        deletePromptElem.appendChild(
            createElement({
                html: "Confirm Deletion",
                className: "text-2xl font-bold pb-3",
                tag: "p",
            })
        );
        deletePromptElem.appendChild(
            createElement({
                html: `Are you sure you want to delete invoice #${invoiceId}? This action cannot be undone.`,
                className: "text-sm text-slate-500 pb-4",
            })
        );
        deletePromptElem.appendChild(deleteButtonWrapElem);

        return deletePromptElem;
    }

    createInvoiceList(invoices, invoiceSortOrder) {
        let filteredInvoices;

        this.content.querySelector("[data-invoice-role='invoices-list']") &&
            (this.content.innerHTML = "");

        const invoicesList = createElement({
            tag: "ul",
            attrs: {
                dataInvoiceRole: "invoices-list",
            },
        });

        switch (invoiceSortOrder) {
            case "paid":
                filteredInvoices = invoices.filter((invoice) => invoice.isComplete);
                break;
            case "pending":
                filteredInvoices = invoices.filter((invoice) => !invoice.isComplete);
                break;
            default:
                filteredInvoices = invoices;
                break;
        }

        this.content.appendChild(invoicesList);

        filteredInvoices.forEach((invoice) => {
            const listItem = createElement({
                tag: "li",
                attrs: {
                    dataInvoiceRole: "view-invoice",
                    dataInvoiceId: invoice.id,
                },
                className:
                    "flex items-center flex-wrap md:flex-nowrap rounded shadow-sm hover:shadow-md transition-all text-sm justify-evenly mb-4 bg-white p-4 w-full cursor-pointer text-sm group md:gap-x-4",
            });

            listItem.innerHTML = `
                <span class="grow-0 md:grow-0 order-1 md:order-none w-6/12 md:w-[75px] md:text-center font-bold"><span class="text-slate-500">#</span>${invoice.id}</span>
                <span class="grow-0 md:grow-[2] order-3 md:order-none w-full md:w-auto basis-full md:basis-0 text-slate-500 mt-4 mb-2 md:m-0">Due ${invoice.data.date}</span>
                <span class="grow-0 md:grow-[2] order-2 md:order-none basis-half md:basis-0 text-slate-500 pl-2 md:pl-0 w-6/12 md:w-auto text-right md:text-left">${invoice.data.toName}</span>
                <span class="grow order-4 md:order-none md:grow basis-0 md:text-right pr-2 md:pr-0 font-bold text-sm">${invoice.totalOwedAmount}</span>
            `;

            listItem.appendChild(
                createStatusElement(invoice.isComplete, {
                    tag: "span",
                    additionalClasses: "grow order-5 md:order-none",
                })
            );
            listItem.appendChild(
                createElement({
                    tag: "i",
                    className:
                        "grow-[1] md:grow-0 md:w-[75px] text-center hidden md:block fa-solid fa-angle-right text-lg text-purple-600 group-hover:text-purple-500",
                })
            );

            invoicesList.appendChild(listItem);

            invoicesList.addEventListener("click", (event) => {
                if (
                    event.target
                        .closest("[data-invoice-role='view-invoice']")
                        .getAttribute("data-invoice-role") === "view-invoice"
                ) {
                    let invoiceId = parseInt(
                        event.target
                            .closest("[data-invoice-role='view-invoice']")
                            .getAttribute("data-invoice-id")
                    );

                    this.content.querySelector("[data-invoice-role='invoice-data']") === null &&
                        this.viewInvoice(invoiceId);
                }
            });
        });
    }

    displayInvoiceData(invoiceData) {
        const { id, data, totalOwedAmount } = invoiceData;
        const dataElement = createElement({
            className: "p-6 md:p-8 rounded bg-white mt-6 shadow mb-[6.5rem]",
            attrs: { dataInvoiceId: id },
        });

        const {
            fromAddress,
            fromCity,
            fromPostcode,
            fromCountry,
            toName,
            toEmail,
            toAddress,
            toCity,
            toPostcode,
            toCountry,
            date,
            paymentTerms,
            paymentDesc,
            items: invoiceItems,
        } = data;

        dataElement.innerHTML = `
            <div class="flex flex-col md:flex-row mb-4">
                <div class="mr-auto pr-2 mb-4 md:mb-0">
                    <p class="font-bold text-sm md:text-sm md:mb-2"><span class="text-slate-500">#</span>${id}</p>
                    <p class="text-sm text-slate-500">${paymentDesc}</p>
                </div>
                <div class="md:ml-auto md:pl-2 md:text-right text-slate-500 text-sm">
                    <p>${fromAddress}</p>
                    <p>${fromCity}</p>
                    <p>${fromPostcode}</p>
                    <p>${fromCountry}</p>
                </div>
            </div>

            <div class="flex mb-8 flex-wrap">
                <div class="flex justify-between flex-col w-6/12 md:w-1/3 pr-2 md:pr-4">
                    <div>
                        <p class="text-slate-500 text-sm mb-2">Invoice Date</p>
                        <p class="text-sm font-bold">${date}</p>
                    </div>
                    <div>
                        <p class="text-slate-500 text-sm mb-2">Payment Due</p>
                        <p class="text-sm font-bold">${paymentTerms}</p>
                    </div>
                </div>
                <div class="w-6/12 md:w-1/3 pl-2 md:pl-0 pr-0 md:pr-4">
                    <p class="text-slate-500 text-sm mb-2">Bill To</p>
                    <p class="text-sm font-bold mb-2">${toName}</p>
                    <div class="text-sm text-slate-500">
                        <p>${toAddress}</p>
                        <p>${toCity}</p>
                        <p>${toPostcode}</p>
                        <p>${toCountry}</p>
                    </div>
                </div>
                <div class="w-full md:w-auto col mt-4 md:mt-0">
                    <p class="text-slate-500 text-sm mb-2">Sent To</p>
                    <p class="font-bold">${toEmail}</p>
                </div>
            </div>
        `;

        const dataTable = createElement({
            tag: "table",
            className: "rounded-t bg-slate-50 p-4 md:p-8 w-full border-separate",
            html: `
                <thead class="hidden md:table-header-group">
                    <tr class="text-slate-500 text-sm">
                        <th class="font-normal text-left pb-4">Item Name</th>
                        <th class="font-normal text-center pb-4">Qty.</th>
                        <th class="font-normal text-right pb-4">Price</th>
                        <th class="font-normal text-right pb-4">Total</th>
                    </tr>
                </thead>
            `,
        });

        const dataTableBody = createElement({ tag: "tbody" });

        invoiceItems.forEach((item) => {
            dataTableBody.insertAdjacentHTML(
                "beforeend",
                `
                <tr class="text-sm mb-4 last-of-type:mb-0 md:mb-0 flex md:table-row flex-wrap">
                    <td class="p-0 md:pt-4 mb-2 md:mb-0 font-bold text-left w-full md:w-auto">${
                        item.name || ""
                    }</td>
                    <td class="p-0 md:pt-4 font-bold text-slate-500 text-center">${
                        item.quantity || ""
                    }<span class="md:hidden mx-1">x</span></td>
                    <td class="p-0 md:pt-4 font-bold text-slate-500 text-right">${
                        createPrettyCurrencyAmount(item.price) || ""
                    }</td>
                    <td class="p-0 md:pt-4 font-bold ml-auto md:ml-0 text-right">${createPrettyCurrencyAmount(
                        item.quantity * item.price
                    )}</td>
                </tr>
                `
            );
        });

        dataTable.appendChild(dataTableBody);
        dataElement.appendChild(dataTable);

        const totalDueElement = createElement({
            className: "flex items-center rounded-b bg-slate-700 px-4 py-4 md:px-8 md:py-6",
        });
        totalDueElement.appendChild(
            createElement({
                tag: "p",
                className: "text-sm mr-auto text-white",
                html: "Amount Due",
            })
        );
        totalDueElement.appendChild(
            createElement({
                tag: "p",
                className: "text-xl md:text-2xl ml-auto text-white font-bold",
                html: totalOwedAmount || "0",
            })
        );
        dataElement.appendChild(totalDueElement);

        return dataElement;
    }

    createDateField() {
        const dayField = createElement({
            tag: "div",
            placeholder: "DD",
        });
        const monthField = createElement({
            tag: "div",
            placeholder: "MM",
        });
        const yearField = createElement({
            tag: "div",
            placeholder: "YYYY",
        });
    }

    generateFormItems(invoiceData) {
        // Bill From Inputs
        const fromInputsFieldset = createElement({ tag: "fieldset" });
        const fromInputsLegend = createElement({
            tag: "legend",
            html: "Bill From",
            className: "font-bold text-purple-600 text-base mb-6 text-white",
        });
        const fromAddress = createInputElement("from_address", "Street Address", "text");
        const fromCity = createInputElement("from_city", "City", "text");
        const fromPostcode = createInputElement("from_postcode", "Postcode", "text", "postcode");
        const fromCountry = createInputElement("from_country", "Country", "text");

        const fromInputsColumns = createElement({ tag: "div", className: "flex gap-x-4" });
        fromInputsColumns.appendChild(fromCity);
        fromInputsColumns.appendChild(fromPostcode);
        fromInputsColumns.appendChild(fromCountry);

        fromInputsFieldset.appendChild(fromInputsLegend);
        fromInputsFieldset.appendChild(fromAddress);
        fromInputsFieldset.appendChild(fromInputsColumns);
        this.form.appendChild(fromInputsFieldset);

        // Bill To Inputs
        const toInputsFieldset = createElement({ tag: "fieldset" });
        const toInputsLegend = createElement({
            tag: "legend",
            html: "Bill To",
            className: "font-bold text-purple-600 text-base mb-6 text-white",
        });
        const toName = createInputElement("to_name", "Name", "text");
        const toEmail = createInputElement("to_email", "Email", "text", "email");
        const toAddress = createInputElement("to_address", "Street Address", "text");
        const toCity = createInputElement("to_city", "City", "text");
        const toPostcode = createInputElement("to_postcode", "Postcode", "text", "postcode");
        const toCountry = createInputElement("to_country", "Country", "text");

        toInputsFieldset.appendChild(toInputsLegend);
        toInputsFieldset.appendChild(toName);
        toInputsFieldset.appendChild(toEmail);
        toInputsFieldset.appendChild(toAddress);

        const toInputsColumns = createElement({ tag: "div", className: "flex gap-x-4" });

        toInputsColumns.appendChild(toCity);
        toInputsColumns.appendChild(toPostcode);
        toInputsColumns.appendChild(toCountry);
        toInputsFieldset.appendChild(toInputsColumns);
        this.form.appendChild(toInputsFieldset);

        // Other Inputs
        const otherInputsFieldset = createElement({ tag: "fieldset" });
        const otherInputsLegend = createElement({
            tag: "legend",
            html: "Details",
            className: "font-bold text-purple-600 text-base mb-6 text-white",
        });

        const otherInputsColumns = createElement({ tag: "div", className: "flex gap-x-4" });

        const date = createInputElement("date", "Invoice Date", "", "date");

        const paymentTerms = createInputElement("payment_terms", "Payment Terms", "");
        otherInputsColumns.appendChild(date);
        otherInputsColumns.appendChild(paymentTerms);

        const paymentDesc = createInputElement("payment_desc", "Payment Description", "text");

        otherInputsFieldset.appendChild(otherInputsLegend);
        otherInputsFieldset.appendChild(otherInputsColumns);
        otherInputsFieldset.appendChild(paymentDesc);
        this.form.appendChild(otherInputsFieldset);

        // Pre-populate regular fields
        if (invoiceData) {
            for (const [key, value] of Object.entries(invoiceData.data)) {
                if (key !== "items") {
                    let inputName = key.replace(/[A-Z]/g, (l) => "_" + l.toLowerCase());

                    value && (this.form.elements[inputName].value = value);
                }
            }
        }

        // Invoice Items Inputs
        const invoiceItemsFieldset = createElement({ tag: "fieldset" });
        const invoiceItemsLegend = createElement({
            tag: "legend",
            html: "Item List",
            className: "font-bold text-slate-500 text-sm mb-4",
        });

        invoiceItemsFieldset.appendChild(invoiceItemsLegend);

        if (invoiceData && invoiceData.data.items.length !== 0) {
            invoiceItemsFieldset.appendChild(this.generateFormItemsList(invoiceData.data.items));
        } else {
            invoiceItemsFieldset.appendChild(this.generateFormItemsList());
        }

        this.form.appendChild(invoiceItemsFieldset);

        const invoiceFormItemsTable = this.form.querySelector(
            "[data-invoice-role='invoice-form-table']"
        );

        invoiceFormItemsTable.addEventListener("click", (event) => {
            if (
                event.target.getAttribute("data-invoice-role") === "remove-row" &&
                invoiceFormItemsTable.querySelectorAll("tbody tr").length > 1
            ) {
                invoiceFormItemsTable
                    .querySelector("tbody")
                    .removeChild(event.target.closest("tr"));

                invoiceFormItemsTable
                    .querySelector("tbody tr")
                    .classList.remove(
                        "before:content-['']",
                        "before:bg-slate-400",
                        "before:mb-6",
                        "before:h-px",
                        "before:w-full",
                        "md:before:hidden",
                        "mt-6"
                    );
            } else {
                // TODO: Style for else
            }
        });

        [...this.form.querySelectorAll("input")].forEach((input) => {
            input.addEventListener("focusout", (event) => {
                this.validateInput(input);
            });

            input.addEventListener("keyup", (event) => {
                event.key !== "Tab" && this.validateInput(input);
            });
        });
    }

    generateFormItemsList(invoiceItems) {
        const table = createElement({
            tag: "table",
            className: "w-full mb-6",
            attrs: {
                dataInvoiceRole: "invoice-form-table",
            },
        });

        const formItems = document.createDocumentFragment();

        table.innerHTML = `
            <thead class="hidden md:table-header-group">
                <tr class="text-slate-500 text-left">
                    <th class="font-normal text-sm pr-2">Item Name</th>
                    <th class="font-normal text-sm w-[3rem] pr-2">Qty.</th>
                    <th class="font-normal text-sm w-[75px] pr-2">Price</th>
                    <th class="font-normal text-sm w-[85px] pr-2">Total</th>
                    <th class="w-[1rem]"></th>
                </tr>
            </thead>
        `;
        table.style.borderSpacing = "20px";

        const tableBody = createElement({ tag: "tbody" });
        table.appendChild(tableBody);

        const addItemButton = createButtonElement({
            html: "<i class='fa-solid fa-plus mr-2 text-base'></i><p class='mt-1'>Add New Item</p>",
            additionalClasses:
                "bg-neutral-200 hover:bg-neutral-100 text-neutral-600 justify-center w-full",
            type: "button",
        });

        if (invoiceItems) {
            invoiceItems.forEach((item) => {
                tableBody.appendChild(this.generateFormRow(item));
            });
        } else {
            tableBody.appendChild(this.generateFormRow(null, true));
        }

        formItems.appendChild(table);
        formItems.appendChild(addItemButton);

        addItemButton.addEventListener("click", (event) => {
            tableBody.appendChild(this.generateFormRow());

            this.form.scrollBy({
                top: tableBody.scrollHeight,
                behavior: "smooth",
            });
        });

        return formItems;
    }

    generateFormRow(data, noDivider) {
        const row = createElement({
            tag: "tr",
            className: `flex flex-wrap md:table-row last-of-type:mb-0 ${
                noDivider ||
                `mt-6 before:content-[''] before:bg-slate-400 before:mb-6 before:h-px before:w-full md:before:hidden`
            }`,
        });
        const fieldClasses =
            "w-full py-4 text-sm rounded border md:placeholder:text-transparent placeholder:font-normal border-solid border-slate-300 hover:border-slate-400 transition-colors font-bold";

        const nameField = createElement({
            tag: "td",
            className: "p-0 md:pr-2 md:pt-4 mb-4 md:m-0 w-full md:w-auto",
        });
        const nameFieldInput = createElement({
            tag: "input",
            className: fieldClasses + " px-4",
            attrs: {
                dataValidation: "string",
            },
        });
        nameFieldInput.name = "name";
        nameFieldInput.placeholder = "Item Name";
        data && data["name"] && (nameFieldInput.value = data["name"]);
        nameField.appendChild(nameFieldInput);

        const quantityField = createElement({
            tag: "td",
            className: "p-0 mr-4 md:m-0 md:pr-2 md:pt-4 max-w-[3rem]",
        });
        const quantityFieldInput = createElement({
            tag: "input",
            className: fieldClasses + " px-2 text-center",
            attrs: {
                inputmode: "numeric",
                dataValidation: "number",
                type: "number",
            },
        });
        quantityFieldInput.name = "quantity";
        quantityFieldInput.placeholder = "Qty.";
        data && data["quantity"] && (quantityFieldInput.value = data["quantity"]);
        quantityField.appendChild(quantityFieldInput);

        const priceField = createElement({
            tag: "td",
            className: "md:pr-2 p-0 md:pt-4 mr-4 md:mr-0 max-w-[75px]",
        });
        const priceFieldInput = createElement({
            tag: "input",
            className: fieldClasses + " px-2",
            attrs: {
                inputmode: "decimal",
                dataValidation: "currency",
                type: "number",
            },
        });
        priceFieldInput.name = "price";
        priceFieldInput.placeholder = "Price";
        data && data["price"] && (priceFieldInput.value = data["price"]);
        priceField.appendChild(priceFieldInput);

        const totalAmount = createElement({
            tag: "td",
            className: "text-slate-500 font-bold text-sm pr-2 pt-4 w-[85px]",
        });

        if (data && data["quantity"] && data["price"]) {
            totalAmount.innerHTML = createPrettyCurrencyAmount(
                quantityFieldInput.value * priceFieldInput.value
            );
        }

        row.addEventListener("change", () => {
            totalAmount.innerHTML = "";

            if (quantityFieldInput.value && priceFieldInput.value) {
                totalAmount.innerHTML = createPrettyCurrencyAmount(
                    quantityFieldInput.value * priceFieldInput.value
                );
            }
        });

        const removeRowTrigger = createElement({
            tag: "td",
            className: "pt-4 ml-auto md:ml-0",
            html: "<button type='button' class='transition-colors duration-100 text-slate-500 focus:text-slate-400 hover:text-slate-400' data-invoice-role='remove-row'><i class='fa-solid fa-trash pointer-events-none'></i></button>",
        });

        row.appendChild(nameField);
        row.appendChild(quantityField);
        row.appendChild(priceField);
        row.appendChild(totalAmount);
        row.appendChild(removeRowTrigger);

        return row;
    }

    updateInvoicesList(data) {
        if (data) {
            this.invoices = data.invoices;
        }

        this.content.innerHTML = "";

        this.headerControls.classList.contains("hidden") &&
            this.headerControls.classList.remove("hidden");

        this.totalInvoices.classList.contains("hidden") &&
            this.totalInvoices.classList.remove("hidden");

        if (this.invoices.length > 0) {
            this.totalInvoices.innerHTML = `${
                this.invoices.length === 1
                    ? "<span class='hidden md:inline'>There is </span>1 invoice."
                    : `<span class='hidden md:inline'>There are </span>${this.invoices.length} <span class='hidden md:inline'>total </span>invoices.`
            }`;

            this.filterSelect.classList.contains("hidden") &&
                this.filterSelect.classList.remove("hidden");

            this.createInvoiceList(this.invoices, this.sortOrder);
        } else {
            this.totalInvoices.innerHTML =
                "<span class='hidden md:inline'>There are n</span><span class='md:hidden'>N</span>o invoices.";
            this.content.innerHTML = "No invoices!";
            this.filterSelect.classList.add("hidden");
        }
    }

    validateInput(input) {
        let inputIsValid = true;
        const validationStatus = this.getInputValidationStatus(
            input.value,
            input.getAttribute("data-validation")
        );

        input.classList.contains("hover:border-slate-400") &&
            input.classList.remove("hover:border-slate-400");

        if (input.parentElement.tagName !== "TD") {
            input.previousElementSibling.querySelector("[data-invoice-role='validation-symbol']") &&
                input.previousElementSibling.removeChild(
                    input.previousElementSibling.querySelector(
                        "[data-invoice-role='validation-symbol']"
                    )
                );
        }

        if (validationStatus === "valid") {
            if (input.classList.contains("border-red-500")) {
                input.classList.replace("border-red-500", "border-green-500");
            } else {
                input.classList.add("border-green-500");
            }

            if (input.parentElement.tagName !== "TD") {
                input.previousElementSibling.querySelector("[data-invoice-role='error-message']") &&
                    input.previousElementSibling.removeChild(
                        input.previousElementSibling.querySelector(
                            "[data-invoice-role='error-message']"
                        )
                    );

                input.previousElementSibling.insertAdjacentHTML(
                    "beforeend",
                    `<i data-invoice-role="validation-symbol" class="fa-solid fa-circle-check text-green-500 ml-1"></i>`
                );
            } else {
            }
        } else {
            if (input.classList.contains("border-green-500")) {
                input.classList.replace("border-green-500", "border-red-500");
            } else {
                input.classList.add("border-red-500");
            }

            if (input.parentElement.tagName !== "TD") {
                input.previousElementSibling.querySelector("[data-invoice-role='error-message']") &&
                    input.previousElementSibling.removeChild(
                        input.previousElementSibling.querySelector(
                            "[data-invoice-role='error-message']"
                        )
                    );

                input.previousElementSibling.insertAdjacentHTML(
                    "beforeend",
                    `<i data-invoice-role="validation-symbol" class="fa-solid fa-exclamation-circle text-red-500 ml-1"></i>`
                );

                input.previousElementSibling.appendChild(
                    createElement({
                        className: "text-sm text-red-500 mt-1 tracking-wide",
                        tag: "p",
                        html: validationStatus,
                        attrs: {
                            dataInvoiceRole: "error-message",
                        },
                    })
                );
            }

            inputIsValid = false;
        }

        return inputIsValid;
    }

    viewForm(invoiceId) {
        let invoiceData;
        invoiceId && (invoiceData = this.getInvoice(invoiceId));

        this.rootOverlay.classList.toggle("hidden");

        this.form = createElement({
            tag: "form",
            className:
                "p-6 md:py-16 md:px-10 absolute left-0 w-full md:w-6/12 top-0 bottom-0 h-full overflow-y-scroll bg-white max-w-[700px] rounded-r-2xl z-[2]",
            attrs: {
                dataInvoiceRole: "form",
                tabindex: "-1",
            },
        });

        const formHeading = createElement({ tag: "p", className: "font-bold text-2xl mb-8" });

        invoiceId
            ? (formHeading.innerHTML = `Edit #${invoiceId}`)
            : (formHeading.innerHTML = "New Invoice");

        this.form.appendChild(formHeading);

        invoiceId ? this.generateFormItems(invoiceData) : this.generateFormItems();

        const buttonWrap = createElement({ className: "flex items-end mt-8 flex-wrap" });

        const submitButton = createButtonElement({
            type: "submit",
            attrs: {
                dataInvoiceRole: "submit-form",
            },
            additionalClasses: "inline ml-2 text-white",
        });

        invoiceId
            ? (submitButton.innerHTML = "Save Changes")
            : (submitButton.innerHTML = "Submit & Send");

        const cancelButton = createButtonElement({
            attrs: {
                dataInvoiceRole: "cancel-form",
            },
            additionalClasses: "inline mr-auto bg-red-500 hover:bg-red-400 text-white",
            html: "Cancel",
            type: "button",
        });

        buttonWrap.appendChild(cancelButton);
        buttonWrap.appendChild(submitButton);
        this.form.appendChild(buttonWrap);

        this.root.appendChild(this.form);

        const invoiceForm = document.querySelector("[data-invoice-role='form']");

        const removeFormFromDOM = () => {
            this.root.removeChild(document.querySelector("[data-invoice-role='form']"));
            this.rootOverlay.classList.toggle("hidden");
        };

        cancelButton.addEventListener("click", () => {
            removeFormFromDOM();
        });

        document.addEventListener("keyup", (event) => {
            if (event.key === "Escape") {
                if (this.root.querySelector("[data-invoice-role='form']") !== null) {
                    removeFormFromDOM();
                    document.removeEventListener("keyup", removeFormFromDOM);
                }
            }
        });

        invoiceForm.addEventListener("change", (event) => {
            this.validateInput(event.target);
        });

        invoiceForm.addEventListener("submit", (event) => {
            event.preventDefault();
            let formIsValid;

            [
                ...invoiceForm.querySelectorAll("input").forEach((input) => {
                    if (this.validateInput(input) !== true) {
                        formIsValid = false;
                    } else {
                        formIsValid = true;
                    }
                }),
            ];

            if (formIsValid) {
                const invoiceFormData = {};
                invoiceFormData["items"] = new Array();

                const invoiceInfoInputs = [...invoiceForm.querySelectorAll("input")].filter(
                    (input) => input.closest("[data-invoice-role='invoice-form-table']") === null
                );

                invoiceInfoInputs.forEach((input) => {
                    const inputName = input.name.replace(/_([a-z])/gi, (all, letter) =>
                        letter.toUpperCase()
                    );

                    invoiceFormData[inputName] = input.value;
                });

                document
                    .querySelectorAll("[data-invoice-role='invoice-form-table'] tbody tr")
                    .forEach((row) => {
                        let inputs = new Object();

                        row.querySelectorAll("input").forEach((input) => {
                            if (input.value) {
                                if (input.name !== "name") {
                                    inputs[input.name] = Number(input.value);
                                } else {
                                    inputs[input.name] = input.value;
                                }
                            }
                        });

                        Object.keys(inputs).length !== 0 && invoiceFormData.items.push(inputs);
                    });

                if (invoiceId) {
                    invoiceData.data = invoiceFormData;
                } else {
                    invoiceData = invoiceFormData;
                }

                this.submitInvoice(invoiceData, invoiceId);

                this.root.removeChild(invoiceForm);
                this.rootOverlay.classList.toggle("hidden");
            } else {
                // TODO: Below
                // buttonWrap.insertAdjacentHTML(
                //     "afterbegin",
                //     "<p class='w-full mb-8 text-red-500 font-semibold text-sm text-center'>You have errors in your form</p>"
                // );
            }
        });
    }

    viewInvoice(invoiceId) {
        const invoice = this.getInvoice(invoiceId);
        this.content.innerHTML = "";

        this.totalInvoices.classList.add("hidden");

        this.headerControls.classList.contains("hidden") ||
            this.headerControls.classList.add("hidden");

        this.backToInvoicesControl.classList.contains("hidden") &&
            this.backToInvoicesControl.classList.remove("hidden");

        this.backToInvoicesControl.addEventListener("click", (event) => {
            this.updateInvoicesList();
            this.backToInvoicesControl.classList.add("hidden");
        });

        const invoiceHeader = createElement({
            className: "rounded bg-white p-6 flex items-center shadow",
            attrs: {
                dataInvoiceRole: "invoice-controls",
            },
        });

        const statusElement = createStatusElement(invoice.isComplete, {
            tag: "div",
            additionalClasses: "text-sm ml-auto md:ml-0",
        });

        const invoiceControls = createElement({
            className:
                "flex ml-auto fixed bottom-0 w-full left-0 shadow md:shadow-none bg-white justify-center md:justify-end md:bg-none p-4 md:p-0 md:relative",
        });

        const editButton = createButtonElement({
            attrs: {
                dataInvoiceRole: "edit-invoice",
            },
            html: "Edit",
            additionalClasses: "mr-2 bg-blue-500 hover:bg-blue-400 text-white",
        });

        const deleteButton = createButtonElement({
            attrs: {
                dataInvoiceRole: "delete-invoice",
            },
            additionalClasses: "mr-2 bg-red-500 hover:bg-red-400 text-white",
            html: "Delete",
            type: "button",
        });

        const changeStatusButton = createButtonElement({
            attrs: {
                dataInvoiceRole: "change-invoice-status",
            },
            additionalClasses: "max-w-[11rem] w-full text-white items-center justify-center flex",
            html: invoice.isComplete ? "Mark as Pending" : "Mark as Paid",
            type: "button",
        });

        invoiceControls.appendChild(editButton);
        invoiceControls.appendChild(deleteButton);
        invoiceControls.appendChild(changeStatusButton);

        invoiceHeader.appendChild(
            createElement({
                tag: "p",
                html: "Status",
                className: "text-sm text-slate-500 mr-4",
            })
        );
        invoiceHeader.appendChild(statusElement);
        invoiceHeader.appendChild(invoiceControls);

        this.content.appendChild(invoiceHeader);

        invoiceControls.addEventListener("click", (event) => {
            const targetAttr = event.target.getAttribute("data-invoice-role");

            switch (targetAttr) {
                case "edit-invoice":
                    this.viewForm(invoiceId);
                    break;
                case "delete-invoice":
                    this.rootOverlay.classList.toggle("hidden");
                    const deletePromptElem = this.createDeletePrompt(invoiceId);
                    this.root.appendChild(deletePromptElem);
                    this.body.classList.toggle("overflow-y-hidden");

                    deletePromptElem.addEventListener("click", (event) => {
                        const targetAttr = event.target.getAttribute("data-invoice-role");

                        if (event.target.hasAttribute("data-invoice-role")) {
                            if (targetAttr === "del-prompt-confirm") {
                                this.deleteInvoice(invoiceId);
                            }

                            this.root.removeChild(deletePromptElem);
                            this.rootOverlay.classList.toggle("hidden");
                            this.backToInvoicesControl.classList.add("hidden");
                            this.body.classList.toggle("overflow-y-hidden");
                        }
                    });
                    break;
                case "change-invoice-status":
                    invoice.isComplete ? (invoice.isComplete = false) : (invoice.isComplete = true);
                    this.submitInvoice(invoice, invoiceId);
                    break;
            }
        });

        this.content.appendChild(this.displayInvoiceData(invoice));
    }
}

export default View;
