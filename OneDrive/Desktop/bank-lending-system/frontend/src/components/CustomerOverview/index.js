// CustomerOverview/index.js
// Component for displaying a summary of all loans for a given customer.

import React from 'react'; // No state or effects needed here, data comes from props
import './index.css'; // Component-specific styles

// Corrected props: now directly uses 'loans' and 'customerName'
const CustomerOverview = ({ customerId, loans, customerName, loading, error, onViewLedger }) => {
    return (
        <div className="customer-overview-container">
            <h2>Your Loan Overview</h2>
            
            {/* Conditional messages based on loading/error state */}
            {!customerId && <p className="info-message">Enter your Customer ID to view your loan overview.</p>}
            {loading && customerId && <p>Loading loan overview for {customerId}...</p>}
            {error && <p className="error-message">{error}</p>}

            {/* Render overview details if data is available and not loading/erroring */}
            {/* Check 'customerName' to ensure data has been fetched successfully */}
            {customerName && !loading && !error && (
                <div className="overview-details">
                    {/* Use customerName prop directly */}
                    <h3>Overview for: {customerName}</h3> 
                    {/* Use loans.length directly for total loans */}
                    <p>Total Loans: <strong>{loans.length}</strong></p>

                    {loans.length > 0 ? ( // Check the actual loans array length
                        <div className="loans-list">
                            {loans.map(loan => ( // Map over the actual loans array
                                <div key={loan.loan_id} className="loan-card">
                                    <h4>Loan ID: {loan.loan_id}</h4>
                                    <p>Principal Amount: ₹{loan.principal.toLocaleString('en-IN')}</p>
                                    <p>Total Amount Payable: ₹{loan.total_amount.toLocaleString('en-IN')}</p>
                                    <p>Total Interest: ₹{loan.total_interest.toLocaleString('en-IN')}</p>
                                    <p>Monthly EMI: ₹{loan.emi_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <p>Amount Paid: ₹{loan.amount_paid.toLocaleString('en-IN')}</p>
                                    <p>Estimated EMIs Left: {loan.emis_left}</p>
                                    {/* Add a button to view ledger for this specific loan */}
                                    <button onClick={() => onViewLedger(loan.loan_id)}>View Ledger</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // This message is now handled by App.js based on customerLoans.length
                        // but keeping it here as a fallback or for clarity if needed in other contexts.
                        <p className="info-message">No loans found for this customer. Perhaps apply for a new one!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerOverview;
