// src/components/ProtectedRoute.tsx
import React, {useEffect} from "react";
import {useLocation} from "wouter";
import {useAuth} from "@/hooks/use-auth.tsx";

interface ProtectedRouteProps {
    component: React.ComponentType;
}

export function ProtectedRoute({component: Component}: ProtectedRouteProps) {
    const {isAuthenticated} = useAuth();
    const [location, setLocation] = useLocation();

    useEffect(() => {
        if (!isAuthenticated()) {
            setLocation("/login");
        }
    }, [isAuthenticated, setLocation]);

    if (!isAuthenticated()) {
        return null;
    }

    return <Component/>;
}
