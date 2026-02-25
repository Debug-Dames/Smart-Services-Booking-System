import React from 'react'

const PaymentModal = ({ open = false, booking = null, onClose = () => { }, onPay = () => { } }) => {
    if (!open) return null
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Pay for {booking?.serviceName}</h3>
                <p>Amount: {booking?.amount ?? 'N/A'}</p>
                <div style={{ marginTop: 12 }}>
                    <button onClick={() => onPay(booking)}>Confirm Payment</button>
                    <button style={{ marginLeft: 8 }} onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default PaymentModal
