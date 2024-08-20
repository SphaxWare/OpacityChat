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