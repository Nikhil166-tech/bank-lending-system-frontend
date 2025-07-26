// CustomerOverview/index.js
// Component for displaying a summary of all loans for a given customer.

import React from 'react'; // No state or effects needed here, data comes from props
import './index.css'; // Component-specific styles

const CustomerOverview = ({ customerId, overviewData, loading, error }) => {
    return (
        <div className="customer-overview-container">
            <h2>Your Loan Overview</h2>
            
            {/* Conditional messages based on loading/error state */}
            {!customerId && <p className="info-message">Enter your Customer ID to view your loan overview.</p>}
            {loading && customerId && <p>Loading loan overview for {customerId}...</p>}
            {error && <p className="error-message">{error}</p>}

            {/* Render overview details if data is available and not loading/erroring */}
            {overviewData && !loading && !error && (
                <div className="overview-details">
                    <h3>Overview for: {overviewData.customer_name || customerId}</h3> {/* Displays customer name or ID */}
                    <p>Total Loans: <strong>{overviewData.total_loans}</strong></p>

                    {overviewData.total_loans > 0 ? (
                        <div className="loans-list">
                            {overviewData.loans.map(loan => (
                                <div key={loan.loan_id} className="loan-card">
                                    <h4>Loan ID: {loan.loan_id}</h4>
                                    <p>Principal Amount: ₹{loan.principal.toLocaleString('en-IN')}</p>
                                    <p>Total Amount Payable: ₹{loan.total_amount.toLocaleString('en-IN')}</p>
                                    <p>Total Interest: ₹{loan.total_interest.toLocaleString('en-IN')}</p>
                                    <p>Monthly EMI: ₹{loan.emi_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <p>Amount Paid: ₹{loan.amount_paid.toLocaleString('en-IN')}</p>
                                    <p>Estimated EMIs Left: {loan.emis_left}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="info-message">No loans found for this customer. Perhaps apply for a new one!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerOverview;
