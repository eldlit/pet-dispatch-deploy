// src/pages/Login.tsx
import React, { useState } from "react"
import { useLocation } from "wouter"
import { useAuth } from "@/hooks/use-auth.tsx"

/** A simple, centered login page with minimal styling. */
export default function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const { login, isAuthenticated } = useAuth()
    const [location, setLocation] = useLocation()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        try {
            await login(username, password)
            // If successful, go to homepage or any protected page
            setLocation("/")
        } catch (err) {
            setError("Invalid credentials or server error")
        }
    }

    // If already logged in, redirect
    if (isAuthenticated()) {
        setLocation("/")
        return null
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            {/* Card Container */}
            <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
                <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="username" className="block font-medium mb-1">
                            Username
                        </label>
                        <input
                            id="username"
                            className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="off"
                            placeholder="Your username"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block font-medium mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            className="border border-gray-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded p-2 font-semibold"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    )
}
