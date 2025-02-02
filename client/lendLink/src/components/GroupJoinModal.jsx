import React, { useState } from "react";
import "../styles/GrpJoinModal.css"
import { useSelector } from "react-redux";

const GroupModal = ({ groupDetails, onClose }) => {
  if (!groupDetails) return null;
  const [sucessMsg, setSucessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
 
  const user = useSelector((state) => state.user);
  const userId = user._id;
  
  const backendUrl = import.meta.env.VITE_FRONTEND_URL;


  const confirmJoin = async (groupId,adminId) => {
    try {

      console.log( adminId, groupId,userId)

      const response = await fetch(`${backendUrl}/new-grp/confirm-join`,{
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, groupId,userId })
      })
      const data = await response.json();

      if(!data.success) {
        setErrorMsg(data.message)
      }
      else {
        setSucessMsg(data.message)
        setTimeout(() => {
          onClose()
        }, 3000);
      
      }
    } catch (error) {
      setErrorMsg('internal error from us' + error)
    }
  }

  return (
    <div className="join_modal">
      <div className="join_modal-content">
        <h2 className="join_modal-title">Group Details</h2>   
        <p className="join_modal-text"><strong >Group Id:</strong> {groupDetails._id}</p>
        <p className="join_modal-text"><strong>Group Name:</strong> {groupDetails.name}</p>
        <p className="join_modal-text"><strong>Admin Name:</strong> {groupDetails.adminName}</p>
        <p className="join_modal-text"><strong>Monthly Contribution:</strong> {groupDetails.rules.monthlyContribution}</p>
        <button className="join_modal-join-btn" onClick={() => confirmJoin(groupDetails._id,groupDetails.admin)}>Join</button> <br />
        <button className="join_modal-close-btn" onClick={onClose}>Cancel</button>
 
        { sucessMsg && <p style={{color:'green'}}> {sucessMsg} </p> }
        {errorMsg && <p style={{color:'red'}}> {errorMsg} </p> }
      </div>
    </div>
  );
};

export default GroupModal;
