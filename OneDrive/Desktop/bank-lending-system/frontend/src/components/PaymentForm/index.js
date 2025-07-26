// PaymentForm/index.js
// Component for recording a payment against an existing loan.

import React, { useState, useEffect } from 'react';
import './index.css'; // Component-specific styles

const API_BASE_URL = 'http://localhost:5000/api/v1';

const PaymentForm = ({ loans, onPaymentRecorded }) => {
    // State for selected loan and payment details
    const [selectedLoanId, setSelectedLoanId] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentType, setPaymentType] = useState('EMI'); // Default to EMI

    // UI feedback state
    const [responseFeedback, setResponseFeedback] = useState(null);
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Effect to automatically select the first loan if available, or clear if none.
    useEffect(() => {
        if (loans && loans.length > 0) {
            setSelectedLoanId(loans[0].loan_id);
        } else {
            setSelectedLoanId(''); // No loans to select
            setResponseFeedback(null); // Clear any previous feedback
        }
        setPaymentAmount(''); // Reset amount when loans change
        // Removed: setIsPaymentSuccess(null); // This line was causing the issue
    }, [loans]); // Re-run when the 'loans' prop changes

    /**
     * Handles the payment form submission.
     * Validates inputs, sends payment data to backend, and updates UI.
     */
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Client-side validation
        if (!selectedLoanId || parseFloat(paymentAmount) <= 0 || !paymentType) {
            setIsPaymentSuccess(false);
            setResponseFeedback({ text: 'Please select a loan, ensure payment amount is positive, and select a payment type.' });
            return;
        }

        setResponseFeedback(null); // Clear previous messages
        setIsPaymentSuccess(null);
        setIsProcessingPayment(true); // Show loading state

        const payload = {
            amount: parseFloat(paymentAmount),
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

            // --- DEBUGGING LOGS START ---
            console.log('Payment API Response Status:', response.status);
            console.log('Payment API Response.ok:', response.ok);
            console.log('Payment API Response Body (result):', result);
            // --- DEBUGGING LOGS END ---

            if (response.ok) {
                setIsPaymentSuccess(true);
                setResponseFeedback({
                    text: result.message,
                    data: result, // Contains remaining_balance, emis_left etc.
                });
                setPaymentAmount(''); // Clear amount field on success
                setPaymentType('EMI'); // Reset payment type

                // Notify parent (App.js) to refresh customer overview
                if (onPaymentRecorded) {
                    onPaymentRecorded();
                }

            } else {
                // Handle API errors (e.g., loan not found, loan paid off)
                setIsPaymentSuccess(false);
                setResponseFeedback({
                    text: result.message || 'An unexpected server error occurred during payment. Please try again.',
                });
            }
        } catch (error) {
            // Handle network errors
            setIsPaymentSuccess(false);
            setResponseFeedback({
                text: `Network error: ${error.message}. Please ensure your backend server is running and accessible.`,
            });
        } finally {
            setIsProcessingPayment(false); // End loading state
        }
    };

    return (
        <div className="payment-form-container">
            <h2>Record a Loan Payment</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="loanSelect">Select Loan to Pay:</label>
                    <select
                        id="loanSelect"
                        value={selectedLoanId}
                        onChange={(e) => setSelectedLoanId(e.target.value)}
                        required
                        disabled={!loans || loans.length === 0} // Disable if no loans available
                    >
                        {loans && loans.length > 0 ? (
                            loans.map(loan => (
                                <option key={loan.loan_id} value={loan.loan_id}>
                                    {loan.loan_id} (Principal: ₹{loan.principal.toLocaleString('en-IN')}, EMI: ₹{loan.emi_amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})
                                </option>
                            ))
                        ) : (
                            <option value="">No active loans available</option>
                        )}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="paymentAmount">Payment Amount (₹):</label>
                    <input
                        type="number"
                        id="paymentAmount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        min="0.01" // Minimum payment amount
                        step="0.01" // Allows decimal payments
                        required
                        disabled={!selectedLoanId} // Disable if no loan is selected
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="paymentType">Payment Type:</label>
                    <select
                        id="paymentType"
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        required
                        disabled={!selectedLoanId} // Disable if no loan is selected
                    >
                        <option value="EMI">EMI</option>
                        <option value="LUMP_SUM">LUMP SUM</option>
                    </select>
                </div>
                <button type="submit" disabled={isProcessingPayment || !selectedLoanId}>
                    {isProcessingPayment ? 'Processing Payment...' : 'Record Payment'}
                </button>
            </form>

            {/* Display payment feedback */}
            {responseFeedback && (
                <div className={`response-message ${isPaymentSuccess ? 'success-message' : 'error-message'}`}>
                    {isPaymentSuccess ? (
                        <>
                            <strong>{responseFeedback.text}</strong><br />
                            Payment ID: {responseFeedback.data.payment_id}<br />
                            Loan ID: {responseFeedback.data.loan_id}<br />
                            Remaining Balance: ₹{responseFeedback.data.remaining_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
                            Estimated EMIs Left: {responseFeedback.data.emis_left}
                        </>
                    ) : (
                        <>
                            <strong>Error:</strong> {responseFeedback.text}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentForm;
