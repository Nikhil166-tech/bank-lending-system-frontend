// PaymentForm/index.js
// Component for recording a loan payment.

import React, { useState, useEffect } from 'react';
import './index.css'; // Component-specific styles

// IMPORTANT: Updated API_BASE_URL to your LIVE RENDER backend URL for deployment.
const API_BASE_URL = 'https://bank-lending-system-backend.onrender.com/api/v1';

const PaymentForm = ({ loans, onPaymentRecorded }) => {
    const [selectedLoanId, setSelectedLoanId] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState('EMI');

    const [responseMessage, setResponseMessage] = useState(null);
    const [isSuccess, setIsSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (loans && loans.length > 0) {
            setSelectedLoanId(loans[0].loan_id);
        } else {
            setSelectedLoanId('');
        }
        setAmount('');
        setResponseMessage(null);
        setIsSuccess(null);
    }, [loans]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedLoanId || parseFloat(amount) <= 0 || !paymentType) {
            setIsSuccess(false);
            setResponseMessage({ message: 'Please select a Loan, ensure Amount is positive, and Payment Type is selected.' });
            return;
        }

        setResponseMessage(null);
        setIsSuccess(null);
        setIsLoading(true);

        const payload = {
            amount: parseFloat(amount),
            payment_type: paymentType,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/loans/${selectedLoanId}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                setResponseMessage({
                    message: result.message,
                    data: result,
                });
                setAmount('');
                setPaymentType('EMI');

                if (onPaymentRecorded) {
                    onPaymentRecorded();
                }

            } else {
                setIsSuccess(false);
                setResponseMessage({
                    message: result.message || 'An unexpected error occurred on the server.',
                });
            }
        } catch (error) {
            setIsSuccess(false);
            setResponseMessage({
                message: `Network error: ${error.message}. Please ensure your backend server is running and accessible.`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="payment-form-container">
            <h2>Record a Loan Payment</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="loanSelect">Select Loan:</label>
                    <select
                        id="loanSelect"
                        value={selectedLoanId}
                        onChange={(e) => setSelectedLoanId(e.target.value)}
                        required
                        disabled={!loans || loans.length === 0}
                    >
                        {loans && loans.length > 0 ? (
                            loans.map(loan => (
                                <option key={loan.loan_id} value={loan.loan_id}>
                                    {loan.loan_id} (Principal: ₹{loan.principal.toLocaleString('en-IN')}, EMI: ₹{loan.emi_amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})
                                </option>
                            ))
                        ) : (
                            <option value="">No loans available</option>
                        )}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Payment Amount (₹):</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0.01"
                        step="0.01"
                        required
                        disabled={!selectedLoanId}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="paymentType">Payment Type:</label>
                    <select
                        id="paymentType"
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        required
                        disabled={!selectedLoanId}
                    >
                        <option value="EMI">EMI</option>
                        <option value="LUMP_SUM">LUMP_SUM</option>
                    </select>
                </div>
                <button type="submit" disabled={isLoading || !selectedLoanId}>
                    {isLoading ? 'Processing Payment...' : 'Record Payment'}
                </button>
            </form>

            {responseMessage && (
                <div className={`response-message ${isSuccess ? 'success-message' : 'error-message'}`}>
                    {isSuccess ? (
                        <>
                            <strong>{responseMessage.message}</strong><br />
                            Payment ID: {responseMessage.data.payment_id}<br />
                            Loan ID: {responseMessage.data.loan_id}<br />
                            Remaining Balance: ₹{responseMessage.data.remaining_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
                            EMIs Left: {responseMessage.data.emis_left}
                        </>
                    ) : (
                        <>
                            <strong>Error:</strong> {responseMessage.message}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentForm;
