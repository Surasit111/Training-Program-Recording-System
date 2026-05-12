"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, Mail, Phone, Calendar } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { DataTable } from "@/app/(dashboard)/projects/data-table"
import { getColumns, UserData } from "./columns"
import { EditUserDialog, DeleteUserDialog } from "./user-dialogs"

interface UsersClientProps {
    data: UserData[]
}

export default function UsersClient({ data }: UsersClientProps) {
    const [editingUser, setEditingUser] = useState<UserData | null>(null)
    const [deletingUser, setDeletingUser] = useState<UserData | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    // Handlers
    const handleEdit = (user: UserData) => {
        setEditingUser(user)
        setEditOpen(true)
    }

    const handleDelete = (user: UserData) => {
        setDeletingUser(user)
        setDeleteOpen(true)
    }

    const handleRowClick = (user: UserData) => {
        handleEdit(user)
    }

    // Generate columns with callbacks
    const columns = getColumns(handleEdit, handleDelete)

    return (
        <div className="space-y-4">
            {/* Desktop View: Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 p-2 md:p-4">
                <DataTable
                    columns={columns}
                    data={data}
                    onRowClick={handleRowClick}
                />
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
                {data.map((user) => (
                    <Card key={user.id} className="overflow-hidden border-none shadow-md shadow-slate-200/50 rounded-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarImage src={user.image || ""} />
                                        <AvatarFallback className="bg-primary/5 text-primary">
                                            {user.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-slate-800 truncate">{user.name || "ไม่ระบุชื่อ"}</span>
                                        <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"} className="w-fit text-[10px] h-5 px-2">
                                            {user.role}
                                        </Badge>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                                            <Pencil className="mr-2 h-4 w-4" /> แก้ไขข้อมูล
                                        </DropdownMenuItem>
                                        {!user.isFirstAdmin && !user.isCurrentUser && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> ลบผู้ใช้งาน
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-2">
                                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-xl">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                {user.phoneNumber && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-xl">
                                        <Phone className="h-3.5 w-3.5 shrink-0" />
                                        <span>{user.phoneNumber}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 px-2 italic">
                                    <Calendar className="h-3 w-3" />
                                    <span>เข้าร่วมเมื่อ {format(new Date(user.createdAt), "d MMM yyyy", { locale: th })}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <EditUserDialog
                user={editingUser}
                open={editOpen}
                onOpenChange={setEditOpen}
            />

            <DeleteUserDialog
                user={deletingUser}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </div>
    )
}
