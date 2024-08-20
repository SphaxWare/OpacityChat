import React, { useEffect, useState, useRef } from 'react';
import { fetchUsers, profileUser, fetchMessages } from './api';
import io from 'socket.io-client';
import './UserList.css';
import { FaArrowLeft } from 'react-icons/fa';
import { FaAngleUp } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { CgLogOff } from "react-icons/cg";                                              
import { MdCircle } from "react-icons/md";



// Connect to the backend WebSocket server
console.log(process.env.REACT_APP_BACKEND_PROD)             
console.log(process.env.REACT_APP_API_PROD_URL)

const socket = io(process.env.REACT_APP_BACKEND_PROD)

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const chatBoxRef = useRef(null);

    // when user close tab he get deconnected
    useEffect(() => {
        const handleBeforeUnload = () => {
            socket.emit('userOffline', currentUser._id);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [currentUser])
    // when user leave app without closing tab
    useEffect(() => {
        const handleVisibilityChange = () => {
            let offlineTimer;
            if (document.hidden) {
                // make user offline if he's still not on the windows after 2 min
                offlineTimer = setTimeout(() => {
                    socket.emit('userOffline', currentUser._id);
                    console.log('User is offline due to inactivity for 5 minutes.', navigate.userAgent);
                },2 * 60 * 1000);
            } else {
                clearTimeout(offlineTimer);
                socket.emit('userOnline', currentUser._id);
            }
        };

        const handleBeforeUnload = () => {
            socket.emit('userOffline', currentUser._id);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [currentUser, navigate.userAgent]);

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
                console.log(usersData);
            } catch (error) {
                setError('Error fetching users');
                console.error('Error fetching users:', error);
            }
        };

        getUsers();
    }, []);

    // Function to convert ArrayBuffer to Base64
    const arrayBufferToBase64 = (buffer) => {
        const bytes = new Uint8Array(buffer);
        const len = bytes.length;
        let binaryString = '';
      
        const chunkSize = 1024;
        for (let i = 0; i < len; i += chunkSize) {
            const end = Math.min(i + chunkSize, len);
            const chunk = String.fromCharCode.apply(null, bytes.subarray(i, end));
            binaryString += chunk;
        }
      
        return window.btoa(binaryString);
    };

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const user = await profileUser();
                console.log(user)
                if (user) {
                    if (user.profilePic && user.profilePic.data) {
                        const base64String = arrayBufferToBase64(user.profilePic.data.data);
                        user.profilePic = `data:${user.profilePic.contentType};base64,${base64String}`;
                    }
                    setCurrentUser(user);
                } else {
                    navigate("/login")
                }
            } catch (error) {
                setError('Error fetching user');
                console.error('Error fetching user:', error);
                navigate("/login")
            }
        }

        getCurrentUser();
    }, [navigate]);

    useEffect(() => {
        // Listen for 'updateUserStatus' event to update user status in the client
        socket.on('updateUserStatus', ({ userId, isOnline }) => {
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === userId ? { ...user, isOnline } : user
                )
            );

            if (selectedUser && selectedUser._id === userId) {
                setSelectedUser((prevUser) => ({ ...prevUser, isOnline }));
            }
        });

        return () => {
            socket.off('updateUserStatus');
        };
    }, [selectedUser, users]);

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
                socket.emit('userOffline', currentUser._id);
                navigate('/login')
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
    
    const sendToProfile = () => {
        navigate('/profile')
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
        socket.emit('userOffline', currentUser._id);
        navigate("/login");
    };

    const handleSend = () => {
        if (newMessage.trim() && selectedUser) {
            const message = {
                sender: currentUser._id, // Sender ID
                recipient: selectedUser._id, // Recipient's ID
                text: newMessage, // Text of the message
                timestamp: new Date()
            };
            socket.emit('sendMessage', message);
            setNewMessage('');
        }
    };

    const formatDate = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString('en', options); // Default to MM/DD/YYYY
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
                        onClick={sendToProfile}
                    />
                    <div className="current-user-info">
                        <div className="current-username" onClick={sendToProfile}>{currentUser.username}</div>
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
                            <div className={`status ${user.isOnline ? 'Online' : 'Offline'}`}>
                                {user.isOnline ? <MdCircle /> : <MdCircle />}
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
                            <div className={`status ${selectedUser?.isOnline ? 'Online' : 'Offline'}`}>
                                {selectedUser?.isOnline ? 'Online' : 'Offline'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="chat-box" ref={chatBoxRef}>
                    {messages.map((msg, index) => {
                        const currentMessageDate = new Date(msg.timestamp).toDateString();
                        const previousMessageDate = index > 0 ? new Date(messages[index - 1].timestamp).toDateString() : null;

                        return (
                            <React.Fragment key={index}>
                                {currentMessageDate !== previousMessageDate && (
                                    <div className="date-divider">
                                        <span>{formatDate(new Date(msg.timestamp))}</span>
                                    </div>
                                )}
                                <div className={`message ${msg.sender === currentUser._id ? 'my-message' : 'their-message'}`}>
                                    <div className="message-content">
                                        <span className="message-text">{msg.text}</span>
                                        <span className="message-timestamp">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
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