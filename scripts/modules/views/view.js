class View {
    constructor() {
        this.ui = document.querySelector("#main");

        // New Invoice Elem
        this.getFormButtonElem = this.generateElement(
            "button",
            "get-invoice-form",
            "New Invoice"
        );
        this.ui.appendChild(this.getFormButtonElem);

        this.getFormButtonElem.addEventListener("click", () => {
            if (
                this.ui.querySelector(
                    "[data-invoice-role='new-invoice-form']"
                ) === null
            ) {
                this.viewForm();
            }
        });

        // Invoice Form: Submit
        this.invoiceFormButtonElem = this.generateElement(
            "button",
            "submit-form",
            "Submit"
        );

        // Filter Invoices: Select and options
        this.filterSelect = this.generateElement(
            "select",
            "filter-invoices",
            ""
        );
        const paidSelectOption = this.generateElement("option", "", "Paid");
        paidSelectOption.value = "paid";
        const pendingSelectOption = this.generateElement(
            "option",
            "",
            "Pending"
        );
        pendingSelectOption.value = "pending";
        const allSelectOption = this.generateElement("option", "", "All");
        allSelectOption.value = "all";

        this.filterSelect.add(allSelectOption);
        this.filterSelect.add(paidSelectOption);
        this.filterSelect.add(pendingSelectOption);

        this.sortOrder;
    }

    generateElement(tag, role, text) {
        let element = document.createElement(tag);
        role && element.setAttribute("data-invoice-role", role);
        text && (element.textContent = text);

        return element;
    }

    viewForm(invoiceId) {
        let invoiceData = this.getInvoice(invoiceId);

        // Invoice Form
        this.invoiceFormElem = this.generateElement("form", "new-invoice-form");
        this.ui.appendChild(this.invoiceFormElem);

        // Invoice Form: Name
        this.nameInput = this.generateElement("input");
        this.nameInput.id = "name";
        this.nameInput.placeholder = "Name";

        this.invoiceFormElem.appendChild(this.nameInput);
        this.invoiceFormElem.appendChild(this.invoiceFormButtonElem);

        // Invoice Form: Inputs - Pre-populate with data
        this.invoiceFormInputs = {
            name: this.invoiceFormElem.querySelector("#name"),
        };

        if (invoiceId) {
            this.invoiceFormElem.elements["name"].value = invoiceData.data.name;
        }

        this.invoiceFormElem.addEventListener("submit", (event) => {
            event.preventDefault();

            const invoiceFormData = {
                name: this.invoiceFormInputs.name.value,
            };

            if (invoiceId) {
                invoiceData.data = invoiceFormData;
            } else {
                invoiceData = invoiceFormData;
            }

            this.submitInvoice(invoiceData, invoiceId);

            this.ui.removeChild(this.invoiceFormElem);
        });
    }

    viewInvoices(invoices) {
        if (this.ui.querySelector("[data-invoice-role='list-invoices']")) {
            this.ui.removeChild(this.invoiceListElem);
        }

        this.invoiceListElem = this.generateElement("div", "list-invoices");
        this.ui.appendChild(this.invoiceListElem);
        this.invoiceListElem.appendChild(this.filterSelect);

        if (invoices.length > 0) {
            this.invoiceList = this.generateElement("ul", "invoice-list", "");
            this.sortInvoices(invoices, this.sortOrder);

            this.filterSelect.addEventListener("change", (event) => {
                this.sortOrder = event.target.value;
                this.sortInvoices(invoices, this.sortOrder);
            });

            this.invoiceListElem.addEventListener("click", (event) => {
                if (
                    event.target.getAttribute("data-invoice-role") ===
                    "list-item-link"
                ) {
                    let invoiceId = parseInt(
                        event.target.getAttribute("data-invoice-id")
                    );

                    if (
                        this.ui.querySelector(
                            "[data-invoice-role='view-invoice']"
                        ) === null
                    ) {
                        this.viewInvoice(invoiceId);
                    }
                }
            });
        } else {
            this.invoiceListElem.innerHTML = "No invoices!";
        }
    }

    sortInvoices(invoices, sortOrder) {
        let filteredInvoices;

        if (document.querySelector("[data-invoice-role='invoice-list']")) {
            this.invoiceListElem.removeChild(this.invoiceList);
        }

        this.invoiceList = this.generateElement("ul", "invoice-list", "");

        if (sortOrder === "paid") {
            filteredInvoices = invoices.filter((invoice) => invoice.isComplete);
        } else if (sortOrder === "pending") {
            filteredInvoices = invoices.filter(
                (invoice) => !invoice.isComplete
            );
        } else {
            filteredInvoices = invoices;
        }

        this.invoiceListElem.appendChild(this.invoiceList);

        filteredInvoices.forEach((invoice) => {
            let listItem = this.generateElement("li", "list-item");
            let listItemLink = this.generateElement(
                "button",
                "list-item-link",
                `${invoice.data.name}`
            );
            listItemLink.setAttribute("data-invoice-id", invoice.id);

            listItem.appendChild(listItemLink);
            this.invoiceList.appendChild(listItem);
        });
    }

    viewInvoice(invoiceId) {
        let invoice = this.getInvoice(invoiceId);

        // Invoice
        this.invoiceElem = this.generateElement("div", "view-invoice");

        let deleteButton = this.generateElement(
            "button",
            "delete-invoice",
            "Delete"
        );

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

        let backButton = this.generateElement(
            "button",
            "back-to-invoices",
            "Go Back"
        );

        let paidButton = this.generateElement(
            "button",
            "change-inv-status",
            invoice.isComplete ? "Mark as Pending" : "Mark as Paid"
        );

        this.ui.appendChild(this.invoiceElem);
        this.invoiceElem.appendChild(deleteButton);
        this.invoiceElem.appendChild(editButton);
        this.invoiceElem.appendChild(backButton);
        this.invoiceElem.appendChild(paidButton);

        this.invoiceElem.appendChild(this.generateElement("p", "", invoice.id));

        this.invoiceElem.appendChild(
            this.generateElement(
                "p",
                "",
                invoice.isComplete ? "Paid" : "Pending"
            )
        );

        for (const property in invoice.data) {
            this.invoiceElem.appendChild(
                this.generateElement("p", "", invoice.data[property])
            );
        }

        this.invoiceElem.addEventListener("click", (event) => {
            const targetAttr = event.target.getAttribute("data-invoice-role");

            if (targetAttr === "edit-invoice") {
                this.viewForm(invoiceId);
                this.ui.removeChild(this.invoiceElem);
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
                        this.ui.removeChild(this.invoiceElem);
                    }
                });
            } else if (targetAttr === "back-to-invoices") {
                this.ui.removeChild(this.invoiceElem);
            } else if (targetAttr === "change-inv-status") {
                invoice.isComplete
                    ? (invoice.isComplete = false)
                    : (invoice.isComplete = true);
                this.submitInvoice(invoice, invoiceId);
                this.ui.removeChild(this.invoiceElem);
            }
        });
    }
}

export default View;
