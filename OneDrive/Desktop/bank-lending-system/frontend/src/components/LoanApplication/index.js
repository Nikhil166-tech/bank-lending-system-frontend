// LoanApplication/index.js
// Component for submitting a new loan application.

import React, { useState } from 'react';
import './index.css'; // Import component-specific styles

// IMPORTANT: Updated API_ENDPOINT to your LIVE RENDER backend URL for deployment.
const API_ENDPOINT = 'https://bank-lending-system-backend.onrender.com/api/v1/loans';

const LoanApplication = ({ onLoanCreated }) => {
    // Form state variables
    const [customerId, setCustomerId] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [loanPeriodYears, setLoanPeriodYears] = useState('');
    const [interestRateYearly, setInterestRateYearly] = useState('10.0'); // Default interest rate

    // UI feedback state
    const [submissionMessage, setSubmissionMessage] = useState(null);
    const [isSubmissionSuccess, setIsSubmissionSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Handles the loan application form submission.
     * Validates inputs, sends data to backend, and provides user feedback.
     */
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default browser form submission

        // Basic client-side validation
        if (
            !customerId.trim() ||
            parseFloat(loanAmount) <= 0 ||
            parseFloat(interestRateYearly) < 0 ||
            parseInt(loanPeriodYears, 10) <= 0
        ) {
            setIsSubmissionSuccess(false);
            setSubmissionMessage({ text: 'Please ensure all fields are filled correctly: Customer ID, positive Loan Amount, non-negative Annual Interest Rate, and positive Loan Period.' });
            return;
        }

        setSubmissionMessage(null); // Clear previous messages
        setIsSubmissionSuccess(null);
        setIsSubmitting(true); // Show loading state

        const payload = {
            customer_id: customerId.trim(), // Ensure customer ID is trimmed here too
            loan_amount: parseFloat(loanAmount),
            interest_rate_yearly: parseFloat(interestRateYearly),
            loan_period_years: parseInt(loanPeriodYears, 10),
        };

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                setIsSubmissionSuccess(true);
                setSubmissionMessage({
                    text: result.message,
                    data: result.data, // Contains loan_id, total_amount_payable, monthly_emi
                });
                // Clear form fields on successful submission
                setCustomerId('');
                setLoanAmount('');
                setLoanPeriodYears('');
                setInterestRateYearly('10.0');

                // Notify parent component (App.js) that a loan was created
                if (onLoanCreated) {
                    onLoanCreated();
                }
            } else {
                // Handle API errors (e.g., 400 Bad Request, 500 Internal Server Error)
                setIsSubmissionSuccess(false);
                setSubmissionMessage({
                    text: result.message || 'An unexpected server error occurred during loan application. Please try again.',
                });
            }
        } catch (error) {
            // Handle network errors (e.g., backend not running, no internet)
            setIsSubmissionSuccess(false);
            setSubmissionMessage({
                text: `Network error: ${error.message}. Please ensure your backend server is running and accessible at ${API_ENDPOINT}.`,
            });
        } finally {
            setIsSubmitting(false); // End loading state
        }
    };

    return (
        <div className="loan-application-container">
            <h2>Apply for a New Loan</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="customerId">Your Customer ID:</label>
                    <input
                        type="text"
                        id="customerId"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        placeholder="e.g., CUST007"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="loanAmount">Desired Loan Amount (₹):</label>
                    <input
                        type="number"
                        id="loanAmount"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        min="1"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="interestRateYearly">Annual Interest Rate (%):</label>
                    <input
                        type="number"
                        id="interestRateYearly"
                        value={interestRateYearly}
                        onChange={(e) => setInterestRateYearly(e.target.value)}
                        min="0"
                        step="0.1"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="loanPeriodYears">Loan Period (Years):</label>
                    <input
                        type="number"
                        id="loanPeriodYears"
                        value={loanPeriodYears}
                        onChange={(e) => setLoanPeriodYears(e.target.value)}
                        min="1"
                        max="30" // Reasonable max loan period
                        required
                    />
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting Application...' : 'Submit Loan Application'}
                </button>
            </form>

            {/* Display submission feedback messages */}
            {submissionMessage && (
                <div className={`response-message ${isSubmissionSuccess ? 'success-message' : 'error-message'}`}>
                    {isSubmissionSuccess ? (
                        <>
                            <strong>Success!</strong> {submissionMessage.text}<br />
                            Loan ID: {submissionMessage.data.loan_id}<br />
                            Customer ID: {submissionMessage.data.customer_id}<br />
                            Total Amount Payable: ₹{submissionMessage.data.total_amount_payable.toLocaleString('en-IN')}<br />
                            Monthly EMI: ₹{submissionMessage.data.monthly_emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </>
                    ) : (
                        <>
                            <strong>Error:</strong> {submissionMessage.text}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default LoanApplication;
