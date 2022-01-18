const controller = (function (view, model) {
    onInvoiceListChanged(model.getInvoices);

    function onInvoiceListChanged(invoices) {
        view.displayInvoices(invoices);
    }
})(view, model);
