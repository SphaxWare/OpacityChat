import React, { useEffect, useState } from 'react';
import { fetchUsers, profileUser, fetchMessages } from './api';
import io from 'socket.io-client';
import './UserList.css';
import { FaArrowLeft } from 'react-icons/fa';
import { FaAngleUp } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

// Connect to the backend WebSocket server
const socket = io('http://localhost:5000');

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();


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
        if (selectedUser) {
            socket.emit('joinRoom', selectedUser._id);

            socket.on('message', (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            });

            return () => {
                socket.emit('leaveRoom');
                socket.off('message');
            };
        }
    }, [selectedUser]);

    // Fetch previous messages when a user is selected
    useEffect(() => {
        const getCurrentUserAndMessages = async () => {
            try {
                const user = await profileUser();
                setCurrentUser(user);
    
                if (selectedUser) {
                    const messagesData = await fetchMessages(selectedUser._id, user._id);
                    setMessages(messagesData);
                }
            } catch (error) {
                setError('Error getting user or messages');
                console.error('Error:', error);
                navigate("/login");
            }
        };
    
        getCurrentUserAndMessages();
    }, [selectedUser, navigate]);
    

    if (error) {
        return <div>{error}</div>;
    }

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    const handleBack = () => {
        setSelectedUser(null);
        setMessages([]);
    };

    const handleSend = () => {
        if (newMessage.trim() && selectedUser) {
            const message = {
                sender: currentUser._id, // Sender ID
                recipient: selectedUser._id, // Recipient's ID
                text: newMessage, // Text of the message
                timestamp: new Date(), // Optional field; not used by server
            };
            socket.emit('sendMessage', message);
            setNewMessage('');
        }
    };

    return (
        <div className={`user-list-container ${selectedUser ? 'flipped' : ''}`}>
            <div className="user-list">
                <h2>Available Users to Chat</h2>
                <ul>
                    {users.map(user => (
                        <li key={user._id} onClick={() => handleUserClick(user)}>
                            {user.username} - {user.email}
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
                            <div className="status">{selectedUser?.isOnline ? 'Online' : 'Offline'}</div>
                        </div>
                    </div>
                </div>
                <div className="chat-box">
                    {messages.map((msg, index) => (
                        <div key={index} className="message">
                            <span className="message-text">{msg.text}</span>
                            <span className="message-timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </div>
                <div className="chat-input">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button onClick={handleSend}><FaAngleUp /></button>
                </div>
            </div>
        </div>
    );
};

export default UserList;