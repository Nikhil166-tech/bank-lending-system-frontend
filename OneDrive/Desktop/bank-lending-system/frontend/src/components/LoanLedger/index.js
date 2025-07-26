// LoanLedger/index.js
// Component to display detailed loan information and its full transaction history.

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; // Import component-specific styles

// IMPORTANT: Updated API_BASE_URL to your LOCALHOST backend URL for local testing.
// Remember to change it back to the Render.com URL when deploying!
const API_BASE_URL = 'http://localhost:5000/api/v1';

const LoanLedger = ({ customerId, loans }) => {
    // State for the currently selected loan to view its ledger
    const [selectedLoanId, setSelectedLoanId] = useState('');
    // State to store the fetched ledger data
    const [loanLedgerData, setLoanLedgerData] = useState(null);
    // Loading and error states for API calls
    const [isLoadingLedger, setIsLoadingLedger] = useState(false);
    const [ledgerError, setLedgerError] = useState(null);

    // Effect to set the default selected loan when the list of loans changes.
    // This ensures the dropdown always has a valid selection if loans are present.
    useEffect(() => {
        if (loans && loans.length > 0) {
            setSelectedLoanId(loans[0].loan_id);
        } else {
            setSelectedLoanId(''); // Clear selection if no loans
            setLoanLedgerData(null); // Also clear previous ledger data
        }
    }, [loans]); // Dependency array: runs when 'loans' prop changes

    // Effect to fetch ledger data whenever the selectedLoanId changes.
    useEffect(() => {
        const fetchLoanLedger = async () => {
            if (!selectedLoanId) {
                setLoanLedgerData(null);
                setLedgerError(null);
                return; // Don't fetch if no loan is selected
            }

            setIsLoadingLedger(true);
            setLedgerError(null); // Clear previous errors
            try {
                const response = await axios.get(`${API_BASE_URL}/loans/${selectedLoanId}/ledger`);
                setLoanLedgerData(response.data);
            } catch (err) {
                console.error('Error fetching loan ledger:', err);
                if (err.response && err.response.status === 404) {
                    setLedgerError(`Loan ID "${selectedLoanId}" not found or no ledger data available.`);
                } else {
                    setLedgerError(`Failed to fetch loan ledger: ${err.message}. Please ensure backend is running.`);
                }
                setLoanLedgerData(null); // Clear data on error
            } finally {
                setIsLoadingLedger(false); // End loading state
            }
        };

        fetchLoanLedger(); // Call the fetch function
    }, [selectedLoanId]); // Dependency array: runs when 'selectedLoanId' changes

    return (
        <div className="loan-ledger-container">
            <h2>Loan Ledger & Transaction History</h2>

            <div className="form-group">
                <label htmlFor="loanSelect">Select Loan:</label>
                <select
                    id="loanSelect"
                    value={selectedLoanId}
                    onChange={(e) => setSelectedLoanId(e.target.value)}
                    required
                    disabled={!loans || loans.length === 0} // Disable dropdown if no loans
                >
                    {loans && loans.length > 0 ? (
                        loans.map(loan => (
                            <option key={loan.loan_id} value={loan.loan_id}>
                                {loan.loan_id} (Principal: ₹{loan.principal.toLocaleString('en-IN')})
                            </option>
                        ))
                    ) : (
                        <option value="">No loans available for {customerId}</option>
                    )}
                </select>
            </div>

            {/* Display loading/error messages */}
            {isLoadingLedger && <p>Loading loan ledger details...</p>}
            {ledgerError && <p className="error-message">{ledgerError}</p>}

            {/* Display ledger data if available and no errors/loading */}
            {loanLedgerData && !isLoadingLedger && !ledgerError && (
                <div className="ledger-details">
                    <h3>Details for Loan ID: {loanLedgerData.loan_id}</h3>
                    <p>Customer ID: <strong>{loanLedgerData.customer_id}</strong></p>
                    <p>Principal Amount: <strong>₹{loanLedgerData.principal.toLocaleString('en-IN')}</strong></p>
                    <p>Total Amount Payable: <strong>₹{loanLedgerData.total_amount.toLocaleString('en-IN')}</strong></p>
                    <p>Monthly EMI: <strong>₹{loanLedgerData.monthly_emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
                    <p>Amount Paid: <strong>₹{loanLedgerData.amount_paid.toLocaleString('en-IN')}</strong></p>
                    <p>Outstanding Balance: <strong>₹{loanLedgerData.balance_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
                    <p>Estimated EMIs Left: <strong>{loanLedgerData.emis_left}</strong></p>

                    <h4>Transaction History:</h4>
                    {loanLedgerData.transactions && loanLedgerData.transactions.length > 0 ? (
                        <ul className="transactions-list">
                            {loanLedgerData.transactions.map(transaction => (
                                <li key={transaction.transaction_id} className="transaction-item">
                                    <span className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</span>
                                    <span className="transaction-type">[{transaction.type}]</span>
                                    <span className="transaction-amount">₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No transactions recorded for this loan yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default LoanLedger;
