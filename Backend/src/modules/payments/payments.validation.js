exports.validatePayment = (data) => {
    const errors = [];
    if (!data || !data.amount) errors.push('amount is required');
    return { valid: errors.length === 0, errors };
};