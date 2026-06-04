import { useContext, useEffect, useState, useCallback } from "react"
import { UserContext } from "../context/UserContext";
import { getRecommendations, submitRecommendationFeedback } from "../services/userApi";
import Spinner from "./Spinner";

const RecommendationPanel = ({ selectedUserId, onFeedbackSubmit }) => {
    const { showToast, triggerRefresh, updateUserHobbies, users } = useContext(UserContext);
    const [friendRecs, setFriendRecs] = useState([]);
    const [hobbyRecs, setHobbyRecs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("friends");
    const [feedbackLoading, setFeedbackLoading] = useState(null);
    const [hobbyAdding, setHobbyAdding] = useState(null);

    const loadRecommendations = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getRecommendations(selectedUserId);
            setFriendRecs(data.friendRecommendations || []);
            setHobbyRecs(data.hobbyRecommendations || []);
        } catch (error) {
            console.error("Error loading recommendations:", error);
            showToast("Failed to load recommendations", "error");
        } finally {
            setLoading(false);
        }
    }, [selectedUserId, showToast]);

    useEffect(() => {
        if (selectedUserId) {
            loadRecommendations();
        }
    }, [selectedUserId, loadRecommendations]);

    const handleFeedback = useCallback(async (targetUserId, accepted) => {
        setFeedbackLoading(targetUserId);
        try {
            await submitRecommendationFeedback(selectedUserId, targetUserId, accepted);
            showToast(
                accepted ? "Recommendation accepted! New friend added 🎉" : "Recommendation rejected!",
                "success"
            );

            // Reload recommendations after feedback
            await new Promise(resolve => setTimeout(resolve, 500));
            await loadRecommendations();

            // Trigger refresh to update FriendLinkPanel when recommendation is accepted
            if (accepted) {
                triggerRefresh();
            }

            onFeedbackSubmit && onFeedbackSubmit();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            showToast(errorMsg, "error");
            console.error("Error submitting feedback:", error);
        } finally {
            setFeedbackLoading(null);
        }
    }, [selectedUserId, showToast, loadRecommendations, onFeedbackSubmit, triggerRefresh]);

    const handleAddHobby = useCallback(async (hobby) => {
        setHobbyAdding(hobby);
        try {
            const user = users.find(u => u._id === selectedUserId);
            if (!user) {
                showToast("User not found", "error");
                return;
            }

            const currentHobbies = user.hobbies || [];
            if (currentHobbies.includes(hobby)) {
                showToast("Hobby already added", "info");
                setHobbyAdding(null);
                return;
            }

            const updatedHobbies = [...currentHobbies, hobby];
            await updateUserHobbies(selectedUserId, updatedHobbies);
            showToast(`Added '${hobby}' successfully! ✨`, "success");

            // Reload recommendations and trigger refresh
            await new Promise(resolve => setTimeout(resolve, 300));
            await loadRecommendations();
            triggerRefresh();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            showToast(errorMsg, "error");
            console.error("Error adding hobby:", error);
        } finally {
            setHobbyAdding(null);
        }
    }, [selectedUserId, users, updateUserHobbies, showToast, loadRecommendations, triggerRefresh]);

    if (!selectedUserId) {
        return (
            <div className="p-5 border rounded-lg bg-gray-50">
                <p className="text-gray-600 text-sm">Select a user to view recommendations</p>
            </div>
        );
    }

    return (
        <div className="p-5 border rounded-lg bg-white shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">💡 Recommendations</h3>
                    <p className="text-xs text-gray-500 mt-1">Personalized suggestions for you</p>
                </div>
                <button
                    onClick={loadRecommendations}
                    disabled={loading}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded text-sm font-medium transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                    aria-label="Refresh recommendations"
                    title="Refresh recommendations"
                >
                    {loading ? (
                        <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Refreshing...
                        </>
                    ) : (
                        <>🔄 Refresh</>
                    )}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Spinner size="md" text="Loading recommendations..." />
                </div>
            ) : (
                <div>
                    <div className="flex gap-1 mb-4 border-b border-gray-200 bg-gray-50 -mx-5 px-5 py-0 rounded-t-lg">
                        <button
                            onClick={() => setActiveTab("friends")}
                            className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === "friends"
                                ? "border-slate-600 text-slate-700 bg-white"
                                : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                                }`}
                            aria-pressed={activeTab === "friends"}
                            aria-label={`Friends recommendations (${friendRecs.length} items)`}
                        >
                            👤 Friends {friendRecs.length > 0 && <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs font-bold">{friendRecs.length}</span>}
                        </button>
                        <button
                            onClick={() => setActiveTab("hobbies")}
                            className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === "hobbies"
                                ? "border-slate-600 text-slate-700 bg-white"
                                : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                                }`}
                            aria-pressed={activeTab === "hobbies"}
                            aria-label={`Hobby recommendations (${hobbyRecs.length} items)`}
                        >
                            🎮 Hobbies {hobbyRecs.length > 0 && <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs font-bold">{hobbyRecs.length}</span>}
                        </button>
                    </div>

                    {activeTab === "friends" && (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {friendRecs.length === 0 ? (
                                <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-gray-800 font-semibold">👤 No friend recommendations yet</p>
                                    <p className="text-gray-600 text-sm mt-2">Link with more users or update your hobbies to get suggestions</p>
                                </div>
                            ) : (
                                friendRecs.map((rec) => (
                                    <div
                                        key={rec.userId}
                                        className="bg-linear-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-800 text-base">{rec.username}</h4>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">💭 {rec.reason}</p>
                                            </div>
                                            <span className="bg-linear-to-r from-slate-600 to-slate-700 text-white px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap ml-2 shadow-md">
                                                ⭐ {rec.score.toFixed(1)}
                                            </span>
                                        </div>
                                        {rec.sourceSignals && rec.sourceSignals.length > 0 && (
                                            <div className="mb-3 flex flex-wrap gap-2">
                                                {rec.sourceSignals.map((signal, idx) => (
                                                    <span key={idx} className="bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium">
                                                        🔗 {signal}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => handleFeedback(rec.userId, true)}
                                                disabled={feedbackLoading === rec.userId}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-1"
                                                aria-label={`Accept ${rec.username} as friend`}
                                            >
                                                {feedbackLoading === rec.userId ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Accepting...
                                                    </>
                                                ) : (
                                                    <>✓ Accept</>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleFeedback(rec.userId, false)}
                                                disabled={feedbackLoading === rec.userId}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-1"
                                                aria-label={`Reject ${rec.username} as friend`}
                                            >
                                                {feedbackLoading === rec.userId ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Rejecting...
                                                    </>
                                                ) : (
                                                    <>✗ Reject</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "hobbies" && (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {hobbyRecs.length === 0 ? (
                                <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-gray-800 font-semibold">🎮 No hobby recommendations yet</p>
                                    <p className="text-gray-600 text-sm mt-2">Connect with more friends to discover new hobbies you might enjoy</p>
                                </div>
                            ) : (
                                hobbyRecs.map((rec, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-linear-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                                                    🎯 {rec.hobby}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">💭 {rec.reason}</p>
                                            </div>
                                            <div className="flex gap-2 ml-2 shrink-0">
                                                <span className="bg-linear-to-r from-slate-600 to-slate-700 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                                                    ⭐ {rec.score.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                        {rec.sourceSignals && rec.sourceSignals.length > 0 && (
                                            <div className="mb-3 flex flex-wrap gap-2">
                                                {rec.sourceSignals.map((signal, idx) => (
                                                    <span key={idx} className="bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium">
                                                        📊 {signal}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleAddHobby(rec.hobby)}
                                            disabled={hobbyAdding === rec.hobby}
                                            className="w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-1"
                                            aria-label={`Add ${rec.hobby} to your hobbies`}
                                            title={`Add ${rec.hobby}`}
                                        >
                                            {hobbyAdding === rec.hobby ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Adding...
                                                </>
                                            ) : (
                                                <>+ Add "{rec.hobby}"</>
                                            )}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default RecommendationPanel;
