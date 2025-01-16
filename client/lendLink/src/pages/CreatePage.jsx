import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/CreateGroup.css";
import Header from "../components/Header";
import Footer from "../components/Footer";



const CreateGroup = () => {

  const backendUrl = import.meta.env.VITE_FRONTEND_URL

  
  const [groupName, setGroupName] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [penalty, setPenalty] = useState("");
  const [members, setMembers] = useState([{ name: "", email: "" }]); 
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const adminId = user?._id;
 
 
  const params = new URLSearchParams(window.location.search);
  const grpname = params.get("grpname");

  useEffect(() => {
    if (grpname) {
      setGroupName(grpname);
    }
  }, [grpname]);
 
  const addMemberField = () => {
    if (members.length < (parseInt(maxMembers, 10) || 0)) {
      setMembers([...members, { name: "", email: "" }]);
    }
  };
 
  const updateMember = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };
 
  const removeMemberField = (index) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();

 

    if (!groupName || !monthlyContribution || !maxMembers || !penalty || members.length === 0 || !adminId) {
      setError("All fields are required, including at least one member.");
      return;
    }

    if (members.some((member) => !member.name || !member.email)) {
      setError("All member fields must be filled.");
      return;
    }

    const newGroup = {
      name: groupName,
      rules: {
        monthlyContribution: parseInt(monthlyContribution, 10),
        maxMembers: parseInt(maxMembers, 10),
        penalty: parseInt(penalty, 10)
      },
      members: members.map((member) => ({
        ...member,
        userId: null,
        status: "active",
        contributionsPaid: 0,
        borrowedAmount: 0,
      })),
      adminId: adminId,
    };

    try {
      setIsCreating(true)
    
      const response = await fetch(`${backendUrl}/new-grp/create-new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGroup),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create group");
      }

      setSuccess("Group created successfully!");
      setIsCreating(false)
      if (data.groupId) {
        navigate(`/group/${data.groupId}`);
      }
    } catch (err) {
      setError(err.message || "Error creating group.");
    }
  };

  return (
    <>
      <Header />
      <div className="create-group-container">
        <h1>Create a New Group</h1>

        <form onSubmit={handleSubmit} className="create-group-form">
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            readOnly
          />
          <input
            type="number"
            placeholder="Monthly Contribution"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Maximum Members"
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Penalty Amount"
            value={penalty}
            onChange={(e) => setPenalty(e.target.value)}
            required
          />

          <h3>Add Members</h3>
          <small>you need to add you as member and same email as registered to our account </small>
          {members.map((member, index) => (
            <div key={index} className="member-row">
              <input
                type="text"
                placeholder="Member Name"
                value={member.name}
                onChange={(e) => updateMember(index, "name", e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Member Email"
                value={member.email}
                onChange={(e) => updateMember(index, "email", e.target.value)}
                required
              />
              {members.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMemberField(index)}
                  className="remove-member-button"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMemberField}
            className="add-member-button"
            disabled={members.length >= (parseInt(maxMembers, 10) || 0)}
          >
            Add Member
          </button>

          <button type="submit" className="submit-button">
           {isCreating?'Creating Group':'Create Group' } 
          </button>
        </form>
        <br />
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
      <Footer />
    </>
  );
};

export default CreateGroup;