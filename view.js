const view = (function () {
    const invoiceArea = document.querySelector(".invoices");

    function displayInvoices(invoices) {
        invoiceArea.innerHTML = "";

        if (invoices.length === 0) {
            let p = document.createElement("p");
            p.textContent = "No invoices!";
            invoiceArea.append(p);
        } else {
            const invoiceList = document.createElement("ul", "invoice-list");
            invoiceArea.append(invoiceList);

            invoices.forEach((invoice) => {
                let invoiceListItem = document.createElement(
                    "li",
                    "invoice-list-item"
                );
                invoiceListItem.textContent = `${invoice.name}`;
                invoiceList.append(invoiceListItem);
            });
        }
    }

    return {
        displayInvoices,
    };
})();
