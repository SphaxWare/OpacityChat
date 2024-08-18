import React, { useEffect, useState, useRef  } from 'react';
import { fetchUsers, profileUser, fetchMessages } from './api';
import io from 'socket.io-client';
import './UserList.css';
import { FaArrowLeft } from 'react-icons/fa';
import { FaAngleUp } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { CgLogOff } from "react-icons/cg";


// Connect to the backend WebSocket server
console.log(process.env.REACT_APP_BACKEND_PROD)
console.log(process.env.REACT_APP_API_PROD_URL)

const socket = io(process.env.REACT_APP_BACKEND_PROD);

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const chatBoxRef = useRef(null);

    // scroll down when new message arrive
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]); // This effect runs every time `messages` changes

    useEffect(() => {
        const getUsers = async () => {
            try {
                const usersData = await fetchUsers();
                setUsers(usersData);
            } catch (error) {
                setError('Error fetching users');
                console.error('Error fetching users:', error);
            }
        };

        getUsers();
    }, []);

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const user = await profileUser();
                console.log(user)
                if (user) {
                    setCurrentUser(user);
                }
                else {
                    navigate("/login")
                }
            } catch (error) {
                setError('Error fetching user');
                console.error('Error fetching user:', error);
                navigate("/login");
            }
        };
        getCurrentUser();
    }, [navigate]);
    

    // Fetch previous messages when a user is selected
    useEffect(() => {
        const getCurrentUserAndMessages = async () => {
            try {
                const user = currentUser
                if (selectedUser && user) {
                    const messagesData = await fetchMessages(selectedUser._id, user._id);
                    setMessages(messagesData);
                }
            } catch (error) {
                setError('Error getting user or messages');
                console.error('Error:', error);
            }
        };

        getCurrentUserAndMessages();
    }, [selectedUser, navigate, currentUser]);

    // receive messages from other sockets
    useEffect(() => {
        if (selectedUser) {
            console.log(`Joining room: ${currentUser._id}`);
            socket.emit('joinRoom', currentUser._id);
            console.log(currentUser)
            socket.on('message', (message) => {
                console.log('Message received:', message);
                if (
                    (message.sender === currentUser._id && message.recipient === selectedUser._id) ||
                    (message.sender === selectedUser._id && message.recipient === currentUser._id)
                ) {
                    setMessages((prevMessages) => [...prevMessages, message]);
                }
            });

            return () => {
                console.log(`Leaving room: ${currentUser._id}`);
                socket.off('message');
            };
        }
    }, [selectedUser, currentUser]);


    if (error) {
        return <div>{error}</div>;
    }

    if (currentUser === null) {
        return <div>Loading...</div>;
    }

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    const handleBack = () => {
        setSelectedUser(null);
        setMessages([]);
    };

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        navigate("/login");
    };

    const handleSend = () => {
        if (newMessage.trim() && selectedUser) {
            const message = {
                sender: currentUser._id, // Sender ID
                recipient: selectedUser._id, // Recipient's ID
                text: newMessage, // Text of the message
                timestamp : new Date()
            };
            socket.emit('sendMessage', message);
            setNewMessage('');
        }
    };

    return (
        <div className={`user-list-container ${selectedUser ? 'flipped' : ''}`}>
            <div className="user-list users-list">
                <div className="current-user-profile">
                    <img
                        className="current-user-pic"
                        src={currentUser.profilePic || 'default-avatar.png'}
                        alt="Profile"
                    />
                    <div className="current-user-info">
                        <div className="current-username">{currentUser.username}</div>
                        <button className="logout-button" onClick={handleLogout}><CgLogOff />

                        </button>
                    </div>
                </div>
                <h2>Select A User To Chat</h2>
                <ul>
                    {users.map((user) => (
                        <li key={user._id} onClick={() => handleUserClick(user)} className="user-item">
                            <img
                                className="user-profile-pic"
                                src={user.profilePic || 'default-avatar.png'}
                                alt="Profile"
                            />
                            <div className="users-info">
                                <div className="username">{user.username}</div>
                                <div className="bio">users's bio users's</div> {/* Placeholder for last message */}
                            </div>
                            <div className={`status ${user.isOnline ? 'online' : 'offline'}`}>
                                {user.isOnline ? 'Online' : 'Offline'}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="chat-interface">
                <div className="chat-header">
                    <FaArrowLeft className="back-icon" onClick={handleBack} />
                    <div className="user-info">
                        <img className="profile-pic" src={selectedUser?.profilePic || 'default-avatar.png'} alt="Profile" />
                        <div className="user-details">
                            <div className="username">{selectedUser?.username}</div>
                            <div className={`status ${selectedUser?.isOnline ? 'Online' : 'Offline'}`}>{selectedUser?.isOnline ? 'Online' : 'Offline'}</div>
                        </div>
                    </div>
                </div>
                <div className="chat-box" ref={chatBoxRef}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.sender === currentUser._id ? 'my-message' : 'their-message'}`}
                        >
                            <div className="message-content">
                                <span className="message-text">{msg.text}</span>
                                <span className="message-timestamp">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="chat-input">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { // Handle Enter key press
                                e.preventDefault(); // Prevent default Enter key behavior
                                handleSend(); // Call the send function
                            }
                        }}
                    />
                    <button onClick={handleSend}><FaAngleUp /></button>
                </div>
            </div>
        </div>
    );
};

export default UserList;