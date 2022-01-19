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
    }

    editInvoice(id, data) {
        this.invoices = this.invoices.map((invoice) =>
            invoice.id === id
                ? {
                      id: invoice.id,
                      name: data.name,
                  }
                : invoice
        );
    }

    generateInvoiceId() {
        this.counter++;
        return this.counter;
    }

    onInvoiceListChange(callback) {
        this.invoiceListChangeHandler = callback;
    }
}

class View {
    constructor() {
        this.form = document.querySelector("#new_invoice");
        this.formInputs = {
            name: document.querySelector("#name"),
        };
        this.invoiceListElem = document.querySelector(".invoices");
    }

    listInvoices(invoices) {
        this.invoiceListElem.innerHTML = "";

        if (invoices.length > 0) {
            invoices.forEach((invoice) => {
                let listItem = document.createElement("li", "list-item");
                listItem.textContent = `${invoice.name}`;
                this.invoiceListElem.appendChild(listItem);
            });
        } else {
            this.invoiceListElem.innerHTML = "No invoices!";
        }
    }

    onAddInvoice(handler) {
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();

            const formData = {
                name: this.formInputs.name.value,
            };

            handler(formData);
        });
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.view.onAddInvoice(this.handleAddInvoice);
        this.handleInvoiceListChange(this.model.invoices);
        this.model.onInvoiceListChange(this.handleInvoiceListChange);
    }

    handleAddInvoice = (data) => {
        this.model.addInvoice(data);
    };

    handleDeleteInvoice = (id) => {
        this.model.deleteInvoice(id);
    };

    handleInvoiceListChange = (invoices) => {
        this.view.listInvoices(invoices);
    };
}

const App = new Controller(new Model(), new View());
