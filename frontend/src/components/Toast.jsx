import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const Toast = () => {
    const { toast } = useContext(UserContext);

    if (!toast) return null;

    const toastConfig = {
        success: {
            bg: 'bg-green-500',
            icon: '✓',
            border: 'border-l-4 border-green-600'
        },
        error: {
            bg: 'bg-red-500',
            icon: '✕',
            border: 'border-l-4 border-red-600'
        },
        info: {
            bg: 'bg-blue-500',
            icon: 'ℹ',
            border: 'border-l-4 border-blue-600'
        },
        warning: {
            bg: 'bg-yellow-500',
            icon: '⚠',
            border: 'border-l-4 border-yellow-600'
        }
    };

    const config = toastConfig[toast.type] || toastConfig.info;

    return (
        <div className={`fixed top-4 right-4 ${config.bg} text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-pulse z-50 ${config.border}`}>
            <span className="text-lg font-bold shrink-0">{config.icon}</span>
            <p className="font-medium">{toast.message}</p>
        </div>
    );
};

export default Toast;
