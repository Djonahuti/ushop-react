import { useAuth } from "@/context/AuthContext"

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      {user ? (
        <h1>Welcome {user.email}</h1>
      ) : (
        <p>Please login</p>
      )}
    </div>
  )
}
