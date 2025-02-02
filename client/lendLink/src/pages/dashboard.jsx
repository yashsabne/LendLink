import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";
import gsap from "gsap";
import PersonalInfoModal from "../components/PersonalInfoModal";
import { useMediaQuery } from 'react-responsive';
import Loader from "../components/Loader";
import GroupModal from "../components/GroupJoinModal";

const Dashboard = () => {


  const backendUrl = import.meta.env.VITE_FRONTEND_URL


  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const userId = user?._id;

  const [groupData, setGroupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [groupIdJoin, setGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [activeSidebar, setActiveSidebar] = useState("dashboard");
  const [showSetting, setShowSetting] = useState(false);
  const [personalModelOpen, setPersonalModelOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 1000 });
  const [isSidebarVisible, setIsSidebarVisible] = useState(isMobile ? false : true);
  const [successMsg, setSuccessMsg] = useState("");
  const [showModal, setShowModal] = useState(false); 
  const [groupDetails, setGroupDetails] = useState(null);
  const [btnLoad, setbtnLoad] = useState(false);



  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const response = await fetch(`${backendUrl}/new-grp/dashUserDetails/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch group details");
        }
        const data = await response.json();

        setGroupData(data?.groupDetails || []);


        setNotifications(
          data.notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        );
        setLoading(false);
      } catch (err) {
        setError("Error fetching group data.");
        setLoading(false);
      }
    };
    if (userId) {

      fetchUserGroups();
    }
  }, [userId]);

  useEffect(() => {
    gsap.fromTo(
      ".notification-list",
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, stagger: 0.5, ease: "power3.inOut", duration: 2 }
    );
  }, []);

  let TotalContri = 0;

  groupData.forEach((group) => {
    TotalContri += group.totalContributions
  })



  const handleSidebarClick = (menuItem) => {
    setActiveSidebar(menuItem);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  const handleJoinGroup = async () => {
    setbtnLoad(true);
    if (!groupIdJoin) {
      setMessage("Please enter a group ID.");
      return;
    }
    try {
      const response  = await fetch(`${backendUrl}/new-grp/join-new-grp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupIdJoin, userId })
      })
      const data = await response.json();
      console.log(data)
      const todayDate = new Date();

      if(data.success === false) {
        setMessage(data.message);
      }    
      const startDate = new Date(data.invitedGrp.createdAt)
      console.log(startDate)
      if(startDate.getDate() === todayDate.getDate() && 
      startDate.getMonth() === todayDate.getMonth() && 
      startDate.getFullYear() === todayDate.getFullYear()) {
        setShowModal(true); 
        setGroupDetails(data.invitedGrp); 
        setbtnLoad(false)
      }
      else {
        setbtnLoad(false)

        setMessage("group inviting date is gone you cannot proceed now!");
      }

    } catch (err) {
      console.error("Error in handleJoinGroup:", err);
      // setMessage("An error occurred: " + (err.message || err));
    }
   

  };

  const handleCreateGroup = () => {
    if (!newGroupName) {
      setMessage("Please enter a group name!");
      return;
    }
    navigate(`/create-new-group?grpname=${newGroupName}`);
    setNewGroupName("");
  };

  const handleOpenSetting = () => {
    setShowSetting((prevState) => !prevState);
  };


  const showPersonalDetails = () => {
    setPersonalModelOpen(true);
  };

  const closePersonalModal = () => {
    setPersonalModelOpen(false);
  };

  if (!user) {
    return (
      <p style={{ textAlign: "center", fontSize: "large", fontWeight: "bold" }}>
        Log in, please{" "}
        <Link to="/login" style={{ color: "blue" }}>
          Click here
        </Link>
      </p>
    );
  }

  return loading ? (
    <div> <Loader /> </div>
  ) : (
    <>
      <Header />

      {successMsg && (
        <div className="success-badge-grp">
          {successMsg}
        </div>
      )}

      <div className={`dash-wrapper ${isSidebarVisible ? "" : "sidebar-hidden"}`}>

        <aside className={`dash-sidebar ${isSidebarVisible ? "" : "hidden"}`}>


          <button className="sidebar-toggle-in" onClick={toggleSidebar}>
            {isSidebarVisible ? "X" : "≡"}
          </button>

          <h2 className="dash-sidebar-title">LendLink</h2>
          <ul className="dash-sidebar-menu">
            <a href="#dashboard">
              <li
                className={`dash-menu-item ${activeSidebar === "dashboard" ? "active" : ""}`}
                onClick={() => handleSidebarClick("dashboard")}
              >

                Dashboard
              </li>
            </a>
            <a href="#myGroups">
              <li
                className={`dash-menu-item ${activeSidebar === "myGroups" ? "active" : ""}`}
                onClick={() => handleSidebarClick("myGroups")}
              >
                My Groups
              </li>
            </a>
            <a href="#exploreGroups">
              <li
                className={`dash-menu-item ${activeSidebar === "explore" ? "active" : ""}`}
                onClick={() => handleSidebarClick("explore")}
              >
                Explore Groups
              </li>
            </a>
            <a href="#recentActivites">
              <li
                className={`dash-menu-item ${activeSidebar === "history" ? "active" : ""}`}
                onClick={() => handleSidebarClick("history")}
              >
                History
              </li>
            </a>
            <li
              className={`dash-menu-item ${activeSidebar === "settings" ? "active" : ""}`}
              onClick={() => handleOpenSetting()}
            >
              {showSetting ? "Hide" : "Settings"}
            </li>


            {showSetting && (
              <div className="personal-setting">
                <ul>
                  <li className="personal-details-li" onClick={showPersonalDetails}>
                    Personal details
                  </li>
                  <li className="personal-details-li">Help section</li>
                </ul>
              </div>
            )}
          </ul>


        </aside>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarVisible ? "X" : "≡"}
        </button>

        <PersonalInfoModal isOpen={personalModelOpen} onClose={closePersonalModal} userId={userId} />

        {/* Main Dashboard */}
        <main className="dash-main">
          <section className="dash-welcome-banner" id="dashboard">
            <div className="dash-welcome-content">
              <h1>Welcome Back, {user?.name || "User"}!</h1>
              <p>Manage your lending circle activities and track contributions effortlessly.</p>
            </div>
          </section>
          <section className="dash-insights">
            <div className="dash-insight-card">
              <h3>Total Groups</h3>
              <p>{groupData?.length || 0}</p>
            </div>
            <div className="dash-insight-card">
              <h3>Total Contributions</h3>
              <p>Rs. {TotalContri}</p>
            </div>
            <div className="dash-insight-notification">
              <h3>Notification Center</h3>
              <ul>
                {notifications.length === 0 ? 'No notifications' :
                  notifications.slice(0, 10).map((notification, i) => (
                    <div className="notification-list-div">
                    <li className="notification-list" key={i} dangerouslySetInnerHTML={{ __html: notification.message }}>          
                       </li>
                         <small className="notification-list" > - at {new Date(notification.timestamp).toLocaleTimeString() + ' - ' + new Date(notification.timestamp).toLocaleDateString() }</small>
                         </div>
                  ))
                }


              </ul>
            </div>
          </section>
          <section className="dash-my-groups" id="myGroups">
            <h2>
              My Groups{" "}
              <a href="#exploreGroups">
                <FaPlusCircle
                  style={{ cursor: "pointer", marginTop: "8px" }}
                />
              </a>
            </h2>
            {loading && <p>Loading groups...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ul className="dash-group-list">
              {groupData.map((group) => (
                <li
                  key={group.groupId}
                  className="dash-group-item"
                  onClick={() => navigate(`/group/${group.groupId}`)}
                >
                  {group.groupName}
                </li>
              ))}
            </ul>
          </section>
    
          <div className="dash-info-card" id="exploreGroups">
            <h3>Manage Your Groups</h3>
            <div className="dash-group-create-section">
              <h4>Create a New Group</h4>
              {message && <p style={{ color: "red" }}>{message}</p>}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateGroup();
                }}
              >
                <input
                  type="text"
                  placeholder="Enter Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="dash-input"
                />
                <button type="submit" className="dash-button">
                  Create Group
                </button>
              </form>
            </div>

            <div className="dash-group-join-section">
              <h4>Join an Existing Group <small>(you can join only within one day of creation of group)</small> </h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleJoinGroup();
                }}
              >
                <input
                  type="text"
                  placeholder="Enter the invite code"
                  value={groupIdJoin}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="dash-input"
                /> 
                <button type="submit" className="dash-button" disabled={btnLoad}  >
                {btnLoad? 'Getting info' : 'Join Group' }
                </button>
              </form>


              {showModal && (
                <GroupModal
                  groupDetails={groupDetails}
                  onClose={() => setShowModal(false)}
                />
              )}
            </div>
          </div>
          <section className="dash-recent-activities" id="recentActivites">
            <h2>Recent Activities</h2>
            <ul className="dash-activity-list">
              <li>yash sabne made this app</li>
              <li>Feature is under work</li>
            </ul>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
