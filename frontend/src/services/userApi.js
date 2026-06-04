import axios from "axios";

const API_URL = "https://social-graph.onrender.com/api/users"

export const createUser = async (userData) => {
    const response = await axios.post(API_URL, userData);
    return response.data;
};

export const getUsers = async () => {
    const response = await axios.get(API_URL)
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
}

export const updateUser = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
}

export const linkFriend = async (id, friendId) => {
    const response = await axios.post(`${API_URL}/${id}/link`, { friendId });
    return response.data;
}

export const unlinkFriend = async (id, friendId) => {
    const response = await axios.delete(`${API_URL}/${id}/unlink`, { data: { friendId } });
    return response.data;
}

export const getRecommendations = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/recommendations`);
    return response.data;
}

export const submitRecommendationFeedback = async (id, targetUserId, accepted) => {
    const response = await axios.post(`${API_URL}/${id}/recommendations/feedback`, {
        targetUserId,
        accepted
    });
    return response.data;
}