class Model {
    constructor() {
        this.invoices = [];
        this.counter = 0;
    }

    addInvoice(data) {
        this.invoices.push({
            id: this.generateId(),
            isComplete: false,
            data: {
                name: data.name,
            },
        });

        this.invoiceChangeHandler(this.invoices);
    }

    deleteInvoice(id) {
        this.invoices = this.invoices.filter((invoice) => invoice.id !== id);
        this.invoiceChangeHandler(this.invoices);
    }

    editInvoice(invoiceId, invoiceData) {
        this.invoices = this.invoices.map((invoice) =>
            invoice.id === invoiceId
                ? {
                      id: invoiceData.id,
                      isComplete: invoiceData.isComplete,
                      data: invoiceData.data,
                  }
                : invoice
        );
        this.invoiceChangeHandler(this.invoices);
    }

    generateId() {
        this.counter++;
        return this.counter;
    }

    onInvoiceChange(callback) {
        this.invoiceChangeHandler = callback;
    }

    getInvoice = (id) => this.invoices.find((invoice) => invoice.id === id);
}

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

    listInvoices(invoices) {
        if (this.ui.querySelector("[data-invoice-role='list-invoices']")) {
            this.ui.removeChild(this.invoiceListElem);
        }

        this.invoiceListElem = this.generateElement("div", "list-invoices");
        this.ui.appendChild(this.invoiceListElem);

        if (invoices.length > 0) {
            const invoiceList = this.generateElement("ul");
            this.invoiceListElem.appendChild(invoiceList);

            invoices.forEach((invoice) => {
                let listItem = this.generateElement("li", "list-item");
                let listItemLink = this.generateElement(
                    "button",
                    "list-item-link",
                    `${invoice.data.name}`
                );
                listItemLink.setAttribute("data-invoice-id", invoice.id);

                listItem.appendChild(listItemLink);
                invoiceList.appendChild(listItem);
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

    viewInvoice(invoiceId) {
        let invoice = this.getInvoice(invoiceId);

        // Invoice
        this.invoiceElem = this.generateElement("div", "view-invoice");

        let deleteButton = this.generateElement(
            "button",
            "delete-invoice",
            "Delete"
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
                this.deleteInvoice(invoiceId);
                this.ui.removeChild(this.invoiceElem);
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

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.view.deleteInvoice = this.handleDeleteInvoice;
        this.view.getInvoice = this.model.getInvoice;
        this.view.submitInvoice = this.handleFormSubmit;

        this.model.onInvoiceChange(this.handleInvoiceListChange);
        this.handleInvoiceListChange(this.model.invoices);
    }

    handleFormSubmit = (invoiceData, invoiceId) => {
        if (invoiceId) {
            this.model.editInvoice(invoiceId, invoiceData);
        } else {
            this.model.addInvoice(invoiceData);
        }
    };

    handleDeleteInvoice = (invoiceId) => this.model.deleteInvoice(invoiceId);
    handleInvoiceListChange = (invoices) => this.view.listInvoices(invoices);
}

const App = new Controller(new Model(), new View());
