import { useContext, useEffect, useState } from "react";
import Graph from "../components/Graph";
import UserPanel from "../components/UserPanel";
import FriendLinkPanel from "../components/FriendLinkPanel";
import RecommendationPanel from "../components/RecommendationPanel";
import HobbySidebar from "../components/HobbySidebar";
import Toast from "../components/Toast";
import Spinner from "../components/Spinner";
import { UserContext } from "../context/UserContext";

function Dashboard() {
    const { selectedUserId, selectUser, fetchUsers, loading } = useContext(UserContext);
    const [leftPanelTab, setLeftPanelTab] = useState("users");
    const [socialHubTab, setSocialHubTab] = useState("friends");

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    if (loading && selectedUserId === null) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spinner size="lg" text="Loading your dashboard..." />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            <Toast />

            <div className="flex-1 flex overflow-hidden gap-2 p-2 flex-col lg:flex-row">
                {/* Left Sidebar - Combined Panel */}
                <div className="w-full lg:w-96 bg-white shadow-lg border rounded-lg overflow-hidden flex flex-col order-2 lg:order-1">
                    {/* Tab Navigation */}
                    <div className="flex border-b bg-gray-50">
                        <button
                            onClick={() => setLeftPanelTab("create")}
                            className={`flex-1 px-2 sm:px-4 py-3 font-semibold text-xs sm:text-sm transition-all ${leftPanelTab === "create"
                                ? "bg-white text-slate-700 border-b-2 border-slate-600"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            ➕ Create
                        </button>
                        <button
                            onClick={() => setLeftPanelTab("users")}
                            className={`flex-1 px-2 sm:px-4 py-3 font-semibold text-xs sm:text-sm transition-all ${leftPanelTab === "users"
                                ? "bg-white text-slate-700 border-b-2 border-slate-600"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            👥 Users
                        </button>
                        <button
                            onClick={() => setLeftPanelTab("hobbies")}
                            className={`flex-1 px-2 sm:px-4 py-3 font-semibold text-xs sm:text-sm transition-all ${leftPanelTab === "hobbies"
                                ? "bg-white text-slate-700 border-b-2 border-slate-600"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            🎮 Hobbies
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto">
                        {leftPanelTab === "create" && (
                            <div className="p-4">
                                {/* <h2 className="text-lg font-bold mb-4">Create New User</h2> */}
                                <UserPanel
                                    onUserSelect={selectUser}
                                    onUserCreate={fetchUsers}
                                    showCreateForm={true}
                                    showUsersList={false}
                                />
                            </div>
                        )}

                        {leftPanelTab === "users" && (
                            <div className="p-2">
                                {/* <h2 className="text-lg font-bold mb-4">All Users</h2> */}
                                <UserPanel
                                    onUserSelect={selectUser}
                                    onUserCreate={fetchUsers}
                                    showCreateForm={false}
                                    showUsersList={true}
                                />
                            </div>
                        )}

                        {leftPanelTab === "hobbies" && (
                            <div className="p-4">
                                {/* <h2 className="text-lg font-bold mb-4">Hobbies</h2> */}
                                <HobbySidebar />
                            </div>
                        )}
                    </div>
                </div>

                {/* Center - Graph Visualization */}
                <div className="flex-1 bg-white shadow-lg border rounded-lg overflow-hidden flex flex-col order-3 lg:order-2 min-h-96">
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="text-lg font-bold">📊 Connection Graph</h2>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <Graph />
                    </div>
                </div>

                {/* Right Sidebar - Friend & Recommendation Management */}
                <div className="w-full lg:w-96 bg-white shadow-lg border rounded-lg overflow-y-auto flex flex-col order-1 lg:order-3">
                    <div className="p-4 border-b sticky top-0 bg-gray-50">
                        <h2 className="text-lg font-bold">💫 Social Hub</h2>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b bg-gray-50 px-4 pt-4">
                        <button
                            onClick={() => setSocialHubTab("friends")}
                            className={`flex-1 px-2 sm:px-4 py-2 font-semibold text-xs sm:text-sm transition-all ${socialHubTab === "friends"
                                ? "text-slate-700 border-b-2 border-slate-600"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            🤝 Friends
                        </button>
                        <button
                            onClick={() => setSocialHubTab("recommendations")}
                            className={`flex-1 px-2 sm:px-4 py-2 font-semibold text-xs sm:text-sm transition-all ${socialHubTab === "recommendations"
                                ? "text-slate-700 border-b-2 border-slate-600"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            ✨ Recommendations
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {socialHubTab === "friends" && (
                            <div className="p-4">
                                <FriendLinkPanel
                                    selectedUserId={selectedUserId}
                                    onLinkChange={fetchUsers}
                                />
                            </div>
                        )}

                        {socialHubTab === "recommendations" && (
                            <div className="p-4">
                                <RecommendationPanel
                                    selectedUserId={selectedUserId}
                                    onFeedbackSubmit={fetchUsers}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;