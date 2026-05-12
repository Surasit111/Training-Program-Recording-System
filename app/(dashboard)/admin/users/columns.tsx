// app/(dashboard)/admin/users/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Type ของข้อมูล User
export type UserData = {
  id: string
  name: string | null
  email: string
  role: string
  image: string | null
  phoneNumber: string | null
  createdAt: Date
  isFirstAdmin?: boolean
  isCurrentUser?: boolean
  isSuperAdmin?: boolean
  canEdit?: boolean
}

interface ActionsCellProps {
  user: UserData
  onEdit: (user: UserData) => void
  onDelete: (user: UserData) => void
}

const ActionsCell = ({ user, onEdit, onDelete }: ActionsCellProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
        {user.canEdit && (
          <DropdownMenuItem className="cursor-pointer" onClick={(e) => {
            e.stopPropagation()
            onEdit(user)
          }}>
            <Pencil className="mr-2 h-4 w-4" /> แก้ไขข้อมูล
          </DropdownMenuItem>
        )}
        {!user.isFirstAdmin && !user.isCurrentUser && user.canEdit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={(e) => {
              e.stopPropagation()
              onDelete(user)
            }}>
              <Trash2 className="mr-2 h-4 w-4" /> ลบผู้ใช้งาน
            </DropdownMenuItem>
          </>
        )}
        {!user.canEdit && (
          <DropdownMenuItem disabled className="text-muted-foreground text-xs italic">
            คุณไม่มีสิทธิ์จัดการผู้ใช้นี้
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const getColumns = (
  onEdit: (user: UserData) => void,
  onDelete: (user: UserData) => void
): ColumnDef<UserData>[] => [
    {
      accessorKey: "image",
      header: "",
      cell: ({ row }) => {
        const user = row.original
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        )
      }
    },
    {
      accessorKey: "name",
      header: "ชื่อ-นามสกุล",
    },
    {
      accessorKey: "email",
      header: "อีเมล",
    },
    {
      accessorKey: "phoneNumber",
      header: "เบอร์โทร",
      cell: ({ row }) => row.original.phoneNumber || "-",
    },
    {
      accessorKey: "role",
      header: "สิทธิ์",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge variant={role === "ADMIN" ? "destructive" : "secondary"}>
            {role}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "จัดการ",
      cell: ({ row }) => <ActionsCell user={row.original} onEdit={onEdit} onDelete={onDelete} />,
    },
  ]
