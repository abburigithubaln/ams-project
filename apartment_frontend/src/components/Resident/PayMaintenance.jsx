import React from "react";
import axiosInstance from "../../utils/axiosConfig";

const PayMaintenance = ({ amount = 2000, onSuccess }) => {
  const payNow = async () => {
    try {
      // 1. Create order on the backend
      const res = await axiosInstance.post(`/payment/create-order?amount=${amount}`);
      
      // The backend returns a String (order.toString()) which is usually JSON-like
      // But let's assume it's an object if the backend returns it as JSON
      const order = res.data;

      const options = {
        key: "rzp_test_SdGs65bbV6of3j", // Key from your application.properties
        amount: order.amount, // Amount in subunits (e.g. paisa) - Backend service handles amount * 100
        currency: "INR",
        name: "Apartment Management System",
        description: "Maintenance Payment",
        image: "https://cdn-icons-png.flaticon.com/512/1011/1011322.png", // Optional Logo
        order_id: order.id, // Important: Pass the order ID from your backend
        handler: function (response) {
          // This runs on successful payment
          console.log("Payment Success:", response);
          if (onSuccess) onSuccess(response);
          alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
        },
        prefill: {
          name: localStorage.getItem("userName") || "",
          email: localStorage.getItem("userEmail") || "",
        },
        theme: {
          color: "#00897B", // Match your teal theme
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initialization failed:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <button 
      onClick={payNow}
      className="px-6 py-2.5 bg-[#00897B] hover:bg-[#00796B] text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
      Pay Maintenance (₹{amount})
    </button>
  );
};

export default PayMaintenance;
