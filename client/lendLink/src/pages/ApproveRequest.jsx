import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ApproveRequest = () => {
  const [searchParams] = useSearchParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setsuccessMsg] = useState("");
  const [errorMsg, seterrorMsg] = useState("");
  const navigate = useNavigate();
  const [approveWait, setapproveWait] = useState(false);


  const groupId = searchParams.get('groupId');
  const userId = searchParams.get('userId');

  
  const backendUrl = import.meta.env.VITE_FRONTEND_URL


  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${backendUrl}/new-grp/user-details?userId=${userId}`);
        if (!response.ok) { 
          throw new Error('User not found');
        }
        const data = await response.json();
        setMember(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (userId) fetchUserDetails();
  }, [userId]);

  const handleApprove = async () => {
    setapproveWait(true)
    try {
      const response = await fetch(`${backendUrl}/new-grp/approve-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupId, userId })
      });

      const data = await response.json();
 
      setapproveWait(false)

      if(!data.success) {
        seterrorMsg(data.message)
        
      }else {
        setsuccessMsg(data.message)
      }
  
    } catch (err) { 
      alert(err.message);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <>
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Approve Member Request</h2>
      <p>Do you want to add <strong>{member.name} ({member.email})</strong> to the group?</p>
      <button 
        onClick={handleApprove} 
        disabled={loading}
        style={{ padding: '10px 20px', background: 'green', color: 'white', border: 'none', cursor: 'pointer', margin: '10px' }}>
       {approveWait? "Adding user":'Confirm Add' } 
      </button> 

       {successMsg &&  <p style={{color:'green'}} > {successMsg} </p> } 
       
       {errorMsg &&  <p style={{color:'red'}} > "{errorMsg}!" <br />  <a href="/dashboard" style={{color:'blue'}} > get back </a> </p>  }

       <div>
      
       </div> 
    </div>
      <ul>
      <li><b> if you want to not allow simply ignore this.</b></li>
      <li><b> This click will allow user to add into group.</b></li>
    </ul>
    </>
  );
};

export default ApproveRequest;
