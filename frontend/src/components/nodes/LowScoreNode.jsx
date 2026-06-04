import { useContext, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { UserContext } from "../../context/UserContext";

const LowScoreNode = ({ data, id }) => {
    const { selectedUserId, users, addFriendship } = useContext(UserContext);
    const [isAdding, setIsAdding] = useState(false);

    const user = users.find(u => u._id === id);
    const popularityScore = data?.popularityScore || 0;
    const sizeMultiplier = data?.sizeMultiplier || 1;
    const friendCount = user?.friends?.length || 0;
    const hobbies = user?.hobbies || [];

    // Calculate opacity based on popularity (0.6 to 1.0)
    const opacity = Math.max(0.6, Math.min(1.0, 0.6 + (popularityScore / 100) * 0.4));

    // Calculate sky blue color based on popularity score (light sky blue to darker sky blue)
    const scoreRatio = Math.min(popularityScore / 5, 1); // Normalize to 0-1 (since this is for scores ≤ 5)
    const r = Math.round(100 - scoreRatio * 80); // 100 to 20
    const g = Math.round(190 - scoreRatio * 40); // 190 to 150
    const b = Math.round(240 - scoreRatio * 60); // 240 to 180
    const bgColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;

    const handleAddFriend = async () => {
        if (!selectedUserId || selectedUserId === id) {
            alert("Please select another user first");
            return;
        }
        setIsAdding(true);
        try {
            await addFriendship(selectedUserId, id);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div
            className="text-white px-5 py-4 rounded-lg shadow-lg border-2 border-sky-700 min-w-48 transition-all duration-500 ease-in-out"
            style={{
                backgroundColor: bgColor,
                transform: `scale(${sizeMultiplier})`,
                minWidth: `${48 * sizeMultiplier}px`,
            }}
        >
            <Handle type="target" position={Position.Top} />
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                    <h3 className="font-semibold text-sm">{data?.username || 'User'}</h3>
                    <p className="text-xs">Age: {data?.age || 'N/A'}</p>
                </div>
                {/* <div className="text-right">
                    <p className="text-xs font-bold bg-white bg-opacity-20 px-2 py-1 rounded">
                        📊 {popularityScore.toFixed(1)}
                    </p>
                </div> */}
            </div>

            {/* Display popularity indicator */}
            {/* <div className="mt-2 text-xs">
                <div className="flex items-center gap-1">
                    <span className="text-xs">Popularity:</span>
                    <div className="flex-1 h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-300 rounded-full"
                            style={{ width: `${Math.min(100, (popularityScore / 50) * 100)}%` }}
                        />
                    </div>
                </div>
            </div> */}

            {/* {friendCount > 0 && (
                <p className="text-xs mt-1">👥 {friendCount} friends</p>
            )} */}

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

export default LowScoreNode;