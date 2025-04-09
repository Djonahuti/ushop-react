import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage: string;
}

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data || []);
  };

  const handleDelete = async (id: string) => {
    await deleteUser(id);
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const columns: ColumnDef<User>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <span className={row.original.role === "admin" ? "text-red-500" : "text-blue-500"}>{row.original.role}</span>,
    },
    {
      accessorKey: "profileImage",
      header: "Profile Photo",
      cell: ({ row }) =>
        row.original.profileImage ? (
          <img src={row.original.profileImage} alt={row.original.name} className="w-10 h-10 rounded-full border" />
        ) : (
          "No Image"
        ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button onClick={() => handleDelete(row.original.id)} variant="destructive">
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
      <DataTable columns={columns} data={users} />
    </div>
  );
};
