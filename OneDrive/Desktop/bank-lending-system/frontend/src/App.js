// App.js
// Main application component for the Bank Lending System frontend.
// Manages overall layout, navigation, and data fetching for customer overview.

import React, { useState, useEffect, useCallback, useRef } from 'react'; // Import useRef for debounce timer
// Import individual components
import LoanApplication from './components/LoanApplication';
import CustomerOverview from './components/CustomerOverview';
import PaymentForm from './components/PaymentForm';
import LoanLedger from './components/LoanLedger';
import './App.css'; // Import the main App CSS file

// The base URL for your backend API.
// IMPORTANT: This has been updated to your LIVE RENDER backend URL for deployment.
const API_BASE_URL = 'https://bank-lending-system-backend.onrender.com/api/v1';

function App() {
    // State to manage current view (e.g., 'home', 'apply', 'repay', 'ledger')
    const [currentView, setCurrentView] = useState('home');
    // State for customer ID input (raw input value)
    const [customerId, setCustomerId] = useState('');
    // State for the customer ID that will actually trigger the API call (debounced)
    const [debouncedCustomerId, setDebouncedCustomerId] = useState('');
    // State to store fetched customer loans data
    const [customerLoans, setCustomerLoans] = useState([]);
    // State to store the fetched customer's name
    const [customerName, setCustomerName] = useState(''); // NEW STATE for customer name
    // State for selected loan ID for ledger view
    const [selectedLoanIdForLedger, setSelectedLoanIdForLedger] = useState(null);
    // State for loading indicators and error messages
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Ref to store the debounce timer
    const debounceTimerRef = useRef(null);

    // Effect to debounce the customerId input
    useEffect(() => {
        // Clear previous timer if exists
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set a new timer
        debounceTimerRef.current = setTimeout(() => {
            const trimmedInput = customerId.trim();
            if (trimmedInput) {
                setDebouncedCustomerId(trimmedInput);
            } else {
                setDebouncedCustomerId(''); // Clear debounced ID if input is empty
                setCustomerLoans([]); // Clear loans immediately if input is empty
                setCustomerName(''); // Clear customer name if input is empty
                setError(null); // Clear errors
            }
        }, 500); // 500ms debounce time

        // Cleanup function: clear the timer if the component unmounts or customerId changes again
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [customerId]); // Re-run this effect whenever customerId (raw input) changes

    // Callback function to fetch customer overview data
    const fetchCustomerOverview = useCallback(async () => {
        if (!debouncedCustomerId) {
            setCustomerLoans([]);
            setCustomerName(''); // Clear customer name if no debounced ID
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/customers/${debouncedCustomerId}/overview`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCustomerLoans(data.loans || []);
            setCustomerName(data.customer_name || `Customer ${debouncedCustomerId}`); // Set the actual customer name
        } catch (err) {
            console.error("Failed to fetch customer overview:", err);
            setError(`Failed to load customer data: ${err.message}. Please check the Customer ID.`);
            setCustomerLoans([]);
            setCustomerName(''); // Clear customer name on error
        } finally {
            setIsLoading(false);
        }
    }, [debouncedCustomerId]);

    // Effect hook to fetch customer overview when debouncedCustomerId changes
    useEffect(() => {
        fetchCustomerOverview();
    }, [fetchCustomerOverview]);

    // Handlers for navigation
    const handleViewChange = (view) => {
        setCurrentView(view);
        setError(null);
        setSelectedLoanIdForLedger(null);
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
                        value={customerId} // Bind to raw customerId state
                        onChange={(e) => setCustomerId(e.target.value)} // Update raw customerId on every keystroke
                        placeholder="e.g., CUST001"
                    />
                </div>

                {error && <div className="error-message">{error}</div>}
                {isLoading && <div className="loading-message">Loading customer data...</div>}

                {/* Conditional rendering based on currentView state */}
                {currentView === 'home' && debouncedCustomerId && !isLoading && !error && (
                    <CustomerOverview 
                        loans={customerLoans} // Pass the actual fetched loans array
                        onViewLedger={handleViewLedger} 
                        customerId={debouncedCustomerId} 
                        customerName={customerName} // Pass the fetched customer name
                        loading={isLoading} 
                        error={error} 
                    />
                )}
                {/* When input is empty or debounce is active, show the info message */}
                {currentView === 'home' && !debouncedCustomerId && !isLoading && !error && (
                     <div className="info-message">Please enter a Customer ID to view their loans.</div>
                )}
                {currentView === 'home' && debouncedCustomerId && !isLoading && !error && customerLoans.length === 0 && (
                    <div className="info-message">No loans found for this customer. Try applying for a new loan.</div>
                )}

                {currentView === 'apply' && (
                    <LoanApplication customerId={debouncedCustomerId} onLoanApplied={fetchCustomerOverview} />
                )}

                {currentView === 'repay' && (
                    <PaymentForm loans={customerLoans} onPaymentRecorded={fetchCustomerOverview} />
                )}

                {currentView === 'ledger' && selectedLoanIdForLedger && (
                    <LoanLedger loanId={selectedLoanIdForLedger} loans={customerLoans} customerId={debouncedCustomerId} />
                )}
            </main>
        </div>
    );
}

export default App;
