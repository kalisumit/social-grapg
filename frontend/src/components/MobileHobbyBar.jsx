// MobileHobbyBar.jsx
import { useContext, useMemo, useState } from "react";
import { UserContext } from "../context/UserContext";

export default function MobileHobbyBar() {
    const { users } = useContext(UserContext);
    const [draggedHobby, setDraggedHobby] = useState(null);

    const hobbies = useMemo(() => {
        const set = new Set();

        users.forEach(user => {
            user.hobbies?.forEach(hobby => set.add(hobby));
        });

        return [...set].sort();
    }, [users]);

    const handleDragStart = (e, hobby) => {
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("hobby", hobby);
        e.dataTransfer.setData("nodeId", "");
        setDraggedHobby(hobby);
    };

    return (
        <div className="lg:hidden bg-white border-b p-2">
            <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">
                Hobbies🧑‍🦱
            </h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {hobbies.map(hobby => (
                    <div
                        key={hobby}
                        draggable
                        onDragStart={(e) => handleDragStart(e, hobby)}
                        onDragEnd={() => setDraggedHobby(null)}
                        className={` shrink-0 px-4 py-2 rounded-full border bg-slate-50 text-sm font-medium cursor-move
                            ${draggedHobby === hobby
                                ? "border-slate-500 bg-slate-100"
                                : "border-gray-300"
                            }
                        `}
                    >
                        {hobby}
                    </div>
                ))}
            </div>
        </div>
    );
}