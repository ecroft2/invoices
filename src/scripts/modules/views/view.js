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

    generateElement(tag, role, text) {
        let element = document.createElement(tag);
        role && element.setAttribute("data-invoice-role", role);
        text && (element.textContent = text);

        return element;
    }

    generateFormItems() {
        // Bill From
        const fromInputsFieldset = createElement({ tag: "fieldset" });
        const fromInputsLegend = createElement({
            tag: "legend",
            html: "Bill From",
            className: "font-bold text-purple-600 text-xs mb-6",
        });
        const fromAddress = createInputElement("from_address", "Address", "text");
        const fromCity = createInputElement("from_city", "City", "text");
        const fromPostcode = createInputElement("from_postcode", "Postcode", "text");
        const fromCountry = createInputElement("from_country", "Country", "text");

        const fromThreeColumns = createElement({ tag: "div", className: "flex gap-x-4" });
        fromThreeColumns.appendChild(fromCity);
        fromThreeColumns.appendChild(fromPostcode);
        fromThreeColumns.appendChild(fromCountry);

        fromInputsFieldset.appendChild(fromInputsLegend);
        fromInputsFieldset.appendChild(fromAddress);
        fromInputsFieldset.appendChild(fromThreeColumns);

        // Bill To
        const toInputsFieldset = createElement({ tag: "fieldset" });
        const toInputsLegend = createElement({
            tag: "legend",
            html: "Bill To",
            className: "font-bold text-purple-600 text-xs mb-6",
        });
        const toName = createInputElement("to_name", "Name", "text");
        const toEmail = createInputElement("to_email", "Email", "text");
        const toAddress = createInputElement("to_address", "Street Address", "text");
        const toCity = createInputElement("to_city", "City", "text");
        const toPostcode = createInputElement("to_postcode", "Postcode", "text");
        const toCountry = createInputElement("to_country", "Country", "text");
        const toDate = createInputElement("to_date", "Invoice Date", "");
        const toPaymentTerms = createInputElement("to_payment_terms", "Payment Terms", "");
        const toPaymentDesc = createInputElement("to_payment_desc", "Payment Description", "text");

        toInputsFieldset.appendChild(toInputsLegend);
        toInputsFieldset.appendChild(toName);
        toInputsFieldset.appendChild(toEmail);
        toInputsFieldset.appendChild(toAddress);

        const toThreeColumns = createElement({ tag: "div", className: "flex gap-x-4" });

        toThreeColumns.appendChild(toCity);
        toThreeColumns.appendChild(toPostcode);
        toThreeColumns.appendChild(toCountry);

        toInputsFieldset.appendChild(toThreeColumns);

        const toTwoColumns = createElement({ tag: "div", className: "flex gap-x-4" });

        toTwoColumns.appendChild(toDate);
        toTwoColumns.appendChild(toPaymentTerms);

        toInputsFieldset.appendChild(toTwoColumns);
        toInputsFieldset.appendChild(toPaymentDesc);

        this.form.appendChild(fromInputsFieldset);
        this.form.appendChild(toInputsFieldset);
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
            additionalClasses: "inline ml-2",
        });

        invoiceId
            ? (submitButton.innerHTML = "Save Changes")
            : (submitButton.innerHTML = "Submit & Send");

        const cancelButton = createButtonElement({
            attrs: {
                invoiceRole: "cancel-form",
            },
            additionalClasses: "inline ml-auto bg-red-500 hover:bg-red-400",
            html: "Cancel",
            type: "button",
        });

        buttonWrap.appendChild(cancelButton);
        buttonWrap.appendChild(submitButton);
        this.form.appendChild(buttonWrap);

        this.root.appendChild(this.form);

        let invoiceForm = document.querySelector("[data-invoice-role='form']");
        let invoiceData;

        if (invoiceId) {
            invoiceData = this.getInvoice(invoiceId);

            for (const [key, value] of Object.entries(invoiceData.data)) {
                let inputName = key.replace(/[A-Z]/g, (l) => "_" + l.toLowerCase());

                invoiceForm.elements[inputName].value = value;
            }
        }

        invoiceForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const invoiceFormData = {};

            const inputs = invoiceForm.querySelectorAll("input");

            [...inputs].forEach((input) => {
                const inputName = input.name.replace(/_([a-z])/gi, (all, letter) =>
                    letter.toUpperCase()
                );

                invoiceFormData[inputName] = input.value;
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

    viewInvoices(invoices) {
        this.content.innerHTML = "";

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
            let listItem = createElement({
                tag: "li",
                attrs: {
                    invoiceRole: "list-item",
                },
            });

            listItem.innerHTML = `
                <button data-invoice-role="view-invoice" data-invoice-id="${
                    invoice.id
                }" class="flex items-center text-xs justify-evenly mb-4 bg-white p-4 w-full">
                    <span class="font-bold text-base">#${invoice.id}</span>
                    <span class="text-slate-500">${invoice.data.toName}</span>
                    ${createStatusElement(invoice.isComplete, { tag: "span" })}
                </button>
            `;

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
        this.headerControls.classList.toggle("hidden");

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
            additionalClasses: "inline mr-2 bg-red-500 hover:bg-red-400",
            html: "Delete",
            type: "button",
        });

        const changeStatusButton = createButtonElement({
            attrs: {
                invoiceRole: "change-invoice-status",
            },
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

        const invoiceElem = createElement({
            attrs: {
                invoiceRole: "invoice-data",
            },
        });

        this.content.appendChild(invoiceElem);

        invoiceElem.appendChild(this.generateElement("p", "", invoice.id));

        for (const property in invoice.data) {
            invoiceElem.appendChild(this.generateElement("p", "", invoice.data[property]));
        }

        invoiceControls.addEventListener("click", (event) => {
            const targetAttr = event.target.getAttribute("data-invoice-role");

            switch (targetAttr) {
                case "edit-invoice":
                    this.viewForm(invoiceId);
                    this.content.removeChild(invoiceElem);
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
                                this.headerControls.classList.toggle("hidden");
                            }

                            this.root.removeChild(deletePromptElem);
                            this.rootOverlay.classList.toggle("hidden");
                        }
                    });
                    break;
            }

            // // if (targetAttr === "edit-invoice") {
            // } else if (targetAttr === "delete-invoice") {
            //     invoiceElem.appendChild(deletePromptWrap);
            //     deletePromptWrap.appendChild(deletePromptWrapCancelButton);
            //     deletePromptWrap.appendChild(deletePromptWrapConfirmButton);

            //     deletePromptWrap.addEventListener("click", (event) => {
            //         if (
            //             event.target.getAttribute("data-invoice-role") ===
            //             "prompt-delete-invoice-cancel"
            //         ) {
            //             invoiceElem.removeChild(deletePromptWrap);
            //         } else if (
            //             event.target.getAttribute("data-invoice-role") ===
            //             "prompt-delete-invoice-confirm"
            //         ) {
            //             this.deleteInvoice(invoiceId);
            //             this.content.removeChild(invoiceElem);
            //         }
            //     });
            // } else if (targetAttr === "back-to-invoices") {
            //     this.content.removeChild(invoiceElem);
            // } else if (targetAttr === "change-invoice-status") {
            //     invoice.isComplete ? (invoice.isComplete = false) : (invoice.isComplete = true);
            //     this.submitInvoice(invoice, invoiceId);
            //     this.content.removeChild(invoiceElem);
            // }
        });
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
            additionalClasses: "inline bg-red-500 hover:bg-red-400",
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
}

export default View;
