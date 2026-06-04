const Spinner = ({ size = 'md', fullScreen = false, text = null }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    const spinner = (
        <div className="flex items-center justify-center gap-3">
            <div className={`${sizeClasses[size]} border-blue-200 border-t-blue-500 rounded-full animate-spin`}></div>
            {text && <span className="text-gray-600 font-medium">{text}</span>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl">
                    {spinner}
                </div>
            </div>
        );
    }

    return spinner;
};

export default Spinner;
