// App.js
// Main application component for the Bank Lending System frontend.
// Manages overall layout, navigation, and data fetching for customer overview.

import React, { useState, useEffect, useCallback } from 'react';
// Import individual components
import LoanApplication from './components/LoanApplication';
import CustomerOverview from './components/CustomerOverview';
import PaymentForm from './components/PaymentForm';
import LoanLedger from './components/LoanLedger';
import './App.css'; // Import the main App CSS file

// The base URL for your backend API.
// This has been updated to your live Render.com backend URL.
const API_BASE_URL = 'https://bank-lending-system-backend.onrender.com/api/v1';

function App() {
    // State to manage current view (e.g., 'home', 'apply', 'repay', 'ledger')
    const [currentView, setCurrentView] = useState('home');
    // State for customer ID input
    const [customerId, setCustomerId] = useState('');
    // State to store fetched customer loans data
    const [customerLoans, setCustomerLoans] = useState([]);
    // State for selected loan ID for ledger view
    const [selectedLoanIdForLedger, setSelectedLoanIdForLedger] = useState(null);
    // State for loading indicators and error messages
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Callback function to fetch customer overview data
    // This is memoized with useCallback to prevent unnecessary re-creations.
    const fetchCustomerOverview = useCallback(async () => {
        if (!customerId) {
            setCustomerLoans([]);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/customers/${customerId}/overview`);
            if (!response.ok) {
                // If response is not OK (e.g., 404 Not Found), parse error message
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCustomerLoans(data.loans || []); // Ensure 'loans' array exists
        } catch (err) {
            console.error("Failed to fetch customer overview:", err);
            setError(`Failed to load customer data: ${err.message}. Please check the Customer ID.`);
            setCustomerLoans([]); // Clear loans on error
        } finally {
            setIsLoading(false);
        }
    }, [customerId]); // Dependency array: re-create if customerId changes

    // Effect hook to fetch customer overview when customerId changes
    useEffect(() => {
        fetchCustomerOverview();
    }, [fetchCustomerOverview]); // Dependency array: re-run when fetchCustomerOverview changes

    // Handlers for navigation
    const handleViewChange = (view) => {
        setCurrentView(view);
        setError(null); // Clear errors when changing view
        setSelectedLoanIdForLedger(null); // Clear selected loan for ledger
    };

    // Handler for viewing a specific loan's ledger
    const handleViewLedger = (loanId) => {
        setSelectedLoanIdForLedger(loanId);
        setCurrentView('ledger');
    };

    // Render the main application UI
    return (
        <div className="App">
            <header className="App-header">
                <h1>Bank Lending System</h1>
                <nav className="App-nav">
                    <button onClick={() => handleViewChange('home')}>← Back to Home</button>
                    <button onClick={() => handleViewChange('apply')}>Apply for New Loan</button>
                    <button onClick={() => handleViewChange('repay')}>Loan Repayment</button>
                    <button onClick={() => handleViewChange('ledger')} disabled={!customerLoans || customerLoans.length === 0}>Loan Ledger</button>
                </nav>
            </header>

            <main className="App-main">
                <div className="customer-id-input-section">
                    <label htmlFor="customerIdInput">Enter Customer ID:</label>
                    <input
                        id="customerIdInput"
                        type="text"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        placeholder="e.g., CUST001"
                    />
                </div>

                {error && <div className="error-message">{error}</div>}
                {isLoading && <div className="loading-message">Loading customer data...</div>}

                {/* Conditional rendering based on currentView state */}
                {currentView === 'home' && customerId && !isLoading && !error && (
                    <CustomerOverview loans={customerLoans} onViewLedger={handleViewLedger} customerId={customerId} overviewData={{customer_name: `Customer ${customerId}`}} loading={isLoading} error={error} />
                )}

                {currentView === 'apply' && (
                    <LoanApplication customerId={customerId} onLoanApplied={fetchCustomerOverview} />
                )}

                {currentView === 'repay' && (
                    <PaymentForm loans={customerLoans} onPaymentRecorded={fetchCustomerOverview} />
                )}

                {currentView === 'ledger' && selectedLoanIdForLedger && (
                    <LoanLedger loanId={selectedLoanIdForLedger} loans={customerLoans} customerId={customerId} />
                )}

                {/* Display message if no customer ID entered or no loans found */}
                {currentView === 'home' && !customerId && (
                    <div className="info-message">Please enter a Customer ID to view their loans.</div>
                )}
                {currentView === 'home' && customerId && !isLoading && !error && customerLoans.length === 0 && (
                    <div className="info-message">No loans found for this customer. Try applying for a new loan.</div>
                )}
            </main>
        </div>
    );
}

export default App;
