import React, { useState, useEffect } from 'react';
import { profileUser } from './api';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { CgLogOff } from "react-icons/cg";
import io from 'socket.io-client';
import './Profile.css';
import { MdCircle } from "react-icons/md";

const socket = io(process.env.REACT_APP_BACKEND_PROD)
const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const user = await profileUser();
                console.log(user)
                if (user) {
                    setUser(user);
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

    const handleBack = () => {
        navigate("/")
    };

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        socket.emit('userOffline', user._id);
        navigate("/login");
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="user-list-container">
            <div className='user-list users-list'>
                <div className="user-profile">
                    <FaArrowLeft className="profile-back-icon" onClick={handleBack} />
                    <div className="user-info">
                    </div>
                    <button className="profile-logout-button" onClick={handleLogout}>
                        <CgLogOff />
                    </button>
                </div>
                <ul className="profile-page">
                    <li key={user?._id}>
                        <p className="status Online">
                            <MdCircle />
                        </p>
                        <img
                            src={user?.profilePic || 'default-avatar.png'}
                            alt="Profile"
                        />
                        <div className="profile-username">{user?.username}</div>
                        <div className="profile-bio">user's bio where he yaps about anything and everything. From the intricacies of quantum physics to the perfect recipe for grilled cheese, this person's mind is a never-ending kaleidoscope of thoughts and ideas. One moment they're pondering the existence of extraterrestrial life, the next they're debating the merits of different streaming services. With a vocabulary that could rival a dictionary and an enthusiasm that's borderline infectious, this individual is a walking, talking encyclopedia of random knowledge. Whether you're looking for intellectual stimulation or just a good laugh, this bio is your one-stop shop for all things absurd and fascinating. So buckle up and prepare to have your mind blown (or at least mildly entertained).user's bio where he yaps about anything and everything. From the intricacies of quantum physics to the perfect recipe for grilled cheese, this person's mind is a never-ending kaleidoscope of thoughts and ideas. One moment they're pondering the existence of extraterrestrial life, the next they're debating the merits of different streaming services. With a vocabulary that could rival a dictionary and an enthusiasm that's borderline infectious, this individual is a walking, talking encyclopedia of random knowledge. Whether you're looking for intellectual stimulation or just a good laugh, this bio is your one-stop shop for all things absurd and fascinating. So buckle up and prepare to have your mind blown (or at least mildly entertained).</div>

                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Profile;