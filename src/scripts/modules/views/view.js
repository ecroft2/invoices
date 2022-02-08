import {
    createElement,
    createInputElement,
    createButtonElement,
    // createInvoiceListElement,
} from "./elements.js";

class View {
    constructor() {
        this.root = document.querySelector(".root");
        this.header = document.querySelector(".header");
        this.content = document.querySelector(".content");

        this.totalInvoices = document.querySelector("[data-invoice-role='count-invoices']");
        this.newFormButton = document.querySelector("[data-invoice-role='get-new-form']");

        this.header.appendChild(this.newFormButton);

        this.newFormButton.addEventListener("click", () => {
            this.root.querySelector("[data-invoice-role='form-wrap']") === null && this.viewForm();
        });

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
        const formFragment = document.createDocumentFragment();
        const form = createElement({
            tag: "form",
            className: "form-overlay",
            attrs: {
                invoiceRole: "form",
            },
        });

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

        // Button
        const submitButton = createButtonElement({
            type: "submit",
            html: "Save Invoice",
            attrs: {
                invoiceRole: "submit-form",
            },
            additionalClasses: "ml-auto",
        });

        form.appendChild(fromInputsFieldset);
        form.appendChild(toInputsFieldset);
        form.appendChild(submitButton);
        formFragment.appendChild(form);

        return formFragment;
    }

    viewForm(invoiceId) {
        this.root.appendChild(this.generateFormItems());
        let invoiceForm = document.querySelector("[data-invoice-role='form']");
        let invoiceData;

        // Invoice Form: Inputs - Pre-populate with data
        // this.invoiceFormInputs = {
        //     senderFrom: this.invoiceFormElem.querySelector("#senderFrom"),
        // };

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
                    <span class="text-slate-500 font-semibold py-3 px-6 rounded ${
                        invoice.isComplete
                            ? "bg-green-100 text-green-500"
                            : "bg-orange-100 text-orange-500"
                    }">
                        <i class="fas fa-circle fa-xs mr-1"></i>
                        ${invoice.isComplete ? "Paid" : "Pending"}
                    </span>
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
        let invoice = this.getInvoice(invoiceId);

        // Invoice
        this.invoiceElem = this.generateElement("div", "invoice-data");

        let deleteButton = this.generateElement("button", "delete-invoice", "Delete");

        let deletePromptWrap = this.generateElement(
            "div",
            "prompt-delete-invoice-wrap",
            "Are you sure you want to delete your invoice?"
        );
        let deletePromptWrapConfirmButton = this.generateElement(
            "button",
            "prompt-delete-invoice-confirm",
            "Delete"
        );
        let deletePromptWrapCancelButton = this.generateElement(
            "button",
            "prompt-delete-invoice-cancel",
            "Cancel"
        );

        let editButton = this.generateElement("button", "edit-invoice", "Edit");

        let backButton = this.generateElement("button", "back-to-invoices", "Go Back");

        let paidButton = this.generateElement(
            "button",
            "change-inv-status",
            invoice.isComplete ? "Mark as Pending" : "Mark as Paid"
        );

        this.content.appendChild(this.invoiceElem);
        this.invoiceElem.appendChild(deleteButton);
        this.invoiceElem.appendChild(editButton);
        this.invoiceElem.appendChild(backButton);
        this.invoiceElem.appendChild(paidButton);

        this.invoiceElem.appendChild(this.generateElement("p", "", invoice.id));

        this.invoiceElem.appendChild(
            this.generateElement("p", "", invoice.isComplete ? "Paid" : "Pending")
        );

        for (const property in invoice.data) {
            this.invoiceElem.appendChild(this.generateElement("p", "", invoice.data[property]));
        }

        this.invoiceElem.addEventListener("click", (event) => {
            const targetAttr = event.target.getAttribute("data-invoice-role");

            if (targetAttr === "edit-invoice") {
                this.viewForm(invoiceId);
                this.content.removeChild(this.invoiceElem);
            } else if (targetAttr === "delete-invoice") {
                this.invoiceElem.appendChild(deletePromptWrap);
                deletePromptWrap.appendChild(deletePromptWrapCancelButton);
                deletePromptWrap.appendChild(deletePromptWrapConfirmButton);

                deletePromptWrap.addEventListener("click", (event) => {
                    if (
                        event.target.getAttribute("data-invoice-role") ===
                        "prompt-delete-invoice-cancel"
                    ) {
                        this.invoiceElem.removeChild(deletePromptWrap);
                    } else if (
                        event.target.getAttribute("data-invoice-role") ===
                        "prompt-delete-invoice-confirm"
                    ) {
                        this.deleteInvoice(invoiceId);
                        this.content.removeChild(this.invoiceElem);
                    }
                });
            } else if (targetAttr === "back-to-invoices") {
                this.content.removeChild(this.invoiceElem);
            } else if (targetAttr === "change-inv-status") {
                invoice.isComplete ? (invoice.isComplete = false) : (invoice.isComplete = true);
                this.submitInvoice(invoice, invoiceId);
                this.content.removeChild(this.invoiceElem);
            }
        });
    }
}

export default View;
