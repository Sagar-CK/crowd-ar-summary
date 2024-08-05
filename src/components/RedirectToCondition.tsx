import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export const RedirectToCondition: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/cond1');
    });

    return null;
};