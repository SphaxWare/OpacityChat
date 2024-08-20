import React from 'react';
import './loading.css';
import { dotWave } from 'ldrs'
import { FaArrowLeft } from 'react-icons/fa';
import { CgLogOff } from "react-icons/cg";

dotWave.register()

const Loading = () => {


    return (
        <div className="user-list-container">
                <div className='user-list users-list'>
                    <div className="user-profile">
                        <FaArrowLeft className="profile-back-icon"/>
                        <button className="profile-logout-button">
                            <CgLogOff />
                        </button>
                    </div>
                    <ul className="loading-page">
                        <div className="loading">
                            <l-dot-wave
                                size="99"
                                speed="0.5"
                                color="red"
                            ></l-dot-wave>
                        </div>
                    </ul>
                </div>
            </div>  
    );
};

export default Loading;




