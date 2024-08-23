import React, { useState, useEffect } from 'react';
import { getUserProfile } from './api';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './Profile.css';
import Loading from './loading.js';
import { CgLogOut } from 'react-icons/cg';

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profilePic, setProfilePic] = useState('/default-avatar.png');
    const [error, setError] = useState(null);
    const { userId } = useParams();

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
        console.log("user in UserProfile.js", userId)

        const loadProfilePicture = async (data, contentType) => {
            if (data && contentType) {
                const base64String = await arrayBufferToBase64(data);
                setProfilePic(`data:${contentType};base64,${base64String}`);
            } else {
                setProfilePic('/default-avatar.png');
            }
        };

        const fetchUser = async () => {
            try {
                const user = await getUserProfile(userId);
                console.log("UsersProfile.js ==", user)
                if (user) {
                    setUser(user);
                    if (user.profilePic && user.profilePic.data) {
                        loadProfilePicture(user.profilePic.data.data, user.profilePic.contentType);
                    }
                } else {
                    console.log("UsersProfile.js ==", user)
                }
            } catch (error) {
                setError('Error fetching user');
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, [navigate, userId]);


    const handleBack = () => {
        navigate("/users");
    };

    if (error) {
        return <div>{error}</div>;
    }
    if (user === null) {
        return <Loading />;
    }

    return (
        <div className="user-list-container">
            <div className='user-list users-list'>
                <div className="user-profile">
                    <FaArrowLeft className="profile-back-icon" onClick={handleBack} />
                    <div className="profile">
                        Profile
                    </div>
                    <button className="logout-button" style={{ opacity: 0 }}>
                        <CgLogOut />
                    </button>
                </div>
                <ul className="profile-page">
                    <li key={user?._id}>
                        <div className="profile-pic-container">
                            <img src={profilePic || '/default-avatar.png'} alt='profile pic' />
                        </div>
                    </li>
                    <li>
                        <div className="profile-username">
                            {user?.username}
                        </div>
                        <div className="profile-bio">
                            {user?.bio || 'Bio not available'}
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default UserProfile;
