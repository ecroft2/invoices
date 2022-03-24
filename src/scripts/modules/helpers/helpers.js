const createPrettyCurrencyAmount = (value) => {
    return Intl.NumberFormat("en-UK", {
        style: "currency",
        currency: "GBP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

export { createPrettyCurrencyAmount };
