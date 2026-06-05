import { useContext, useEffect, useState } from "react";
import Graph from "../components/Graph";
import UserPanel from "../components/UserPanel";
import FriendLinkPanel from "../components/FriendLinkPanel";
import RecommendationPanel from "../components/RecommendationPanel";
import HobbySidebar from "../components/HobbySidebar";
import Toast from "../components/Toast";
import Spinner from "../components/Spinner";
import { UserContext } from "../context/UserContext";
import MobileHobbyBar from "../components/MobileHobbyBar";

function Dashboard() {
    const { selectedUserId, selectUser, fetchUsers, loading } = useContext(UserContext);
    const [leftPanelTab, setLeftPanelTab] = useState("users");
    const [socialHubTab, setSocialHubTab] = useState("friends");
    const [mobileTab, setMobileTab] = useState("graph")
    const [showCreateUser, setShowCreateUser] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if(selectedUserId) {
            setMobileTab("social")
        }
    },[selectedUserId])

    if (loading && selectedUserId === null) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spinner size="lg" text="Loading your dashboard..." />
            </div>
        );
    }

    return (
    <>

            {/* For Mobile Screen */}
            <div className="lg:hidden h-dvh flex flex-col">
                <Toast />

                <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t flex">
                    <button onClick={() => setMobileTab("graph")}>📊</button>
                    <button onClick={() => setMobileTab("users")}>👥</button>
                    <button onClick={() => setMobileTab("social")}>💫</button>
                </div>

                <div className="flex-1 overflow-y-auto pb-16">
                    {mobileTab === "graph" && (
                        <div className="lg:hidden flex flex-col h-full">
                            <MobileHobbyBar />

                            <div className="flex-1">
                                <Graph />
                            </div>
                        </div>
                    )}

                    {mobileTab === "users" && (
                        <div className="p-2">
                            <UserPanel
                                onUserSelect={selectUser}
                                onUserCreate={fetchUsers}
                                showCreateForm={false}
                                showUsersList={true}
                            />
                        </div>
                    )}

                    {mobileTab === "social" && (
                        <div className="p-4">
                            <FriendLinkPanel
                                selectedUserId={selectedUserId}
                                onLinkChange={fetchUsers}
                            />
                        </div>
                    )}

                    {mobileTab === "recommendations" && (
                        <div className="p-2"><RecommendationPanel
                            selectedUserId={selectedUserId}
                            onFeedbackSubmit={fetchUsers}
                        />
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex h-16 shadow-lg">
                    <button
                        onClick={() => setMobileTab("graph")}
                        className={`flex-1 flex flex-col items-center justify-center ${mobileTab === "graph"
                            ? "text-blue-600 bg-gray-200 rounded-t-2xl p-2 transition-all duration-75"
                                : "text-gray-500"
                            }`}
                    >
                        <span>📊</span>
                        <span className="text-xs">Graph</span>
                    </button>

                    <button
                        onClick={() => setMobileTab("users")}
                        className={`flex-1 flex flex-col items-center justify-center ${mobileTab === "users"
                            ? "text-blue-600 bg-gray-200 rounded-t-2xl p-2 transition-all duration-75"
                                : "text-gray-500"
                            }`}
                    >
                        <span>👥</span>
                        <span className="text-xs">Users</span>
                    </button>

                    <button
                        onClick={() => setMobileTab("social")}
                        className={`flex-1 flex flex-col items-center justify-center ${mobileTab === "social"
                            ? "text-blue-600 bg-gray-200 rounded-t-2xl p-2 transition-all duration-75"
                                : "text-gray-500"
                            }`}
                    >
                        <span>💫</span>
                        <span className="text-xs">Social</span>
                    </button>

                    <button onClick={() => setMobileTab("recommendations")}
                        className={`flex-1 flex flex-col items-center justify-center ${mobileTab === "recommendations"
                            ? "text-blue-600 bg-gray-200 rounded-t-2xl p-2 transition-all duration-75"
                            : "text-gray-500"
                            }`}>
                        <span>✨</span>
                        <span className="text-xs">Recommends</span>
                    </button>

                    {/* Create User Button  */}
                    {mobileTab == "users" && <button
                        onClick={() => setShowCreateUser(true)}
                        className=" lg:hidden fixed bottom-20 right-4  focus:bg-blue-700 px-5 py-3 rounded-xl bg-blue-400 text-white text-lg shadow-xl">
                        + Create
                    </button>}
                    {showCreateUser && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                            <div className="bg-white w-full rounded-t-3xl p-4 max-h-[90vh] overflow-y-auto">
                                <UserPanel
                                    onUserSelect={selectUser}
                                    onUserCreate={fetchUsers}
                                    showCreateForm={true}
                                    showUsersList={false}
                                />

                                <button
                                    onClick={() => setShowCreateUser(false)}
                                    className="mt-4 w-full border rounded-lg p-3"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>



                            {/* For Large Screen  */}
        <div className="h-screen hidden lg:flex flex-col overflow-y-auto">
            <Toast />

                <div className="flex-1 flex overflow-hidden gap-2 p-2 flex-col lg:flex-row">
                {/* Left Sidebar - Combined Panel */}
                <div className="w-full lg:w-96 bg-white shadow-lg border rounded-lg overflow-hidden flex flex-col order-3 lg:order-1">
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
                <div className="flex-1 bg-white shadow-lg border rounded-lg overflow-hidden flex flex-col order-1 lg:order-2 min-h-96">
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="text-lg font-bold">📊 Connection Graph</h2>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <Graph />
                    </div>
                </div>

                {/* Right Sidebar - Friend & Recommendation Management */}
                <div className="w-full lg:w-96 bg-white shadow-lg border rounded-lg overflow-y-auto flex flex-col order-2 lg:order-3">
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
    </>
    );
}

export default Dashboard;