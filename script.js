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

        // Invoice Form
        this.invoiceFormElem = this.generateElement("form", "new-invoice-form");
        this.invoiceFormElem.classList.add("hide");

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

        // Invoice List
        this.invoiceListElem = this.generateElement("div", "list-invoices");
        this.ui.append(this.invoiceListElem);

        // Invoice
        this.invoiceElem = this.generateElement("div", "view-invoice");
    }

    generateElement(tag, role, text) {
        let element = document.createElement(tag);
        role && element.setAttribute("data-invoice-role", role);
        text && (element.textContent = text);

        return element;
    }

    viewForm(existingData) {
        this.ui.append(this.invoiceFormElem);
        this.invoiceFormElem.append(this.nameInput);
        this.invoiceFormElem.append(this.invoiceFormButtonElem);

        // Invoice Form: Inputs
        this.invoiceFormInputs = {
            name: this.invoiceFormElem.querySelector("#name"),
        };

        if (existingData) {
            this.invoiceFormElem.setAttribute("data-invoice-id", data.id);
            this.invoiceFormElem.elements["name"].value = data.name;
        } else {
            [...this.invoiceFormElem.elements].forEach((element) => {
                element.getAttribute("data-invoice-role") !== "submit-form" &&
                    (element.value = "");
            });
        }
        this.invoiceFormElem.classList.remove("hide");

        this.invoiceFormElem.addEventListener("submit", (event) => {
            event.preventDefault();
            this.handleInvoiceFormSubmit();
            this.invoiceFormElem.classList.add("hide");
        });
    }

    handleInvoiceFormSubmit() {
        const invoiceFormData = {
            name: this.invoiceFormInputs.name.value,
        };

        const invoiceId = parseInt(
            this.invoiceFormElem.getAttribute("data-invoice-id")
        );
        this.invoiceFormSubmitHandler(invoiceFormData, invoiceId);
        this.invoiceFormElem.removeAttribute("data-invoice-id");
    }

    updateInvoices(invoices) {
        this.invoiceListElem.innerHTML = "";

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
                listItemLink.id = invoice.id;

                listItem.append(listItemLink);
                invoiceList.append(listItem);
            });

            this.invoiceListElem.addEventListener("click", (event) => {
                this.onTest(parseInt(event.target.id));
            });
        } else {
            this.invoiceListElem.innerHTML = "No invoices!";
        }
    }

    onDeleteInvoice(handler) {
        this.invoiceElem.addEventListener("click", (event) => {
            if (event.target.className === "deleteInvoice") {
                const id = parseInt(event.target.parentElement.id);
                handler(id);
            }
        });
    }

    onEditInvoice(handler) {
        this.invoiceElem.addEventListener("click", (event) => {
            if (event.target.className === "editInvoice") {
                const id = parseInt(event.target.parentElement.id);
                const data = handler(id);

                this.viewForm(data);
            }
        });
    }

    onTest(id) {
        console.log(id);
        let data = this.getMe(id);
        this.invoiceElemData.id = data.id;

        for (const property in data) {
            this.invoiceElemData.append(
                this.generateElement("p", "", data[property])
            );
        }

        let deleteButton = this.generateElement(
            "button",
            "deleteInvoice",
            "Delete"
        );
        let editButton = this.generateElement("button", "editInvoice", "Edit");

        this.invoiceElemData.append(deleteButton);
        this.invoiceElemData.append(editButton);
        this.invoiceElem.classList.remove("hide");

        this.invoiceElem.addEventListener("click", (event) => {
            if (
                event.target.id === "go_back" ||
                event.target.className === "editInvoice"
            ) {
                this.invoiceElem.classList.add("hide");
                this.invoiceElemData.innerHTML = "";
                this.invoiceElemData.removeAttribute("id");
            }
        });
    }

    getInvoiceData(callback) {
        this.getMe = callback;
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.view.onDeleteInvoice(this.handleDeleteInvoice);
        this.model.onInvoiceChange(this.handleInvoiceListChange);
        this.view.onEditInvoice(this.handleEditInvoice);
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
    handleInvoiceListChange = (invoices) => this.view.updateInvoices(invoices);
    handleEditInvoice = (id) => this.model.getInvoice(id);
}

const App = new Controller(new Model(), new View());
