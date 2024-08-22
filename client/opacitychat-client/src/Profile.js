import React, { useState, useEffect } from 'react';
import { profileUser, updateProfile } from './api';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { CgLogOff } from "react-icons/cg";
import io from 'socket.io-client';
import './Profile.css';
import Loading from './loading.js';


const socket = io(process.env.REACT_APP_BACKEND_PROD)
const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profilePic, setProfilePic] = useState('default-avatar.png');
    const [error, setError] = useState(null);
    // for editing profile
    const [isEditing, setIsEditing] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [editedBio, setEditedBio] = useState('');
    const [newProfilePic, setNewProfilePic] = useState(null);

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setEditedUsername(user?.username || '');
            setEditedBio(user?.bio || '');
        }
    };

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
                    setUser(user);
                    if (user.profilePic && user.profilePic.data) {
                        loadProfilePicture(user.profilePic.data.data, user.profilePic.contentType);
                    }
                } else {
                    navigate("/login")
                }
            } catch (error) {
                setError('Error fetching user');
                console.error('Error fetching user:', error);
                navigate("/login")
            }
        };

        const loadProfilePicture = async (data, contentType) => {
            const base64String = await arrayBufferToBase64(data);
            setProfilePic(`data:${contentType};base64,${base64String}`);
        };

        getCurrentUser();
    }, [navigate]);



    const handleBack = () => {
        navigate("/")
    };

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        socket.emit('userOffline', user._id);
        navigate("/login");
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProfilePic(file);
        }
    };

    const handleSave = async () => {
        try {
            console.log("editedUsername:", editedUsername);
            console.log("editedBio:", editedBio);
            console.log("newProfilePic:", newProfilePic);
        
            const userData = {
              username: editedUsername,
              bio: editedBio,
              profilePic: newProfilePic
            };
        
            await updateProfile(userData);
        
            // Update local state
            setUser(prevUser => ({
              ...prevUser,
              username: editedUsername,
              bio: editedBio,
            }));
            setProfilePic(newProfilePic ? URL.createObjectURL(newProfilePic) : profilePic);
            setIsEditing(false);
        } catch (error) {
            setError('Error saving profile');
            console.error('Error saving profile:', error);
        }
    };
    

    if (error) {
        return <div>{error}</div>;
    }
    if (user === null) {
        return (
            <Loading />
        );
    }
    return (
    <div className="user-list-container">
        <div className='user-list users-list'>
            <div className="user-profile">
                <FaArrowLeft className="profile-back-icon" onClick={handleBack} />
                <div className="profile">
                    Profile
                </div>
                <button className="profile-logout-button" onClick={handleLogout}>
                    <CgLogOff />
                </button>
            </div>
            <ul className="profile-page">
                <li key={user?._id}>
                    <img
                        src={profilePic || 'default-avatar.png'}
                        alt="Profile"
                    />
                    {isEditing ? (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                        />
                    ) : null}
                    <div className="profile-username">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedUsername}
                                onChange={(e) => setEditedUsername(e.target.value)}
                            />
                        ) : (
                            user?.username
                        )}
                    </div>
                </li>
                <li>
                    <div className="profile-bio">
                        <div className='Bio-title'>Bio:</div>
                        {isEditing ? (
                            <textarea
                                value={editedBio}
                                onChange={(e) => setEditedBio(e.target.value)}
                            />
                        ) : (
                            user?.bio || 'Bio not available'
                        )}
                    </div>
                </li>
            </ul>
            <div className="profile-edit-buttons">
                {isEditing ? (
                    <button onClick={handleSave}>Save</button>
                ) : (
                    <button onClick={toggleEditMode}>Edit Profile</button>
                )}
                {isEditing ? (
                    <button onClick={toggleEditMode}>Cancel</button>
                ) : null}
            </div>
        </div>
    </div>
);

};

export default Profile;