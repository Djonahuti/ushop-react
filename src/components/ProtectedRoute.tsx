// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { JSX } from "react"

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/admin-login" />
  }

  return children
}
