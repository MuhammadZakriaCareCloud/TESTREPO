// 🎯 PRACTICAL FRONTEND IMPLEMENTATION EXAMPLE
// Real-world usage scenarios for Payment Methods APIs

import React, { useState, useEffect } from 'react';

// =====================================
// SCENARIO 1: USER DASHBOARD PAGE
// =====================================
const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 🎯 KAB: Page load par ye sab APIs call karte hain
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Load user profile
            const userResponse = await fetch('/api/auth/profile/');
            const userData = await userResponse.json();
            setUser(userData);

            // Load subscription info
            const subResponse = await fetch('/api/subscriptions/user/subscription/');
            const subData = await subResponse.json();
            setSubscription(subData);

            // 🎯 PAYMENT METHODS API CALL - Dashboard load par
            const pmResponse = await fetch('/api/subscriptions/api/payment-methods/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const pmData = await pmResponse.json();
            
            if (pmData.success) {
                setPaymentMethods(pmData.payment_methods);
            }

        } catch (error) {
            console.error('Dashboard load error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <h1>Welcome, {user?.name}</h1>
            
            {/* Subscription Status */}
            <div className="subscription-status">
                <h3>Current Plan: {subscription?.plan_name}</h3>
                <p>Status: {subscription?.status}</p>
            </div>

            {/* Payment Methods Section */}
            <div className="payment-methods-section">
                <h3>Payment Methods ({paymentMethods.length})</h3>
                
                {paymentMethods.length === 0 ? (
                    <div className="no-payment-methods">
                        <p>No payment methods found</p>
                        <AddPaymentMethodButton onAdd={loadDashboardData} />
                    </div>
                ) : (
                    <div className="payment-methods-list">
                        {paymentMethods.map(pm => (
                            <PaymentMethodCard 
                                key={pm.id} 
                                paymentMethod={pm}
                                onUpdate={loadDashboardData}  // Refresh after changes
                            />
                        ))}
                        <AddPaymentMethodButton onAdd={loadDashboardData} />
                    </div>
                )}
            </div>
        </div>
    );
};

// =====================================
// SCENARIO 2: PAYMENT METHOD CARD COMPONENT
// =====================================
const PaymentMethodCard = ({ paymentMethod, onUpdate }) => {
    const [updating, setUpdating] = useState(false);

    // 🎯 KAB: User "Set as Default" button dabata hai
    const setAsDefault = async () => {
        setUpdating(true);
        
        try {
            const response = await fetch(`/api/subscriptions/api/payment-methods/${paymentMethod.id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    set_as_default: true
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('Default payment method updated');
                onUpdate(); // Refresh parent component
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error setting default:', error);
            alert('Network error occurred');
        } finally {
            setUpdating(false);
        }
    };

    // 🎯 KAB: User "Remove" button dabata hai
    const removeCard = async () => {
        if (!confirm(`Remove ${paymentMethod.display_name}?`)) {
            return;
        }

        setUpdating(true);

        try {
            const response = await fetch(`/api/subscriptions/api/payment-methods/${paymentMethod.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('Payment method removed');
                onUpdate(); // Refresh parent component
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Error removing card:', error);
            alert('Network error occurred');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className={`payment-method-card ${paymentMethod.is_default ? 'default' : ''}`}>
            <div className="card-info">
                <div className="card-icon">
                    <img src={`/icons/${paymentMethod.card_type}.png`} alt={paymentMethod.card_type} />
                </div>
                <div className="card-details">
                    <span className="card-name">{paymentMethod.display_name}</span>
                    <span className="card-expiry">Expires {paymentMethod.expires}</span>
                    {paymentMethod.is_default && (
                        <span className="default-badge">Default</span>
                    )}
                </div>
            </div>

            <div className="card-actions">
                {!paymentMethod.is_default && (
                    <button 
                        onClick={setAsDefault}
                        disabled={updating}
                        className="btn-secondary"
                    >
                        {updating ? 'Setting...' : 'Set as Default'}
                    </button>
                )}
                
                <button 
                    onClick={removeCard}
                    disabled={updating || paymentMethod.is_default}
                    className="btn-danger"
                    title={paymentMethod.is_default ? 'Cannot remove default payment method' : 'Remove payment method'}
                >
                    {updating ? 'Removing...' : 'Remove'}
                </button>
            </div>
        </div>
    );
};

// =====================================
// SCENARIO 3: ADD NEW PAYMENT METHOD
// =====================================
const AddPaymentMethodButton = ({ onAdd }) => {
    const [showForm, setShowForm] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [stripe, setStripe] = useState(null);
    const [elements, setElements] = useState(null);

    useEffect(() => {
        // Initialize Stripe Elements when form opens
        if (showForm && !stripe) {
            initializeStripe();
        }
    }, [showForm]);

    const initializeStripe = async () => {
        const stripeInstance = window.Stripe('pk_test_your_key');
        const elementsInstance = stripeInstance.elements();
        
        setStripe(stripeInstance);
        setElements(elementsInstance);

        // Mount card element
        const cardElement = elementsInstance.create('card');
        cardElement.mount('#card-element');
    };

    // 🎯 KAB: User naya card add karta hai
    const handleAddCard = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        try {
            // Step 1: Create payment method with Stripe
            const cardElement = elements.getElement('card');
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: 'Customer Name', // You can collect this from form
                },
            });

            if (error) {
                alert('Card validation error: ' + error.message);
                setProcessing(false);
                return;
            }

            // Step 2: Save to your backend via API
            const response = await fetch('/api/subscriptions/api/payment-methods/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    payment_method_id: paymentMethod.id,
                    set_as_default: false
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('Payment method added:', result.payment_method);
                setShowForm(false);
                onAdd(); // Refresh parent component list
                alert('Payment method added successfully!');
            } else {
                alert('Error saving payment method: ' + result.error);
            }

        } catch (error) {
            console.error('Error adding payment method:', error);
            alert('Network error occurred');
        } finally {
            setProcessing(false);
        }
    };

    if (!showForm) {
        return (
            <button 
                onClick={() => setShowForm(true)}
                className="btn-primary add-payment-method-btn"
            >
                + Add Payment Method
            </button>
        );
    }

    return (
        <div className="add-payment-method-form">
            <h4>Add New Payment Method</h4>
            
            <form onSubmit={handleAddCard}>
                <div className="form-group">
                    <label>Card Details</label>
                    <div id="card-element" className="stripe-card-element">
                        {/* Stripe Elements will mount here */}
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="btn-secondary"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    
                    <button 
                        type="submit"
                        className="btn-primary"
                        disabled={processing}
                    >
                        {processing ? 'Adding...' : 'Add Payment Method'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// =====================================
// SCENARIO 4: SUBSCRIPTION UPGRADE PAGE
// =====================================
const SubscriptionUpgrade = () => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    useEffect(() => {
        // 🎯 KAB: Upgrade page load par existing cards load karte hain
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        try {
            const response = await fetch('/api/subscriptions/api/payment-methods/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                setPaymentMethods(data.payment_methods);
                // Auto-select default payment method
                const defaultPM = data.payment_methods.find(pm => pm.is_default);
                setSelectedPaymentMethod(defaultPM?.id);
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
        }
    };

    const handleUpgrade = async () => {
        if (!selectedPlan || !selectedPaymentMethod) {
            alert('Please select a plan and payment method');
            return;
        }

        // Proceed with subscription upgrade
        // Payment method is already attached to customer
        const response = await fetch('/api/subscriptions/user/subscription/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                new_package_id: selectedPlan,
                action: 'upgrade'
            })
        });

        // Handle upgrade response...
    };

    return (
        <div className="subscription-upgrade">
            <h2>Upgrade Your Plan</h2>
            
            {/* Plan Selection */}
            <PlanSelector onSelect={setSelectedPlan} />
            
            {/* Payment Method Selection */}
            <div className="payment-method-selection">
                <h3>Choose Payment Method</h3>
                
                {paymentMethods.length === 0 ? (
                    <div>
                        <p>No payment methods found. Add one to continue.</p>
                        <AddPaymentMethodButton onAdd={loadPaymentMethods} />
                    </div>
                ) : (
                    <div className="payment-methods-radio">
                        {paymentMethods.map(pm => (
                            <label key={pm.id} className="payment-method-option">
                                <input 
                                    type="radio"
                                    name="payment_method"
                                    value={pm.id}
                                    checked={selectedPaymentMethod === pm.id}
                                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                />
                                <span>{pm.display_name}</span>
                                {pm.is_default && <span className="default-text">(Default)</span>}
                            </label>
                        ))}
                        
                        <div className="add-new-option">
                            <AddPaymentMethodButton onAdd={loadPaymentMethods} />
                        </div>
                    </div>
                )}
            </div>

            <button 
                onClick={handleUpgrade}
                disabled={!selectedPlan || !selectedPaymentMethod}
                className="btn-primary upgrade-btn"
            >
                Upgrade Plan
            </button>
        </div>
    );
};

export {
    UserDashboard,
    PaymentMethodCard,
    AddPaymentMethodButton,
    SubscriptionUpgrade
};

/*
🎯 SUMMARY - KAB CALL KARNA HAI:

1. Page Load:
   - Dashboard load → GET /api/payment-methods/
   - Profile page → GET /api/payment-methods/
   - Upgrade page → GET /api/payment-methods/

2. User Actions:
   - Add card → POST /api/payment-methods/
   - Set default → PUT /api/payment-methods/{id}/
   - Remove card → DELETE /api/payment-methods/{id}/

3. After Changes:
   - Refresh list → GET /api/payment-methods/
   - Update UI state
   - Show success messages

4. Business Logic:
   - Subscription changes → Verify payment methods
   - Plan upgrades → Payment method selection
   - Billing issues → Payment method management

RESULT: Complete payment method management within your app! 🚀
*/
