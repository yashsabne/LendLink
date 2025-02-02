import React, { useState } from "react";
import "../styles/AddMembers.css";

const AddMembersModal = ({ isModalOpenAddMem, closeModal }) => {
    const [members, setMembers] = useState([{ name: "", email: "" }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiResponse, setApiResponse] = useState("");

    const addMemberField = () => {
        setMembers([...members, { name: "", email: "" }]);
    };

    const removeMemberField = (index) => {
        const updatedMembers = members.filter((_, i) => i !== index);
        setMembers(updatedMembers);
    };

    const updateMember = (index, field, value) => {
        const updatedMembers = [...members];
        updatedMembers[index][field] = value;
        setMembers(updatedMembers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
      
    };

    if (!isModalOpenAddMem) {
        return null;
    }

    return (
        <div className="modal-addMem">
            <div className="modal-addMem-content">
                <h3 style={{display:'flex',justifyContent:'space-between',marginBottom:'20px'}} >Feature not integrated to backend for now    <button
                    type="button"
                    onClick={closeModal}
                    className="close-modal-btn"
                >
                    &times;
                </button> </h3> 
                <form onSubmit={handleSubmit}>
                    {members.map((member, index) => (
                        <div key={index} className="member-row">
                            <input
                                type="text"
                                placeholder="Member Name"
                                value={member.name}
                                onChange={(e) =>
                                    updateMember(index, "name", e.target.value)
                                }
                                required
                            />
                            <input
                                type="email"
                                placeholder="Member Email"
                                value={member.email}
                                onChange={(e) =>
                                    updateMember(index, "email", e.target.value)
                                }
                                required
                            />
                            {members.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeMemberField(index)}
                                    className="remove-member-btn"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <div className="btns-addMem">
                    <button
                        type="button"
                        onClick={addMemberField}
                        className="add-member-btn"
                    >
                        Add Member
                    </button>
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                    </div>
                </form>
            </div>
            <small >*keep in mind that user should be registerd first otherwise may occur issue and your money may lost.</small>
              
        </div>
    );
};

export default AddMembersModal;
