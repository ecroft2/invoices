import {
    createElement,
    createInputElement,
    createButtonElement,
    createStatusElement,
} from "./elements.js";

class View {
    constructor() {
        this.root = document.querySelector(".root");
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
            className: "overlay hidden",
        });
        this.root.appendChild(this.rootOverlay);

        // Filter Invoices: Select and options
        this.filterSelect = document.querySelector("[data-invoice-role='filter']");
        this.sortOrder;
    }

    generateFormItems() {
        // Bill From Inputs
        const fromInputsFieldset = createElement({ tag: "fieldset" });
        const fromInputsLegend = createElement({
            tag: "legend",
            html: "Bill From",
            className: "font-bold text-purple-600 text-xs mb-6 text-white",
        });
        const fromAddress = createInputElement("from_address", "Address", "text");
        const fromCity = createInputElement("from_city", "City", "text");
        const fromPostcode = createInputElement("from_postcode", "Postcode", "text");
        const fromCountry = createInputElement("from_country", "Country", "text");

        const fromColumns = createElement({ tag: "div", className: "flex gap-x-4" });
        fromColumns.appendChild(fromCity);
        fromColumns.appendChild(fromPostcode);
        fromColumns.appendChild(fromCountry);

        fromInputsFieldset.appendChild(fromInputsLegend);
        fromInputsFieldset.appendChild(fromAddress);
        fromInputsFieldset.appendChild(fromColumns);
        this.form.appendChild(fromInputsFieldset);

        // Bill To Inputs
        const toInputsFieldset = createElement({ tag: "fieldset" });
        const toInputsLegend = createElement({
            tag: "legend",
            html: "Bill To",
            className: "font-bold text-purple-600 text-xs mb-6 text-white",
        });
        const toName = createInputElement("to_name", "Name", "text");
        const toEmail = createInputElement("to_email", "Email", "text");
        const toAddress = createInputElement("to_address", "Street Address", "text");
        const toCity = createInputElement("to_city", "City", "text");
        const toPostcode = createInputElement("to_postcode", "Postcode", "text");
        const toCountry = createInputElement("to_country", "Country", "text");

        toInputsFieldset.appendChild(toInputsLegend);
        toInputsFieldset.appendChild(toName);
        toInputsFieldset.appendChild(toEmail);
        toInputsFieldset.appendChild(toAddress);

        const toColumns = createElement({ tag: "div", className: "flex gap-x-4" });

        toColumns.appendChild(toCity);
        toColumns.appendChild(toPostcode);
        toColumns.appendChild(toCountry);
        toInputsFieldset.appendChild(toColumns);
        this.form.appendChild(toInputsFieldset);

        // Other Inputs
        const otherInputsFieldset = createElement({ tag: "fieldset" });
        const otherInputsLegend = createElement({
            tag: "legend",
            html: "Details",
            className: "font-bold text-purple-600 text-xs mb-6 text-white",
        });

        const date = createInputElement("date", "Invoice Date", "");
        const paymentTerms = createInputElement("payment_terms", "Payment Terms", "");
        const paymentDesc = createInputElement("payment_desc", "Payment Description", "text");

        const otherColumns = createElement({ tag: "div", className: "flex gap-x-4" });

        otherColumns.appendChild(date);
        otherColumns.appendChild(paymentTerms);

        otherInputsFieldset.appendChild(otherInputsLegend);
        otherInputsFieldset.appendChild(otherColumns);
        otherInputsFieldset.appendChild(paymentDesc);
        this.form.appendChild(otherInputsFieldset);

        // Invoice Items Inputs
        const invoiceItemsFieldset = createElement({ tag: "fieldset" });
        const invoiceItemsLegend = createElement({
            tag: "legend",
            html: "Item List",
            className: "font-bold text-slate-500 text-base mb-4",
        });

        invoiceItemsFieldset.appendChild(invoiceItemsLegend);
        invoiceItemsFieldset.appendChild(this.generateFormItemsList());

        this.form.appendChild(invoiceItemsFieldset);

        const invoiceItemsTable = this.form.querySelector(
            `[data-invoice-role="invoice-form-table"]`
        );

        invoiceItemsTable.addEventListener("click", (event) => {
            event.target.getAttribute("data-invoice-role") === "remove-row" &&
                invoiceItemsTable.removeChild(event.target.closest("tr"));
        });
    }

    generateFormItemsList() {
        const formItems = document.createDocumentFragment();

        const table = createElement({
            tag: "table",
            className: "w-full mb-8",
            attrs: {
                invoiceRole: "invoice-form-table",
            },
        });
        table.innerHTML = `
            <thead>
                <tr class="text-slate-500 text-left">
                    <th class="font-normal text-xs pr-2">Item Name</th>
                    <th class="font-normal text-xs w-[3rem] pr-2">Qty.</th>
                    <th class="font-normal text-xs w-[75px] pr-2">Price</th>
                    <th class="font-normal text-xs w-[85px] pr-2">Total</th>
                    <th class="w-[1rem]"></th>
                </tr>
            </thead>
        `;
        table.style.borderSpacing = "20px";

        const addItemButton = createButtonElement({
            html: `<i class="fas fa-plus"></i> Add New Item`,
            additionalClasses: "bg-neutral-200 hover:bg-neutral-100 text-neutral-600 w-full mb-8",
            type: "button",
        });

        formItems.appendChild(table);
        table.appendChild(this.generateFormRow());
        formItems.appendChild(addItemButton);

        addItemButton.addEventListener("click", (event) => {
            table.appendChild(this.generateFormRow());
        });

        return formItems;
    }

    generateFormRow(data) {
        const row = createElement({ tag: "tr" });
        const fieldClasses =
            "w-full py-4 text-xs rounded border border-solid border-slate-300 font-bold";

        const nameField = createElement({ tag: "td", className: "pr-2 pt-4" });
        const nameFieldInput = createElement({
            tag: "input",
            className: fieldClasses + " px-4",
        });
        nameFieldInput.name = "name";
        data && (nameFieldInput.value = data["name"]);
        nameField.appendChild(nameFieldInput);

        const quantityField = createElement({ tag: "td", className: "pr-2 pt-4 max-w-[3rem]" });
        const quantityFieldInput = createElement({
            tag: "input",
            className: fieldClasses + " px-2 text-center",
        });
        quantityFieldInput.name = "quantity";
        data && (quantityFieldInput.value = data["quantity"]);
        quantityField.appendChild(quantityFieldInput);

        const priceField = createElement({ tag: "td", className: "pr-2 pt-4 max-w-[75px]" });
        const priceFieldInput = createElement({
            tag: "input",
            className: fieldClasses + " px-2",
        });
        priceFieldInput.name = "price";
        data && (priceFieldInput.value = data["price"]);
        priceField.appendChild(priceFieldInput);

        const totalAmount = createElement({
            tag: "td",
            className: "text-slate-500 font-bold text-xs pr-2 pt-4 w-[85px]",
        });

        row.addEventListener("change", (event) => {
            totalAmount.innerHTML = "";

            if (quantityFieldInput.value && priceFieldInput.value) {
                totalAmount.innerHTML =
                    "£" + (quantityFieldInput.value * priceFieldInput.value).toFixed(2);
            }
        });

        const removeRowTrigger = createElement({
            tag: "td",
            className: "pt-4",
            html: `<i class="fas fa-trash text-slate-500 hover:text-slate-400 cursor-pointer" data-invoice-role="remove-row"></i>`,
        });

        row.appendChild(nameField);
        row.appendChild(quantityField);
        row.appendChild(priceField);
        row.appendChild(totalAmount);
        row.appendChild(removeRowTrigger);

        return row;
    }

    viewForm(invoiceId) {
        this.rootOverlay.classList.toggle("hidden");

        this.form = createElement({
            tag: "form",
            className: "form-overlay",
            attrs: {
                invoiceRole: "form",
            },
        });

        const formHeading = createElement({ tag: "p", className: "font-bold text-2xl mb-8" });

        invoiceId
            ? (formHeading.innerHTML = `Edit #${invoiceId}`)
            : (formHeading.innerHTML = "New Invoice");

        this.form.appendChild(formHeading);

        this.generateFormItems();

        const buttonWrap = createElement({ className: "flex items-end" });

        const submitButton = createButtonElement({
            type: "submit",
            attrs: {
                invoiceRole: "submit-form",
            },
            additionalClasses: "inline ml-2 text-white",
        });

        invoiceId
            ? (submitButton.innerHTML = "Save Changes")
            : (submitButton.innerHTML = "Submit & Send");

        const cancelButton = createButtonElement({
            attrs: {
                invoiceRole: "cancel-form",
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
        let invoiceData;

        if (invoiceId) {
            invoiceData = this.getInvoice(invoiceId);

            for (const [key, value] of Object.entries(invoiceData.data)) {
                if (key !== "items") {
                    let inputName = key.replace(/[A-Z]/g, (l) => "_" + l.toLowerCase());

                    invoiceForm.elements[inputName].value = value;
                }
            }

            const invoiceFormTable = document.querySelector(
                `[data-invoice-role="invoice-form-table"]`
            );

            // invoiceFormTable.removeChild(invoiceFormTable.querySelectorAll("tr"));
            invoiceFormTable.querySelectorAll("tr").forEach((row) => {
                console.log(row);
                // invoiceFormTable.removeChild(row);
            });

            invoiceData.data.items.forEach((item) => {
                invoiceFormTable.appendChild(this.generateFormRow(item));
            });
        }

        cancelButton.addEventListener("click", () => {
            this.root.removeChild(invoiceForm);
            this.rootOverlay.classList.toggle("hidden");
        });

        invoiceForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const invoiceFormData = {};
            invoiceFormData["items"] = new Array();

            const inputs = invoiceForm.querySelectorAll("input");

            [...inputs].forEach((input) => {
                const inputName = input.name.replace(/_([a-z])/gi, (all, letter) =>
                    letter.toUpperCase()
                );

                invoiceFormData[inputName] = input.value;
            });

            document
                .querySelectorAll(`[data-invoice-role="invoice-form-table"] > tr`)
                .forEach((row) => {
                    let inputs = new Object();

                    row.querySelectorAll("input").forEach((input) => {
                        inputs[input.name] = input.value;
                    });

                    invoiceFormData.items.push(inputs);
                });

            if (invoiceId) {
                invoiceData.data = invoiceFormData;
            } else {
                invoiceData = invoiceFormData;
            }

            this.submitInvoice(invoiceData, invoiceId);

            this.root.removeChild(invoiceForm);
            this.rootOverlay.classList.toggle("hidden");
        });
    }

    updateInvoices(data) {
        const invoices = data.invoices;

        this.content.innerHTML = "";

        this.headerControls.classList.contains("hidden") &&
            this.headerControls.classList.remove("hidden");

        this.totalInvoices.classList.contains("hidden") &&
            this.totalInvoices.classList.remove("hidden");

        if (invoices.length > 0) {
            this.totalInvoices.innerHTML = `${
                invoices.length === 1
                    ? `There is 1 invoice.`
                    : `There are ${invoices.length} total invoices.`
            }`;

            this.createInvoiceList(invoices, this.sortOrder);

            this.filterSelect.addEventListener("change", (event) => {
                this.sortOrder = event.target.value;
                this.createInvoiceList(invoices, this.sortOrder);
            });
        } else {
            this.totalInvoices.innerHTML = "There are no invoices.";
            this.content.innerHTML = "No invoices!";
        }
    }

    createInvoiceList(invoices, invoiceSortOrder) {
        let filteredInvoices;

        this.content.querySelector("[data-invoice-role='invoices-list']") &&
            (this.content.innerHTML = "");

        const invoicesList = createElement({
            tag: "ul",
            attrs: {
                invoiceRole: "invoices-list",
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
                    invoiceRole: "view-invoice",
                    invoiceId: invoice.id,
                },
                className:
                    "flex items-center rounded text-xs justify-evenly mb-4 bg-white p-4 w-full cursor-pointer",
            });

            listItem.innerHTML = `
                <span class="font-bold text-base">#${invoice.id}</span>
                <span class="text-slate-500">${invoice.data.toName}</span>
            `;

            listItem.appendChild(createStatusElement(invoice.isComplete, { tag: "span" }));

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

    viewInvoice(invoiceId) {
        const invoice = this.getInvoice(invoiceId);
        this.content.innerHTML = ``;

        this.totalInvoices.innerHTML = "";

        this.headerControls.classList.contains("hidden") ||
            this.headerControls.classList.add("hidden");

        // const backToInvoicesElem = createElement({
        //     attrs: {
        //         invoiceRole: "back-to-invoices",
        //     },
        //     className: "group text-xs font-bold flex cursor-pointer",
        //     html: `<i class="fas fa-angle-left text-purple-600 group-hover:text-purple-500 mr-2 text-base leading-[14px]"></i>`,
        // });
        // backToInvoicesElem.insertAdjacentHTML("beforeend", "Go back");

        // this.header.appendChild(backToInvoicesElem);

        // backToInvoicesElem.addEventListener("click", event => {
        //     this.updateInvoices()
        // });

        const invoiceControls = createElement({
            className: "rounded bg-white p-6 flex items-center drop-shadow-sm",
            attrs: {
                invoiceRole: "invoice-controls",
            },
        });

        const statusElement = createStatusElement(invoice.isComplete, {
            tag: "div",
            additionalClasses: "text-xs",
        });

        const editButton = createButtonElement({
            attrs: {
                invoiceRole: "edit-invoice",
            },
            html: "Edit",
            additionalClasses: "inline mr-2 ml-auto bg-blue-500 hover:bg-blue-400",
        });

        const deleteButton = createButtonElement({
            attrs: {
                invoiceRole: "delete-invoice",
            },
            additionalClasses: "inline mr-2 bg-red-500 hover:bg-red-400 text-white",
            html: "Delete",
            type: "button",
        });

        const changeStatusButton = createButtonElement({
            attrs: {
                invoiceRole: "change-invoice-status",
            },
            additionalClasses: "max-w-[9rem] w-full",
            html: invoice.isComplete ? "Mark as Pending" : "Mark as Paid",
            type: "button",
        });

        invoiceControls.appendChild(
            createElement({
                tag: "p",
                html: "Status",
                className: "text-xs text-slate-500 mr-4",
            })
        );
        invoiceControls.appendChild(statusElement);
        invoiceControls.appendChild(editButton);
        invoiceControls.appendChild(deleteButton);
        invoiceControls.appendChild(changeStatusButton);

        this.content.appendChild(invoiceControls);

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

                    deletePromptElem.addEventListener("click", (event) => {
                        const targetAttr = event.target.getAttribute("data-invoice-role");

                        if (event.target.hasAttribute("data-invoice-role")) {
                            if (targetAttr === "del-prompt-confirm") {
                                this.deleteInvoice(invoiceId);
                            }

                            this.root.removeChild(deletePromptElem);
                            this.rootOverlay.classList.toggle("hidden");
                        }
                    });
                    break;
                case "change-invoice-status":
                    invoice.isComplete ? (invoice.isComplete = false) : (invoice.isComplete = true);
                    this.submitInvoice(invoice, invoiceId);
                    break;
            }
        });

        this.content.appendChild(this.createInvoiceTable(invoice));
    }

    createDeletePrompt(invoiceId) {
        const deletePromptElem = createElement({
            className:
                "absolute bg-white top-2/4 z-[1] rounded p-8 max-w-lg -translate-y-2/4 translate-x-2/4",
        });
        const deleteButtonWrapElem = createElement({
            className: "flex justify-end",
        });
        const deletePromptCancelElem = createButtonElement({
            attrs: {
                invoiceRole: "del-prompt-cancel",
            },
            html: "Cancel",
            additionalClasses: "inline mr-2 bg-blue-500 hover:bg-blue-400",
        });
        const deletePromptConfirmElem = createButtonElement({
            attrs: {
                invoiceRole: "del-prompt-confirm",
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
                className: "text-xs text-slate-500 pb-4",
            })
        );
        deletePromptElem.appendChild(deleteButtonWrapElem);

        return deletePromptElem;
    }

    createInvoiceTable(invoiceData) {
        const { id } = invoiceData;
        const table = createElement({
            className: "p-8 rounded bg-white",
            attrs: { invoiceId: id },
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
        } = invoiceData.data;

        table.innerHTML = `
            <div class="flex mb-4">
                <div class="mr-auto pr-2">
                    <p class="font-bold text-base mb-2"><span class="text-slate-500">#</span>${id}</p>
                    <p class="text-xs text-slate-500">${paymentDesc}</p>
                </div>
                <div class="ml-auto pl-2 text-right text-slate-500 text-xs">
                    <p>${fromAddress}</p>
                    <p>${fromCity}</p>
                    <p>${fromPostcode}</p>
                    <p>${fromCountry}</p>
                </div>
            </div>

            <div class="flex mb-8">
                <div class="flex justify-between flex-col w-1/3 pr-4">
                    <div>
                        <p class="text-slate-500 text-xs mb-2">Invoice Date</p>
                        <p class="text-base font-bold">${date}</p>
                    </div>
                    <div>
                        <p class="text-slate-500 text-xs mb-2">Payment Due</p>
                        <p class="text-base font-bold">${paymentTerms}</p>
                    </div>
                </div>
                <div class="w-1/3 pr-4">
                    <p class="text-slate-500 text-xs mb-2">Bill To</p>
                    <p class="text-base font-bold mb-2">${toName}</p>
                    <div class="text-xs text-slate-500">
                        <p>${toAddress}</p>
                        <p>${toCity}</p>
                        <p>${toPostcode}</p>
                        <p>${toCountry}</p>
                    </div>
                </div>
                <div class="col">
                    <p class="text-slate-500 text-xs mb-2">Sent To</p>
                    <p class="font-bold">${toEmail}</p>
                </div>
            </div>
        `;

        return table;
    }
}

export default View;
