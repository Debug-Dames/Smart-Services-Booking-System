exports.validateLogin = (data) => {
    const errors = [];
    if (!data || !data.email) errors.push('email is required');
    if (!data || !data.password) errors.push('password is required');
    return { valid: errors.length === 0, errors };
};