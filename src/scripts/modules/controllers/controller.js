class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.view.deleteInvoice = this.handleDeleteInvoice;
        this.view.getInvoice = this.model.getInvoice;
        this.view.submitInvoice = this.handleFormSubmit;
        this.model.handleInvoiceChange = this.handleInvoices;
        this.model.handleInvoiceEdit = this.handleEditInvoice;

        this.handleInvoices({ invoices: this.model.invoices });
    }

    handleFormSubmit = (invoiceData, invoiceId) => {
        if (invoiceId) {
            this.model.editInvoice(invoiceId, invoiceData);
        } else {
            this.model.addInvoice(invoiceData);
        }
    };

    handleDeleteInvoice = (invoiceId) => this.model.deleteInvoice(invoiceId);
    handleInvoices = (data) => {
        data.updateView !== false && this.view.updateInvoices(data);
    };
    handleEditInvoice = (invoiceId) => this.view.viewInvoice(invoiceId);
}

export default Controller;
