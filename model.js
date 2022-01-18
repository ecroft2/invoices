const model = (function () {
    let invoices = [];
    let counter = 0;

    function generateUniqueId() {
        counter++;
        return counter;
    }

    function addInvoice(data) {
        invoices.push({
            id: generateUniqueId(),
            name: data.name,
        });
    }

    function deleteInvoice(id) {
        invoices = invoices.filter((invoice) => invoice.id !== id);
    }

    function editInvoice(id, data) {
        invoices = invoices.map((invoice) =>
            invoice.id === id
                ? {
                      id: invoice.id,
                      name: data.name,
                  }
                : invoice
        );
    }

    return {
        add: addInvoice,
        delete: deleteInvoice,
        edit: editInvoice,
        getInvoices: invoices,
    };
})();
