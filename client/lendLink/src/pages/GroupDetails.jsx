import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/GroupDetails.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { addMonths } from "date-fns";
import { useSelector } from "react-redux";
import AddBankModal from "../components/AddBankAc";
import Loader from "../components/Loader";
import { useNavigate } from 'react-router-dom';

const GroupDetails = () => {
  const { groupId } = useParams();
  const [groupDetails, setGroupDetails] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState(null);
  const [isPaymentDay, setIsPaymentDay] = useState(false);
  const [winnerDate, setWinnerDate] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [isEligbleForBankAc, setIsEligbleForBankAc] = useState(false);
  const [isEligibleForPayment, setIsEligibleForPayment] = useState(true);
  const [canDeletetheGroup, setCanDeletetheGroup] = useState(false);
  const [selectingError, setselectingError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMessge, seterrorMessge] = useState("");
  const [calenderWorking, setcalenderWorking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isGroupWinnerAlreadyDeclared, setIsGroupWinnerAlreadyDeclared] = useState(false);
const [showingWinnerNow, setshowingWinnerNow] = useState(false);
const [nameOfWinner, setnameOfWinner] = useState('');
  const razorpayKey = import.meta.env.REACT_APP_RAZORPAY_KEY;

  const user = useSelector((state) => state.user);
  const userId = user._id;


  const backendUrl = import.meta.env.VITE_FRONTEND_URL

  const navigate = useNavigate();
 

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await fetch(`${backendUrl}/new-grp/group/${groupId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch group details");
        }
        const data = await response.json();

          setGroupDetails(data);

        const calculatedEndDate = calculateEndDate(data.createdAt, data.members.length);
        setEndDate(calculatedEndDate.toISOString().split("T")[0]);

        checkIfPaymentDay(data.createdAt);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchGroupDetails();
    checkEligibleForAcAdd();
    checkForAdmin();
    checkEligibleForPayment();
    IsGroupWinnerAlreadyDeclared();
  }, [groupId]);


  const calculateEndDate = (createdAt, totalMembers) => {
    const startDate = new Date(createdAt);
    return addMonths(startDate, totalMembers);
  };

  const checkIfPaymentDay = (createdAt) => {
    const today = new Date();
    const createdDate = new Date(createdAt);
    const startDate = new Date(createdAt);

    if (
      createdDate.getDate() === today.getDate() &&
      createdDate.getMonth() === today.getMonth() &&
      createdDate.getFullYear() === today.getFullYear()
    ) {
      setIsPaymentDay(true);
      setWinnerDate(false);
      setCanDeletetheGroup(true);

      return;
    }

    while (startDate <= today) {
      if (startDate.getDate() === today.getDate()) {
        setIsPaymentDay(true);
        setWinnerDate(true);
        return;
      }
      startDate.setMonth(startDate.getMonth() + 1);
    }

    setIsPaymentDay(false);
    setWinnerDate(false);
  };

  const calculateTimeProgress = (createdAt, endDate) => {
    const startDate = new Date(createdAt);
    const end = new Date(endDate);
    const now = new Date();

    if (now > end) {
      return 100;
    }

    const totalDuration = end - startDate;
    const elapsed = now - startDate;

    return Math.min(Math.round((elapsed / totalDuration) * 100), 100);
  };

  const handlePaymentOfContri = async () => {
    const paybtn = document.querySelector('.pay-button');
    paybtn.innerHTML = "Loading Payment Page...";

    try {
      const orderResponse = await fetch(`${backendUrl}/make-payment/create-order-contribution/${userId}/${groupId}?date=${new Date()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, groupId })
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const { orderId, amount, currency } = await orderResponse.json();

      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency,
        name: 'Contribution',
        description: 'Payment for monthly contribution',
        order_id: orderId,
        handler: async (paymentResponse) => {
          paybtn.innerHTML = 'Finalizing... Please stay on this page';

          try {
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentResponse;

            const paymentDetails = {
              userId,
              groupId,
              razorpayPaymentId: razorpay_payment_id,
              razorpayOrderId: razorpay_order_id,
              razorpaySignature: razorpay_signature
            };

            const paymentSuccessResponse = await fetch(`${backendUrl}/make-payment/payment-success`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentDetails),
            });

            const result = await paymentSuccessResponse.json();

            console.log(result)
            if (paymentSuccessResponse.ok) {
              setSuccessMsg('Payment successful. Need to refresh page to update details');
              paybtn.innerHTML = "Payment Successful!";
              checkEligibleForPayment();
            } else {
              seterrorMessge('Payment failed. Please try again.');
              paybtn.innerHTML = "Payment Failed!";
            }
          } catch (error) {
            console.error("Error processing payment success:", error);
            seterrorMessge('Payment verification failed. Please try again.');
            paybtn.innerHTML = "Payment Failed!";
          }
        },
        theme: { color: '#3399cc' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();

      paybtn.innerHTML = "Complete the payment";

    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error initiating payment. Please try again.');
      paybtn.innerHTML = "Payment Failed!";
    }
  };

  const checkForAdmin = async () => {
    try {
      const response = await fetch(`${backendUrl}/new-grp/group/${groupId}/${userId}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, groupId })
      });
      const data = await response.json();
      setIsAdmin(data.admin);
    } catch (error) {
      console.error('Error fetching admin details:', error);
    }
  };

  const checkEligibleForAcAdd = async () => {
    try {
      const response = await fetch(`${backendUrl}/bank-acc/isUserSetAC/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setIsEligbleForBankAc(errorData.permit);
        return; // Exit the function
      }

      const data = await response.json();
      setIsEligbleForBankAc(data.permit);

    } catch (error) {
      console.error("Error fetching eligibility status:", error.message);
      alert("An error occurred while checking eligibility. Please try again later.");
    }
  };

  const checkEligibleForPayment = async () => {
    try {
      const response = await fetch(`${backendUrl}/make-payment/check-eligible-forPayment/${userId}/${groupId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to check payment eligibility");
      }

      const data = await response.json();

      const lastPaymentDate = data.date;
      const dateLastPaid = new Date(lastPaymentDate);

      const currDate = new Date();

      const formattedLastPaid = dateLastPaid.toISOString().split("T")[0];
      const formattedCurrDate = currDate.toISOString().split("T")[0];

      if (formattedCurrDate === formattedLastPaid) {
        setIsEligibleForPayment(false);
      } else {
        setIsEligibleForPayment(true);
      }
    } catch (error) {
      console.log("Error checking payment eligibility:", error);
    }
  };


  const IsGroupWinnerAlreadyDeclared = async () => {
    try {
      const response = await fetch(`${backendUrl}/new-grp/get-latest-winner-date/${groupId}`, {
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({groupId})
      })
      const data =await response.json();
      setIsGroupWinnerAlreadyDeclared(data.success)
      setnameOfWinner(data.latestWinner.name)
      setshowingWinnerNow(showingWinner(data.latestWinner.createdAt))
       
    } catch (error) {
      console.log(error)
    }
  }

  const showingWinner = (latestWinnerDate) => {
     const winnerDate = new Date(latestWinnerDate).getDate();
     const winnerMonth = new Date(latestWinnerDate).getMonth();
     const winnerYear = new Date(latestWinnerDate).getFullYear();

     const today = new Date();
    
     if(today.getDate() === winnerDate && today.getMonth() === winnerMonth && today.getFullYear() === winnerYear) {
     return true;
     }
     return false;
  } 

 
  

  const handleOpenChat = () => {
    navigate(`/chat/${groupId}`);
  };


  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <Link to="/dashboard" className="back-button">
          Back to Dashboard
        </Link>
      </div>
    );
  }
 
  if (!groupDetails) {
    return (
      <>
        <Loader />
      </>
    );
  }

  let totalSum = 0;
  groupDetails.members.forEach((member) => {
    totalSum += member.contributionsPaid;
  });


  const selectWinner = async () => {
    if (!groupDetails || groupDetails.members.length === 0) return;

    setIsSelecting(true);
    setSelectedWinner(null);


    try {
      const response = await fetch(
        `${backendUrl}/new-grp/group/${groupId}/select-winner/${totalSum}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSelectedWinner(data.winnerName);

        if (mediaRecorder) {
          setTimeout(() => {
            mediaRecorder.stop();
            setMediaRecorder(null);
          }, 3000);
        }
      } else {
        setselectingError(data.message || "Failed to select winner");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSelecting(false);
    }
  };

  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/mp4" });
        const file = new File([blob], "screen-recording.mp4", { type: "video/mp4" });
        await uploadVideo(file);
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error starting screen recording:", error.message);
    }
  };

  const uploadVideo = async (file) => {
    try {
      const formData = new FormData();
      formData.append("video", file);

      const response = await fetch(
        `${backendUrl}/saving-video/upload-video/${userId}/${groupId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error uploading video:", error.message);
      return null;
    }
  };



  const paymentDates = [];

  const calculatePaymentDates = () => {
    const startDate = new Date(groupDetails.createdAt);
    const finalDate = new Date(endDate);


    let currentDate = new Date(startDate);

    while (currentDate <= finalDate) {

      paymentDates.push(new Date(currentDate).toLocaleDateString());

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return paymentDates;
  };

  calculatePaymentDates();

  const addPaymentDatesToCalendar = async () => {
    setcalenderWorking(true);

    try {

      if (!Array.isArray(paymentDates) || paymentDates.length === 0) {
        setSuccessMsg("Please select at least one valid date.");
        setcalenderWorking(false);
        return;
      }

      const response = await fetch(`${backendUrl}/calender/add-payment-dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: paymentDates, userId, groupId }),
      });

      const data = await response.json();

      if (response.ok) {

        setSuccessMsg(data.message || "Events successfully added to the calendar.");
      } else {

        if (response.status === 401 || response.status === 403) {
          setSuccessMsg("Authentication required. Redirecting...");
          window.location.href = `${backendUrl}/auth/google`;
        } else if (data.error) {
          seterrorMessge(data.error);
        } else {
          setSuccessMsg("Failed to add events to the calendar. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error adding to calendar:", error.message);
      setSuccessMsg("An unexpected error occurred. Please try again later.");
    } finally {
      setcalenderWorking(false);
    }
  };

  const progress = calculateTimeProgress(groupDetails.createdAt, endDate);


  const deleteGroup = async (groupId) => {

    try {

      const confirmDelete = window.confirm("DO you want to delete this group permanently if you have done any paymnent so pplease don't delete");

      if(!confirmDelete) {
        return;
      }

      const response = await fetch(`${backendUrl}/new-grp/delete-group-permanent`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: groupId, userId: userId })
      })
      const data = await response.json();
      console.log(data);

      if (data) {
        if (data.success) {
          navigate(`/dashboard?groupDeleted=${data.success}&goupName=${data.groupName}&${data.message}`)
        }
      } 

    } catch (error) {
      console.log(error)
    }
  }



  return (
    <div className="body-main">
      <Header />
      <div className="group-details">
        <header className="group-header">
          <h1 className="group-name">{groupDetails.name} </h1>

          <p className="group-dates">
            <strong>Start Date:</strong>{" "}
            {new Date(groupDetails.createdAt).toLocaleDateString()} |{" "}
            <strong>End Date:</strong> {new Date(endDate).toLocaleDateString()}
          </p>
          <p className="total-money">
            <strong>Total Money in Group:</strong> Rs. {totalSum}
          </p>



          <button className="chat-button" onClick={handleOpenChat} >
            💬 Chat with Group
          </button>

        </header>

        <main className="group-main">
          <div className="members-section">
            <h3>Members</h3>
            <ul className="member-list">
              {groupDetails.members.map((member, index) => (
                <li key={index} className="member-card">
                  <div className="member-name-contri-div">
                    <p className="member-name">
                      <span>
                        {member.name}{" "}
                        {user._id === member.userId && (
                          <div className="link-bank-hover-container">
                            <small style={{ color: "gray" }}>It's you 😊</small>
                            <div className="link-bank-container">

                              {isEligbleForBankAc ? (
                                <>
                                  <button className="link-btn-ac" onClick={() => setModelOpen(true)}>Link Bank</button>
                                  <span className="span-text-link">
                                    This A/C will be used for crediting the balance to the winner.
                                  </span>
                                </>
                              ) : (
                                <>
                                  <button className="link-btn-ac" disabled>Already Linked</button>
                                  <span className="span-text-link">
                                    A/C is already saved. To edit, please visit the dashboard section.
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </span>
                    </p>
                    <p className="member-contribution">
                      Contribution: Rs. {member.contributionsPaid}
                    </p>
                  </div>
                  <div className="btn-pay-div">
                    {user._id === member.userId && (
                      <button
                        disabled={!isPaymentDay || !isEligibleForPayment}
                        onClick={handlePaymentOfContri}
                        className="pay-button"
                      >
                        {isEligibleForPayment ? 'Pay Now' : 'Paid'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="progress-section">
            <h3>Group Expiry Progress</h3>
            {isAdmin && <span className="admin-btn">You are the group admin</span>} <br />

            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{
                  width: `${progress}%`,
                  backgroundColor: progress === 100 ? "red" : "#4caf50",
                }}
              ></div>
            </div>
            <p>{progress}% of time elapsed</p>
            {progress === 100 && (
              <p className="expired-message">🚨 The group has expired! 🚨</p>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={selectWinner}
                  className="winner-button"
                  disabled={isSelecting || progress === 100 || !winnerDate || mediaRecorder == null || isGroupWinnerAlreadyDeclared}
                >
                  {isSelecting ? "Selecting Winner..." : "Select Monthly Winner"}
                </button>

                <label>
                  <input
                    type="checkbox"
                    checked={isRecording}
                    onChange={async (e) => {
                      setIsRecording(e.target.checked);
                      if (e.target.checked) {
                        await startScreenRecording();
                      }
                    }}
                    disabled={isSelecting || progress === 100 || !winnerDate || mediaRecorder !== null || isGroupWinnerAlreadyDeclared}
                  />
                  Start Recording
                </label>
              </>

            )}

            {isSelecting && <div className="winner-animation">🎉 Spinning... 🎉</div>}
            {selectedWinner && (

              <div className="winner-result" >
                <p>🎊 This month's winner is:</p>
                <h2>{selectedWinner}</h2>
                <button  className="give-amount-winner" onClick={() => alert("Not getting the payouts api for now so now this is static ")}  >give amount</button>
              </div>

            )} <br />

            {selectingError}

            {showingWinnerNow && (
                <div className="winner-result" >
                <p>🎊 Results are out winner is:</p>
                <h2>{nameOfWinner}</h2>
                {isAdmin &&    <button  className="give-amount-winner" onClick={() => alert("Not getting the payouts api for now so now this is static ")}  >give amount</button>} <br />

                 </div>
            )
             }
            

            <div className="payment-dates">
              <div className="pay-dates-calender">
                <h4 title="Failed to pay on this date can lead to a fine">
                  Payment Installment Dates
                </h4>
                <button onClick={addPaymentDatesToCalendar}>
                  {calenderWorking ? (
                    <>
                      Working...
                    </>
                  ) : (
                    <>
                      Add Reminder to Google
                      <img src="/images/googl-calender.png" alt="Google Calendar" />
                    </>
                  )}
                </button>
              </div>

              <ul >
                <div className="upcoming-dates">
                  {paymentDates.map((date, index) => (
                    <li
                      key={index}
                      className='payment-date-item'>
                      <span className="payment-date">
                        <span style={{ color: "grey" }}>{index + 1}.</span> {date}
                      </span>
                    </li>
                  ))}
                </div>
              </ul>
            </div>

            {canDeletetheGroup && isAdmin && <button className="delete-btn-group" onClick={() => deleteGroup(groupId)} >delete group</button>}
          </div>
        </main>


        <footer className="group-footer">
          <div className="faq-section">
            <h3>FAQs</h3>
            <p>
              <strong>How to add the bank account for withdrawal of the winning amount?</strong>
              You need to click on <b>"It's you 😊"</b> and then you can add your bank account.
            </p>
            <p>
              <strong>How is the winner selected?</strong> Randomly unique member each month.
            </p>
            <p>
              <strong>What happens if a member misses a payment?</strong> Missed
              payments may result in removal.
            </p>
          </div>

        </footer>
      </div>
      <Footer />
      <AddBankModal isOpen={modelOpen} onClose={() => setModelOpen(false)} userId={userId} />
      {successMsg && (
        <div className="success-badge-grp">
          {successMsg}
        </div>
      )}

      {errorMessge && (
        <div className="error-badge-grp">
          {errorMessge}
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
