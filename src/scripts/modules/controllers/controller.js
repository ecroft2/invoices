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
    handleInvoiceListChange = (invoices) => this.view.viewInvoices(invoices);
}

export default Controller;
