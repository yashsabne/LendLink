import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import "../styles/PersonalInfoModal.css";

=======
import "../styles/personalInfoModal.css";
>>>>>>> a26030709f119e79d8343801f6ef74d348d5f8a2
import { FaPencilAlt } from "react-icons/fa";
import Loader from "./Loader";

const PersonalInfoModal = ({ isOpen, onClose, userId }) => {
  if (!isOpen) return null;

  const backendUrl = import.meta.env.VITE_FRONTEND_URL


  const [userData, setUserData] = useState(null);  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingBank, setEditingBank] = useState(false);  
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifsc: "",
  });  
  const [updating, setUpdating] = useState(false); 
  const [updateMessage, setUpdateMessage] = useState("");  
  useEffect(() => {
    const fetchUserPersonalDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${backendUrl}/personal-info/info/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch details");
        }
        const data = await response.json();
        setUserData(data);
        setBankDetails({
          accountHolderName: data.bankInfo?.accountHolderName || "",
          accountNumber: data.bankInfo?.accountNumber || "",
          ifsc: data.bankInfo?.ifsc || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserPersonalDetails();
    }
  }, [userId]);
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleSaveBankDetails = async () => {
    try {
      setUpdating(true);  
      setUpdateMessage("");  

      const response = await fetch(`${backendUrl}/personal-info/update-bank/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankInfo: bankDetails }),
      });

      if (!response.ok) {
        throw new Error("Failed to update bank details");
      }

      const updatedData = await response.json();
      setUserData((prev) => ({
        ...prev,
        bankInfo: updatedData.bankInfo,
      }));
      setEditingBank(false); 
      setUpdateMessage("Bank details will be updated as you approve it from email. If you changed your mind just refresh page");
    } catch (err) {
      setUpdateMessage("Error updating bank details: " + err.message);
    } finally {
      setUpdating(false);  
    }
  };

  if (loading) return <div> <Loader/> </div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="personal-detail-modal">
      <div className="personal-detail-modal-content">
        <h2 className="personal-detail-modal-header">Personal Information</h2>
        {userData ? (
          <ul className="personal-detail-list">
            <li className="personal-detail-item" >
            <strong>Costumer ID: </strong>{userData.personalInfo.constumerId || "N/A"}</li>
            <li className="personal-detail-item">
              <strong>Name:</strong> {userData.personalInfo.name || "N/A"}
            </li>
            <li className="personal-detail-item">
              <strong>Phone:</strong> {userData.personalInfo.phone || "N/A"}
            </li>
            <li className="personal-detail-item">
              <strong>Email:</strong> {userData.personalInfo.email || "N/A"}
            </li>
            <li className="personal-detail-item">
              <strong>Address:</strong> {userData.personalInfo.address || "N/A"}
            </li>
            <li className="personal-detail-item">
              <strong>Age:</strong> {userData.personalInfo.age || "N/A"}
            </li>
            <li className="personal-detail-item">
              <strong>
                Bank Details:
                <button
                  className="edit-bank-details"
                  onClick={() => setEditingBank(true)}
                >
                  <FaPencilAlt />
                </button>
              </strong>
              {editingBank ? (
                <div className="edit-bank-form">
                  <label>
                    Account Holder Name:
                    <input
                      type="text"
                      name="accountHolderName"
                      value={bankDetails.accountHolderName}
                      onChange={handleInputChange}
                      placeholder="Enter Account Holder Name"
                      required
                    />
                  </label>
                  <label>
                    Account Number:
                    <input
                      type="text"
                      name="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={handleInputChange}
                      placeholder="Enter Account Number"
                      required
                    />
                  </label>
                  <label>
                    IFSC:
                    <input
                      type="text"
                      name="ifsc"
                      value={bankDetails.ifsc}
                      onChange={handleInputChange}
                      placeholder="Enter The IFSC code"
                      required
                    />
                  </label>
                  <div className="editButtons">
                    <button
                      onClick={handleSaveBankDetails}
                      className="save-button"
                      disabled={updating}
                    >
                      {updating ? "Updating..." : "Update"}
                    </button>
                    <button
                      onClick={() => setEditingBank(false)}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="personal-detail-bank-list">
                  <li>Account Holder: {userData.bankInfo?.accountHolderName || "N/A"}</li>
                  <li>Account Number: {userData.bankInfo?.accountNumber || "N/A"}</li>
                  <li>IFSC: {userData.bankInfo?.ifsc || "N/A"}</li>
                </ul>
              )}
            </li>

            {updateMessage && <div className="update-message">{updateMessage}</div>}
            <li
              className="personal-detail-delete"
              onClick={() => alert("We cannot delete your account!")}
            >
              Delete Account
            </li>
          </ul>
        ) : (
          <div>No data available</div>
        )}
       
        <button className="personal-detail-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoModal;
