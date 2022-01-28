class Model {
    constructor() {
        this.invoices = [];
        this.counter = 0;
    }

    addInvoice(data) {
        this.invoices.push({
            id: this.generateId(),
            name: data.name,
        });

        this.invoiceChangeHandler(this.invoices);
    }

    deleteInvoice(id) {
        this.invoices = this.invoices.filter((invoice) => invoice.id !== id);
        this.invoiceChangeHandler(this.invoices);
    }

    editInvoice(id, data) {
        this.invoices = this.invoices.map((invoice) =>
            invoice.id === id
                ? {
                      id,
                      name: data.name,
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

    getInvoice = (id) => {
        return this.invoices.find((invoice) => invoice.id === id);
    };
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
        this.ui.append(this.getFormButtonElem);
        this.getFormButtonElem.addEventListener("click", () => {
            this.viewForm();
        });

        // Invoice Form: Name
        this.nameInput = this.generateElement("input");
        this.nameInput.id = "name";
        this.nameInput.placeholder = "Name";

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

    viewForm(existingData) {
        let invoiceId;

        // Invoice Form
        this.invoiceFormElem = this.generateElement("form", "new-invoice-form");
        this.ui.append(this.invoiceFormElem);
        this.invoiceFormElem.append(this.nameInput);
        this.invoiceFormElem.append(this.invoiceFormButtonElem);

        // Invoice Form: Inputs
        this.invoiceFormInputs = {
            name: this.invoiceFormElem.querySelector("#name"),
        };

        if (existingData) {
            invoiceId = existingData.id;
            this.invoiceFormElem.elements["name"].value = existingData.name;
        }

        this.invoiceFormElem.addEventListener("submit", (event) => {
            event.preventDefault();

            const invoiceFormData = {
                name: this.invoiceFormInputs.name.value,
            };

            this.handleInvoiceFormSubmit(invoiceFormData, invoiceId);

            this.ui.removeChild(this.invoiceFormElem);
        });
    }

    handleInvoiceFormSubmit(invoiceFormData, invoiceId) {
        this.invoiceFormSubmitHandler(invoiceFormData, invoiceId);
    }

    updateInvoices(invoices) {
        if (this.ui.querySelector("[data-invoice-role='list-invoices']")) {
            this.ui.removeChild(this.invoiceListElem);
        }

        this.invoiceListElem = this.generateElement("div", "list-invoices");
        this.ui.append(this.invoiceListElem);

        if (invoices.length > 0) {
            const invoiceList = this.generateElement("ul");
            this.invoiceListElem.append(invoiceList);

            invoices.forEach((invoice) => {
                let listItem = this.generateElement("li", "list-item");
                let listItemLink = this.generateElement(
                    "button",
                    "list-item-link",
                    `${invoice.name}`
                );
                listItemLink.setAttribute("data-invoice-id", invoice.id);

                listItem.append(listItemLink);
                invoiceList.append(listItem);
            });

            this.invoiceListElem.addEventListener("click", (event) => {
                let invoiceId = parseInt(
                    event.target.getAttribute("data-invoice-id")
                );

                if (
                    this.ui.querySelector(
                        "[data-invoice-role='view-invoice']"
                    ) === null
                ) {
                    this.onLoadInvoice(invoiceId);
                }
            });
        } else {
            this.invoiceListElem.innerHTML = "No invoices!";
        }
    }

    onLoadInvoice(invoiceId) {
        let data = this.getInvoice(invoiceId);

        // Invoice
        this.invoiceElem = this.generateElement("div", "view-invoice");

        let deleteButton = this.generateElement(
            "button",
            "delete-invoice",
            "Delete"
        );
        let editButton = this.generateElement("button", "edit-invoice", "Edit");

        let goBackButton = this.generateElement(
            "button",
            "back-to-invoices",
            "Go Back"
        );

        this.ui.append(this.invoiceElem);
        this.invoiceElem.append(deleteButton);
        this.invoiceElem.append(editButton);
        this.invoiceElem.append(goBackButton);

        for (const property in data) {
            this.invoiceElem.append(
                this.generateElement("p", "", data[property])
            );
        }

        this.invoiceElem.addEventListener("click", (event) => {
            const targetAttr = event.target.getAttribute("data-invoice-role");

            if (targetAttr === "edit-invoice") {
                this.editInvoice(invoiceId);
                this.ui.removeChild(this.invoiceElem);
            } else if (targetAttr === "delete-invoice") {
                this.deleteInvoice(invoiceId);
                this.ui.removeChild(this.invoiceElem);
            } else if (targetAttr === "back-to-invoices") {
                this.ui.removeChild(this.invoiceElem);
            }
        });
    }

    getInvoiceData(callback) {
        this.getInvoice = callback;
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.view.deleteInvoice = this.handleDeleteInvoice;
        this.view.editInvoice = this.handleEditInvoice;

        this.model.onInvoiceChange(this.handleInvoiceListChange);
        this.handleInvoiceListChange(this.model.invoices);
        this.view.getInvoiceData(this.model.getInvoice);
        this.view.invoiceFormSubmitHandler = this.handleFormInput;
    }

    handleFormInput = (data, id) => {
        if (id) {
            this.model.editInvoice(id, data);
        } else {
            this.model.addInvoice(data);
        }
    };

    handleDeleteInvoice = (id) => this.model.deleteInvoice(id);
    handleEditInvoice = (id) => this.model.getInvoice(id);
    handleInvoiceListChange = (invoices) => this.view.updateInvoices(invoices);
}

const App = new Controller(new Model(), new View());
