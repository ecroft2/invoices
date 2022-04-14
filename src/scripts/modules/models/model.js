import { Input } from "postcss";

class Model {
    constructor() {
        this.invoices = JSON.parse(localStorage.getItem("invoices")) || [];
        this.counter = JSON.parse(localStorage.getItem("counter") || 0);
    }

    addInvoice(data) {
        this.invoices.push({
            id: this.generateId(),
            isComplete: false,
            totalOwedAmount: this.calculateTotalOwedAmount(data.items),
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
                date: data.date,
                paymentTerms: data.paymentTerms,
                paymentDesc: data.paymentDesc,
                items: data.items,
            },
        });
        localStorage.setItem("invoices", JSON.stringify(this.invoices));
        this.handleInvoiceChange({ invoices: this.invoices });
    }

    calculateTotalOwedAmount(data) {
        let count = new Number(0);

        data.forEach((invoiceItem) => {
            count += invoiceItem.price * invoiceItem.quantity;
        });

        count = Intl.NumberFormat("en-UK", {
            style: "currency",
            currency: "GBP",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(count);

        return count;
    }

    deleteInvoice(id) {
        this.invoices = this.invoices.filter((invoice) => invoice.id !== id);
        localStorage.setItem("invoices", JSON.stringify(this.invoices));
        this.handleInvoiceChange({ invoices: this.invoices });
    }

    editInvoice(invoiceId, invoiceData) {
        this.invoices = this.invoices.map((invoice) =>
            invoice.id === invoiceId
                ? {
                      id: invoiceData.id,
                      isComplete: invoiceData.isComplete,
                      totalOwedAmount: this.calculateTotalOwedAmount(invoiceData.data.items),
                      data: invoiceData.data,
                  }
                : invoice
        );

        localStorage.setItem("invoices", JSON.stringify(this.invoices));

        this.handleInvoiceChange({
            invoices: this.invoices,
            updateView: false,
        });

        this.handleInvoiceEdit(invoiceId);
    }

    generateId() {
        this.counter++;
        localStorage.setItem("counter", this.counter);
        return this.counter;
    }

    getInvoice = (id) => this.invoices.find((invoice) => invoice.id === id);

    validateInput = (input, type) => {
        const types = {
            postcode: /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0A{2})$/,
            email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
            number: /[0-9]/,
            currency: /^-?\d+(,\d{3})*(\.\d{1,2})?$/,
            date: "",
        };

        if (input === "") {
            return "invalid_empty";
        } else {
            if (type === "string") {
                return "valid";
            } else {
                return input.match(types[type]) ? "valid" : "invalid_regex";
            }
        }
    };
}

export default Model;
