import React from 'react';
import { useNavigate } from "react-router-dom";

export const RedirectToCondition: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className='w-full h-full flex flex-col justify-center items-center gap-y-4'>
            <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                onClick={() => navigate("/cond1")}
            >
                Condition 1
            </button>
            <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                onClick={() => navigate("/cond2")}
            >
                Condition 2
            </button>
            <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                onClick={() => navigate("/cond3")}
            >
                Condition 3
            </button>
        </div>
    )
};