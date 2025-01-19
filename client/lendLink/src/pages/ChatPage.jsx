import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../styles/ChatPage.css';
import { useSelector } from 'react-redux';
import { MdContentCopy } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { CiLight } from "react-icons/ci";
import { MdDarkMode } from "react-icons/md";
import Footer from '../components/Footer';
import Header from '../components/Header';

const backendUrl = import.meta.env.VITE_FRONTEND_URL




const socket = io(`${backendUrl}`);

const ChatPage = () => {
    const { groupId } = useParams();
    const [groupMembers, setGroupMembers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [copyAlert, setCopyAlert] = useState(false);
    const [messageDeleted, setMessageDeleted] = useState("");
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [userEligibleToChat, setUserEligibleToChat] = useState(false);
    const user = useSelector((state) => state.user);
    const [correctedMessage, setCorrectedMessage] = useState('');
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [autoCorrect, setAutoCorrect] = useState(false);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [loading, setloading] = useState(true);

    const navigate = useNavigate();
    const userId = user._id;
    const chatWindowRef = useRef(null);

    useEffect(() => {
        getMemberDetails(groupId);

        const checkUserEligibleToReadChat = async (groupId, userId) => {
            setloading(true);
            try {
                const response = await fetch(`${backendUrl}/check-for-eligible`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, groupId })
                });

                const data = await response.json();
                setUserEligibleToChat(data.success);
                setloading(false)
            } catch (error) {
                console.log(error);
            }
        };

        checkUserEligibleToReadChat(groupId, userId);

        socket.emit('joinGroup', groupId);
        fetchMessages();

        socket.on('receiveMessage', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.disconnect();
        };

    }, [groupId]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [newMessage]);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        let messageToSend = newMessage.trim();

        if (messageToSend) {
            const messageData = {
                groupId,
                message: messageToSend,
                username: user.name,
            };
            socket.emit('sendMessage', messageData);

            setNewMessage('');
            setCorrectedMessage('');
            setShowSuggestion(false);
        }
    };


    const handleCopy = (message) => {
        navigator.clipboard.writeText(message);
        setCopyAlert(true);
        setTimeout(() => setCopyAlert(false), 2000);
    };

    const handleDeleteMsg = async (msgId) => {
        const response = await fetch(`${backendUrl}/handel-delete/${msgId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ msgId, groupId })
        });

        const data = await response.json();

        if (data.message === "Message deleted successfully") {
            fetchMessages();
            setMessageDeleted(data.message);
        }
    };

    const fetchMessages = async () => {
        const response = await fetch(`${backendUrl}/get-messages/${groupId}`);
        const data = await response.json();

        const deletedMessages = JSON.parse(localStorage.getItem('deletedMessages')) || [];
        const filteredMessages = data.filter((message) => !deletedMessages.includes(message._id));

        setMessages(filteredMessages);
    };


    const spellCheck = async (text) => {

        try {
            const response = await fetch(`${backendUrl}/checkSpell/correct-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setCorrectedMessage(data.correctedText);
        } catch (error) {
            console.error("Error during spell check:", error.message);
        }
    };

    const handleDeleteMsgFromMe = (msgId) => {

        const deletedMessages = JSON.parse(localStorage.getItem('deletedMessages')) || [];
        if (!deletedMessages.includes(msgId)) {
            deletedMessages.push(msgId);
            localStorage.setItem('deletedMessages', JSON.stringify(deletedMessages));
        }

        setMessages((prevMessages) =>
            prevMessages.filter((message) => message._id !== msgId)
        );
    };

    const getMemberDetails = async (groupId) => {
        const response = await fetch(`${backendUrl}/checkSpell/getmemberdetails`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId })
        })

        const data = await response.json();
        setGroupMembers(data.members);

    }


    useEffect(() => {
        socket.on('messageDeleted', ({ msgId }) => {
            setMessages((prevMessages) =>
                prevMessages.filter((message) => message._id !== msgId)
            );
        });

        return () => {
            socket.off('messageDeleted');
        };
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleShowSuggestion = async () => {
        if (!correctedMessage) {
            setSuggestionLoading(true);
            await spellCheck(newMessage.trim());
            setSuggestionLoading(false);
        }
        setShowSuggestion(!showSuggestion);
    };



    return (
        <>

            <Header />

            <div className={`main-body ${theme}`}>
                <div className={`chat-page ${theme}`}>
                    <h1 className={`chat-title ${theme}`}>Yash Dev</h1>
                    <small>group-to-group chat</small>
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? <MdDarkMode /> : <CiLight />} Mode
                    </button>



                    {loading ? (
                        <p style={{ textAlign: 'center', marginTop: '50px', fontWeight: 'bold' }}>
                            Checking eligibility....
                        </p>
                    ) : userEligibleToChat ? (
                        <>
                            <div className={`chat-window ${theme}`} ref={chatWindowRef}>
                                {messages.length === 0 ? (
                                    <p style={{ textAlign: 'center', marginTop: '50px', fontWeight: 'bold' }}>
                                        No messages to display
                                    </p>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`message ${msg.username === user.name ? 'sent' : 'received'}`}
                                        >
                                            <span className="msg-text">
                                                <strong style={{ marginRight: '5px' }}>
                                                    {msg.username === user.name ? 'Me' : msg.username}:
                                                </strong>
                                                {msg.message}
                                            </span>
                                            <span className="options-msg">
                                                <ul>
                                                    <li onClick={() => handleCopy(msg.message)}>
                                                        {copyAlert ? 'Copied' : <><MdContentCopy /> copy </>}
                                                    </li>
                                                    {msg.username === user.name && (
                                                        <li onClick={() => handleDeleteMsg(msg._id)} className="delete-btn">
                                                            <MdDelete /> from everyone
                                                        </li>
                                                    )}
                                                    <li onClick={() => handleDeleteMsgFromMe(msg._id)} className="delete-btn">
                                                        <MdDelete /> from me
                                                    </li>
                                                </ul>
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="chat-input">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="message-input"
                                />

                                <div onClick={sendMessage} className="send-button" role="button">
                                    <IoIosSend />
                                </div>
                                <label className='enable_auto_correct'>
                                    <input
                                        type="checkbox"
                                        checked={autoCorrect}
                                        onChange={() => setAutoCorrect(!autoCorrect)}
                                    />
                                    Auto-Correct
                                </label>
                            </div>
                            <button
                                className="suggestion-button"
                                onClick={handleShowSuggestion}
                                disabled={suggestionLoading || !newMessage.trim()}
                            >
                                {suggestionLoading
                                    ? 'Fetching Suggestion...'
                                    : showSuggestion
                                        ? 'Hide Suggestion'
                                        : 'suggestion for your text'}
                            </button>
                            {showSuggestion && correctedMessage && (
                                <div className={`suggestion-box ${showSuggestion ? 'show' : ''}`}>
                                    <p>Suggested: {correctedMessage} <button className='copy-suggestion' onClick={() => handleCopy(correctedMessage)}>{copyAlert ? 'Copied' : 'Copy'}</button></p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h2 style={{ textAlign: 'center', marginTop: '100px' }}>
                                You are not a member of the group to interact with chat so don't be smart by just copying the URL
                            </h2>
                            <div>
                                <button onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                                    Get back
                                </button>
                            </div>
                        </>
                    )}

                </div>



                {userEligibleToChat && <div className={`general-info ${theme} `} >

                    <h1 className={`chat-title ${theme} `}>Group Id: {groupId}</h1>

                    <div className={`general-members-details ${theme}`}>

                        <h4 className={`${theme}`}>member lists</h4>
                        <ul>
                            {groupMembers.length > 0 ? (
                                groupMembers.map((member, index) => (

                                    <li key={index} className={`${theme} ${member.userId == userId ? 'goldenColor' : ''}`}>
                                        {member.name} - {member.email}
                                    </li>
                                ))
                            ) : (
                                <p>No members available.</p>
                            )}
                        </ul>
                    </div>
                    <div className={`general-info-train ${theme} `}>
                        <ul>
                            <li><small className={`${theme}`} >auto correct takes the delay of 1.5sec <b> (feature is in work)</b>   </small></li>
                            <li> <small className={`${theme}`} >enter the message and click the below <b>"suggestion for your text"</b> button to correct text</small></li>
                            <li><small className={`${theme}`}>hover on message or click on message to get options tools.</small></li>
                            <li><small className={`${theme}`}>gold border denotes the badge of you.</small></li>
                        </ul>
                    </div>
                </div>}
            </div>

            <Footer />
        </>
    );
};

export default ChatPage;
