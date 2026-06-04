import { createContext, useState, useCallback } from 'react';
import {
    getUsers,
    getRecommendations,
    submitRecommendationFeedback,
    linkFriend,
    unlinkFriend,
    updateUser
} from '../services/userApi';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [recommendations, setRecommendations] = useState({
        friendRecommendations: [],
        hobbyRecommendations: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [toast, setToast] = useState(null);

    const refreshGraph = useCallback(() => {
        setRefreshKey(prev => prev + 1)
    }, []);

    const triggerRefresh  = () => {
        setRefreshKey(prev => prev +1)
    }

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRecommendations = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const data = await getRecommendations(userId);
            setRecommendations(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            setRecommendations({
                friendRecommendations: [],
                hobbyRecommendations: []
            });
        }
    }, []);

    const selectUser = useCallback((userId) => {
        setSelectedUserId(userId);
        if (userId) {
            fetchRecommendations(userId);
        }
    }, [fetchRecommendations]);

    const submitFeedback = useCallback(async (targetUserId, accepted) => {
        if (!selectedUserId) return;
        try {
            await submitRecommendationFeedback(selectedUserId, targetUserId, accepted);
            // Refresh recommendations after feedback
            await fetchRecommendations(selectedUserId);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            console.error('Error submitting feedback:', err);
        }
    }, [selectedUserId, fetchRecommendations]);

    const addFriendship = useCallback(async (userId, friendId) => {
        try {
            await linkFriend(userId, friendId);
            showToast('Friendship created successfully!', 'success');
            await fetchUsers();
            refreshGraph();
            setError(null);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            showToast(errorMsg, 'error');
            setError(errorMsg);
            console.error('Error creating friendship:', err);
        }
    }, [fetchUsers, refreshGraph, showToast]);

    const removeFriendship = useCallback(async (userId, friendId) => {
        try {
            await unlinkFriend(userId, friendId);
            showToast('Friendship removed successfully!', 'success');
            await fetchUsers();
            refreshGraph();
            setError(null);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            showToast(errorMsg, 'error');
            setError(errorMsg);
            console.error('Error removing friendship:', err);
        }
    }, [fetchUsers, refreshGraph, showToast]);

    const updateUserHobbies = useCallback(async (userId, hobbies) => {
        try {
            await updateUser(userId, { hobbies });
            showToast('Hobbies updated successfully!', 'success');
            await fetchUsers();
            refreshGraph();
            setError(null);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            showToast(errorMsg, 'error');
            setError(errorMsg);
            console.error('Error updating hobbies:', err);
        }
    }, [fetchUsers, refreshGraph, showToast]);

    const value = {
        users,
        selectedUserId,
        recommendations,
        loading,
        error,
        toast,
        refreshKey,
        fetchUsers,
        fetchRecommendations,
        selectUser,
        submitFeedback,
        addFriendship,
        removeFriendship,
        updateUserHobbies,
        refreshGraph,
        triggerRefresh,
        showToast,
        setUsers
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

