import {useState} from "react";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "https://pet-dispatch-deploy-production.up.railway.app";

export function useAuth() {
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem("token")
    );

    async function login(username: string, password: string) {

        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password}),
        });

        if (!response.ok) {
            throw new Error("Login failed");
        }
        const data = await response.json();

        // Save token in localStorage
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
    }

    function logout() {
        localStorage.removeItem("token");
        setToken(null);
    }

    function isAuthenticated() {
        return !!token;
    }

    return {token, login, logout, isAuthenticated};
}
