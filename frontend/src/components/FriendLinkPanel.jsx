import { useContext, useEffect, useState } from "react"
import { getUsers, linkFriend, unlinkFriend } from "../services/userApi";
import { UserContext } from "../context/UserContext";

const FriendLinkPanel = ({ selectedUserId, onLinkChange }) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const { triggerRefresh, refreshKey } = useContext(UserContext)

    useEffect(() => {
        loadUsers();
    }, [selectedUserId, refreshKey]);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            console.log(data)
            setUsers(data);
            if (selectedUserId) {
                const user = data.find(u => u._id === selectedUserId);
                setSelectedUser(user);
            }
        } catch (error) {
            console.error("Error loading users:", error);
        }
    }

    const handleLinkFriend = async (friendId) => {
        setLoading(true);
        try {
            await linkFriend(selectedUserId, friendId);
            triggerRefresh()
            setMessage("Friendship created successfully!");
            await loadUsers();
            onLinkChange && onLinkChange();
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.message || error.message}`);
            setTimeout(() => setMessage(""), 3000);
        } finally {
            setLoading(false);
        }
    }

    const handleUnlinkFriend = async (friendId) => {
        if (!window.confirm("Are you sure you want to remove this friendship?")) return;

        setLoading(true);
        try {
            await unlinkFriend(selectedUserId, friendId);
            triggerRefresh()
            setMessage("Friendship removed successfully!");
            await loadUsers();
            onLinkChange && onLinkChange();
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.message || error.message}`);
            setTimeout(() => setMessage(""), 3000);
        } finally {
            setLoading(false);
        }
    }

    if (!selectedUserId) {
        return (
            <div className="p-3 sm:p-5 border rounded-lg bg-gray-50 border-gray-200">
                <p className="text-gray-700 font-semibold">👤 Select a user from the list to manage friendships</p>
            </div>
        );
    }

    if (!selectedUser) {
        return (
            <div className="p-3 sm:p-5 border rounded-lg bg-gray-100">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    const friendIds = selectedUser.friends || [];
    const availableUsers = users.filter(u =>
        u._id !== selectedUserId && !friendIds.includes(u._id)
    );
    const friendList = users.filter(u => friendIds.includes(u._id));

    return (
        <div className="space-y-6">
            {/* User's Hobbies Section */}
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span>🎯</span>
                    <span>{selectedUser.username}'s Hobbies</span>
                </h4>
                {selectedUser.hobbies && selectedUser.hobbies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {selectedUser.hobbies.map((hobby, idx) => (
                            <span
                                key={idx}
                                className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                            >
                                🎮 {hobby}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 text-sm">No hobbies added yet</p>
                )}
            </div>

            {/* Friends Section */}
            <div className="p-3 sm:p-5 border rounded-lg">
                <h3 className="text-base sm:text-lg font-bold mb-4">Manage Friends: {selectedUser.username}</h3>

                {message && (
                    <div className="mb-3 p-3 bg-gray-200 text-gray-800 rounded-lg text-xs sm:text-sm">
                        {message}
                    </div>
                )}

                <div className="mb-5">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span>✅</span>
                        <span>Friends ({friendList.length})</span>
                    </h4>
                    {friendList.length === 0 ? (
                        <p className="text-gray-500 text-xs sm:text-sm">No friends yet</p>
                    ) : (
                        <div className="space-y-3">
                            {friendList.map(friend => (
                                <div key={friend._id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-800">{friend.username}</p>
                                            <p className="text-xs sm:text-sm text-gray-600">📅 Age: {friend.age}</p>
                                        </div>
                                        <button
                                            onClick={() => handleUnlinkFriend(friend._id)}
                                            disabled={loading}
                                            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs sm:text-sm font-semibold disabled:opacity-50 transition-colors"
                                        >
                                            ✕ Unlink
                                        </button>
                                    </div>
                                    {friend.hobbies && friend.hobbies.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {friend.hobbies.map((hobby, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium"
                                                >
                                                    {hobby}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span>➕</span>
                        <span>Available Users ({availableUsers.length})</span>
                    </h4>
                    {availableUsers.length === 0 ? (
                        <p className="text-gray-500 text-xs sm:text-sm">No available users to link</p>
                    ) : (
                        <div className="space-y-3">
                            {availableUsers.map(user => (
                                <div key={user._id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-800">{user.username}</p>
                                            <p className="text-xs sm:text-sm text-gray-600">📅 Age: {user.age}</p>
                                        </div>
                                        <button
                                            onClick={() => handleLinkFriend(user._id)}
                                            disabled={loading}
                                            className="w-full sm:w-auto bg-slate-500 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-xs sm:text-sm font-semibold disabled:opacity-50 transition-colors"
                                        >
                                            ✓ Link
                                        </button>
                                    </div>
                                    {user.hobbies && user.hobbies.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {user.hobbies.map((hobby, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium"
                                                >
                                                    {hobby}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FriendLinkPanel;
