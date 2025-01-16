import React, { useState, useEffect } from "react";
import '../styles/bankDetails.css';

const AddBankModal = ({ isOpen, onClose, userId }) => {
  if (!isOpen) return null;
  
    const backendUrl = import.meta.env.VITE_FRONTEND_URL


  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifsc: "",
    accountHolderName: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };

  const addBankDetails = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${backendUrl}/bank-acc/add-bank-details/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...bankDetails, userId }),
        }
      );


      const data = await response.json();
  
      setSubmissionSuccess(true);
      setSuccessMsg(data.message);
    } catch (error) {
      console.error("Error adding bank details:", error);
      setErrorMessage(error.message)

    } finally {
      setIsSubmitting(false);  
    }
  };

  useEffect(() => {
    if (submissionSuccess) {
    
      const timer = setTimeout(() => {
        setSuccessMsg("");  
        onClose();
      }, 5000);
 
      return () => clearTimeout(timer);
    }
  }, [submissionSuccess, onClose]);

  return (
    <div>
      <div className="modal-overlay-grpDetails" onClick={onClose}>
        <div className="modal-content-grpDetails" onClick={(e) => e.stopPropagation()}>
          {successMsg && (
            <div className="success-badge">
              {successMsg}
            </div>
          )}
          <h2>Add Bank Details</h2>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isSubmitting) {
                addBankDetails();
              }
            }}
          >
            <div className="form-group-grpDetails">
              <label>Account Holder Name:</label>
              <input
                type="text"
                name="accountHolderName"
                value={bankDetails.accountHolderName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group-grpDetails">
              <label>Account Number:</label>
              <input
                type="text"
                name="accountNumber"
                value={bankDetails.accountNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group-grpDetails">
              <label>IFSC Code:</label>
              <input
                type="text"
                name="ifsc"
                value={bankDetails.ifsc}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-actions-grpDetails">
              <button type="submit" className="save-button" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="cancel-button-grpDetails"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBankModal;
