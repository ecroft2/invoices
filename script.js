class Model {
    constructor() {
        this.invoices = [];
        this.counter = 0;
    }

    addInvoice(data) {
        this.invoices.push({
            id: this.generateInvoiceId(),
            name: data.name,
        });

        this.invoiceListChangeHandler(this.invoices);
    }

    deleteInvoice(id) {
        this.invoices = this.invoices.filter((invoice) => invoice.id !== id);
        this.invoiceListChangeHandler(this.invoices);
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
        this.invoiceListChangeHandler(this.invoices);
    }

    generateInvoiceId() {
        this.counter++;
        return this.counter;
    }

    onInvoiceListChange(callback) {
        this.invoiceListChangeHandler = callback;
    }

    getInvoice = (id) => {
        return this.invoices.find((invoice) => invoice.id === id);
    };
}

class View {
    constructor() {
        this.form = document.querySelector("#new_invoice");
        this.formInputs = {
            name: document.querySelector("#name"),
        };
        this.invoiceListElem = document.querySelector(".invoices");
        this.getFormButton = document.querySelector("#get_form");
        this.getFormButton.addEventListener("click", (event) => {
            this.getForm();
        });
        this.invoiceElem = document.querySelector(".invoiceView");
    }

    generateElement(tag, htmlClass, text) {
        let element = document.createElement(tag);
        htmlClass && (element.className = htmlClass);
        text && (element.textContent = text);

        return element;
    }

    listInvoices(invoices) {
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

    onSubmitForm(handler) {
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();

            this.form.classList.add("hide");

            const formData = {
                name: this.formInputs.name.value,
            };

            const id = parseInt(this.form.getAttribute("invoice"));
            handler(formData, id);
            this.form.removeAttribute("invoice");
        });
    }

    getForm(data) {
        if (data) {
            this.form.setAttribute("invoice", data.id);
            this.form.elements["name"].value = data.name;
        } else {
            [...this.form.elements].forEach((element) => {
                if (element.tagName !== "BUTTON") {
                    element.value = "";
                }
            });
        }
        this.form.classList.remove("hide");
    }

    onDeleteInvoice(handler) {
        this.invoiceListElem.addEventListener("click", (event) => {
            if (event.target.className === "deleteInvoice") {
                const id = parseInt(event.target.parentElement.id);
                handler(id);
            }
        });
    }

    onEditInvoice(handler) {
        this.invoiceListElem.addEventListener("click", (event) => {
            if (event.target.className === "editInvoice") {
                const id = parseInt(event.target.parentElement.id);
                const data = handler(id);

                this.getForm(data);
            }
        });
    }

    onTest(id) {
        let data = this.getMe(id);

        for (const property in data) {
            this.invoiceElem.append(
                this.generateElement("p", "", data[property])
            );
        }

        this.invoiceElem.classList.remove("hide");

        // let deleteButton = this.generateElement(
        //     "button",
        //     "deleteInvoice",
        //     "Delete"
        // );
        // let editButton = this.generateElement("button", "editInvoice", "Edit");

        // this.invoiceElem.append(deleteButton);
        // this.invoiceElem.append(editButton);
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
        this.model.onInvoiceListChange(this.handleInvoiceListChange);
        this.view.onEditInvoice(this.handleEditInvoice);
        this.handleInvoiceListChange(this.model.invoices);
        this.view.getInvoiceData(this.model.getInvoice);

        this.view.onSubmitForm(this.handleFormInput);
    }

    handleFormInput = (data, id) => {
        if (id) {
            this.model.editInvoice(id, data);
        } else {
            this.model.addInvoice(data);
        }
    };

    handleDeleteInvoice = (id) => this.model.deleteInvoice(id);
    handleInvoiceListChange = (invoices) => this.view.listInvoices(invoices);
    handleEditInvoice = (id) => this.model.getInvoice(id);
}

const App = new Controller(new Model(), new View());
