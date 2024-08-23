import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_PROD_URL;

export const registerUser = async (userData) => {
  try {
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    if (userData.profilePic) {
      formData.append('profilePic', userData.profilePic);
    }

    const response = await axios.post(`${API_BASE_URL}/users/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

export const loginUser = async (userData) => {
  try {
    console.log('API_BASE_URL:', process.env.REACT_APP_API_PROD_URL);
    const response = await axios.post(`${API_BASE_URL}/users/login`, userData);
    const { token } = response.data;
    // set the token on client's local storage
    localStorage.setItem('jwtToken', token);
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

const getToken = () => {
  return localStorage.getItem('jwtToken');
};

export const profileUser = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("from profileUser", response.data)
    return response.data;
  } catch (error) {
    console.error('Error accessing profile:', error);
    throw error;
  }
};

// get all users
export const fetchUsers = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/users/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("from fetchUsers", response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// retrieve message history
export const fetchMessages = async (user1, user2) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/messages/history/${user1}/${user2}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}
// update profile info
export const updateProfile = async (userData) => {
  try {
    const token = getToken();

    // Prepare form data for the profile update
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('bio', userData.bio);
    if (userData.profilePic) {
      formData.append('profilePic', userData.profilePic);
    }
    console.log("updateProfile: ", userData)
    console.log("update: ", "here")
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    // Send the update request to the backend
    const response = await axios.put(`${API_BASE_URL}/users/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// get user's profile
// Fetch the profile of another user by their user ID
export const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/profile/${userId}`);
    console.log("130 api.js", response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};