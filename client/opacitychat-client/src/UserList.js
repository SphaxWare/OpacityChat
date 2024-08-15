import React, { useEffect, useState } from 'react';
import { fetchUsers } from './api';
import './UserList.css';
import { FaArrowLeft } from 'react-icons/fa';
import { FaAngleUp } from "react-icons/fa6";



const UserList = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);

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

    if (error) {
        return <div>{error}</div>;
    }

    const handleUserClick = (user) => {
        setSelectedUser(user); // Set the selected user and show chat interface
    };

    const handleBack = () => {
        setSelectedUser(null); // Go back to the user list
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
                    {/* Chat messages will be displayed here */}
                </div>
                <div className="chat-input">
                    <input type="text" placeholder="Type a message..." />
                    <button><FaAngleUp />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserList;