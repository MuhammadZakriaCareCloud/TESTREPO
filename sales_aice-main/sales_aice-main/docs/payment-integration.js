/**
 * Payment Integration Documentation
 * 
 * This document shows the structure of payment data that will be sent to your backend
 * when users complete the payment form.
 */

// Example payload that will be sent to your backend API: /api/subscriptions/subscribe/
const examplePaymentPayload = {
  package_id: "2", // or number like 2
  payment_info: {
    card_number: "4242 4242 4242 4242",
    expiry_month: "12",
    expiry_year: "2025",
    cvc: "123"
  },
  amount: 79, // Package price in dollars
  currency: "usd"
};

// Expected response from your backend after successful payment processing:
const expectedBackendResponse = {
  success: true,
  message: "Subscription created successfully",
  subscription_id: "sub_12345",
  customer_id: "cus_67890",
  payment_status: "completed",
  // Any other data your backend returns
};

// Error response format:
const errorResponse = {
  success: false,
  message: "Payment failed: Card declined",
  error_code: "card_declined"
};

export { examplePaymentPayload, expectedBackendResponse, errorResponse };