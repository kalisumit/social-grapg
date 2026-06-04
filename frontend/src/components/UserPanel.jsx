import { useEffect, useState, useContext } from "react"
import { createUser, getUsers, deleteUser, updateUser } from "../services/userApi";
import { UserContext } from "../context/UserContext";
import Spinner from "./Spinner";

const UserPanel = ({ onUserSelect, onUserCreate, showCreateForm = true, showUsersList = true }) => {
    const [username, setUsername] = useState("")
    const [age, setAge] = useState("")
    const [hobbies, setHobbies] = useState("");
    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isDeletingId, setIsDeletingId] = useState(null);

    const { triggerRefresh, refreshKey, showToast } = useContext(UserContext)

    const loadUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const data = await getUsers();
            setUsers(data)
        } catch (error) {
            console.error("Error loading users:", error);
            showToast("Failed to load users", "error");
        } finally {
            setIsLoadingUsers(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, [refreshKey]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !age || !hobbies) {
            showToast("All fields are required!", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateUser(editingId, {
                    username,
                    age: Number(age),
                    hobbies: hobbies.split(",").map(h => h.trim())
                });
                showToast("User updated successfully!", "success");
                setEditingId(null);
            } else {
                await createUser({
                    username,
                    age: Number(age),
                    hobbies: hobbies.split(",").map(h => h.trim())
                });
                showToast("User created successfully!", "success");
                onUserCreate?.()
            }

            await loadUsers();
            setUsername("");
            setAge("");
            setHobbies("");
            onUserCreate?.();
            triggerRefresh();
        } catch (error) {
            showToast(`Error: ${error.response?.data?.message || error.message}`, "error");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleEdit = (user) => {
        setEditingId(user._id);
        setUsername(user.username);
        setAge(user.age);
        setHobbies(user.hobbies.join(", "));
        triggerRefresh();
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        setIsDeletingId(id);
        try {
            await deleteUser(id);
            showToast("User deleted successfully!", "success");
            await loadUsers();
            onUserCreate?.();
            triggerRefresh();
        } catch (error) {
            showToast(`Error: ${error.response?.data?.message || error.message}`, "error");
        } finally {
            setIsDeletingId(null);
        }
    }

    const handleCancel = () => {
        setEditingId(null);
        setUsername("");
        setAge("");
        setHobbies("");
    }

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return user.username.toLowerCase().includes(query);
    });

    return (
        <div className="p-1 sm:p-5">
            {/* Create/Edit Form - Show when creating OR when editing */}
            {(showCreateForm || editingId) && (
                <>
                    <h2 className="text-lg sm:text-xl text-center font-bold mb-4 sm:mb-5">
                        {editingId ? "✏️ Edit User" : "➕ Create New User"}
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Username</label>
                            <input
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Age</label>
                            <input
                                type="number"
                                placeholder="Enter age"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Hobbies (comma-separated)</label>
                            <input
                                type="text"
                                placeholder="Coding, Cricket, Reading"
                                value={hobbies}
                                onChange={(e) => setHobbies(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-slate-600 text-white rounded-lg p-2.5 sm:p-3 hover:bg-slate-700 font-semibold transition-colors text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    editingId ? "✓ Update User" : "✓ Create User"
                                )}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-gray-400 text-white rounded-lg p-2.5 sm:p-3 hover:bg-gray-500 font-semibold transition-colors text-sm sm:text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    ✕ Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </>
            )}

            {/* Users List - Hide when editing */}
            {showUsersList && !editingId && (
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">
                        👥 All Users ({filteredUsers.length})
                    </h2>

                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isLoadingUsers}
                            className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>

                    {isLoadingUsers ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="md" text="Loading users..." />
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-3">
                            {users.length === 0 ? (
                                <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <p className="text-gray-600 font-semibold">No users yet</p>
                                    <p className="text-gray-500 text-sm">Create your first user to get started</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <p className="text-gray-600 font-semibold">No users found</p>
                                    <p className="text-gray-500 text-sm">Try a different search term</p>
                                </div>
                            ) : (
                                filteredUsers.map(user => (
                                    <div
                                        key={user._id}
                                        className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all opacity-100"
                                        onClick={() => !isDeletingId && onUserSelect && onUserSelect(user._id)}
                                    >
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-base sm:text-lg text-gray-800">
                                                {user.username}
                                            </h3>
                                            <span className="bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap">
                                                ⭐ {user.popularityScore?.toFixed(1) || 0}
                                            </span>
                                        </div>

                                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                            📅 Age: {user.age} | 🤝 Friends: {user.friends?.length || 0}
                                        </p>

                                        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                                            🎮 Hobbies: {user.hobbies?.join(", ") || "None"}
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(user);
                                                }}
                                                disabled={isDeletingId === user._id}
                                                className="flex-1 bg-slate-500 hover:bg-slate-600 text-white px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                ✏️ Edit
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(user._id);
                                                }}
                                                disabled={isDeletingId !== null}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                            >
                                                {isDeletingId === user._id ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>🗑️ Delete</>
                                                )}
                                            </button>
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default UserPanel;