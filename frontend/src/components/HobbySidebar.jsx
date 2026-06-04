import { useContext, useMemo, useState } from "react";
import { UserContext } from "../context/UserContext";

const HobbySidebar = () => {
    const { users } = useContext(UserContext);
    const [searchHobby, setSearchHobby] = useState("");
    const [draggedHobby, setDraggedHobby] = useState(null);

    // Get all unique hobbies from all users
    const allHobbies = useMemo(() => {
        const hobbiesSet = new Set();
        users.forEach(user => {
            if (user.hobbies && Array.isArray(user.hobbies)) {
                user.hobbies.forEach(hobby => hobbiesSet.add(hobby));
            }
        });
        return Array.from(hobbiesSet).sort();
    }, [users]);

    // Filter hobbies based on search
    const filteredHobbies = useMemo(() => {
        return allHobbies.filter(hobby =>
            hobby.toLowerCase().includes(searchHobby.toLowerCase())
        );
    }, [allHobbies, searchHobby]);

    // Calculate hobby statistics
    const hobbyStats = useMemo(() => {
        const stats = {};
        allHobbies.forEach(hobby => {
            stats[hobby] = users.filter(u => u.hobbies?.includes(hobby)).length;
        });
        return stats;
    }, [allHobbies, users]);

    const handleDragStart = (e, hobby) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('hobby', hobby);
        e.dataTransfer.setData('nodeId', '');
        setDraggedHobby(hobby);
    };

    const handleDragEnd = () => {
        setDraggedHobby(null);
    };

    return (
        <div className="p-3 sm:p-5 border-r border-gray-200 bg-linear-to-b from-gray-50 to-white flex flex-col h-full">
            <div className="mb-4">
                <h3 className="text-base sm:text-lg font-bold text-center text-gray-800 mb-1">🎮 Hobbies 
                    <span className="text text-gray-900"> ({allHobbies.length})</span>
                </h3>
                
            </div>

            {/* Search Input */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search hobbies..."
                    value={searchHobby}
                    onChange={(e) => setSearchHobby(e.target.value)}
                    className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-xs sm:text-sm"
                />
                {searchHobby && (
                    <p className="text-xs text-gray-500 mt-1">
                        Found {filteredHobbies.length} hobby{filteredHobbies.length !== 1 ? 'ies' : ''}
                    </p>
                )}
            </div>

            {/* Hobbies List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {filteredHobbies.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                        <p className="text-gray-500 text-xs sm:text-sm">
                            {searchHobby ? "No hobbies match your search" : "No hobbies available"}
                        </p>
                    </div>
                ) : (
                    filteredHobbies.map((hobby) => (
                        <div
                            key={hobby}
                            draggable
                            onDragStart={(e) => handleDragStart(e, hobby)}
                            onDragEnd={handleDragEnd}
                            className={`p-2 sm:p-3 bg-white border-2 rounded-lg cursor-move transition-all ${draggedHobby === hobby
                                ? 'border-slate-500 bg-gray-100 shadow-lg scale-105'
                                : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{hobby}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                        {hobbyStats[hobby]} {hobbyStats[hobby] === 1 ? 'person' : 'people'}
                                    </p>
                                </div>
                                <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full whitespace-nowrap shrink-0">
                                    {hobbyStats[hobby]}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Drag Hint */}
            <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-100 rounded-lg p-2 sm:p-3">
                <p className="text-xs text-gray-700 font-medium mb-1">💡 How to use:</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                    Drag a hobby onto any user node in the graph to add it.
                </p>
            </div>
        </div>
    );
};

export default HobbySidebar;
