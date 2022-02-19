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
                fromAddress: data.fromAddress,
                fromCity: data.fromCity,
                fromPostcode: data.fromPostcode,
                fromCountry: data.fromCountry,
                toName: data.toName,
                toEmail: data.toEmail,
                toAddress: data.toAddress,
                toCity: data.toCity,
                toPostcode: data.toPostcode,
                toCountry: data.toCountry,
                toDate: data.toDate,
                toPaymentTerms: data.toPaymentTerms,
                toPaymentDesc: data.toPaymentDesc,
            },
        });

        this.handleInvoiceChange({ invoices: this.invoices });
    }

    deleteInvoice(id) {
        this.invoices = this.invoices.filter((invoice) => invoice.id !== id);
        this.handleInvoiceChange({ invoices: this.invoices });
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

        this.handleInvoiceChange({
            invoices: this.invoices,
            updateView: false,
        });

        this.handleInvoiceEdit(invoiceId);
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

export default Model;
