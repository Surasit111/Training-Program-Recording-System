// app/(dashboard)/projects/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Trash2, Eye, Pencil, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import Link from "next/link"
import { useToast } from "@/components/ui/toast"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Type ข้อมูล
export type ProjectData = {
  id: string
  projectCode: string
  projectName: string
  province: string
  startDate: string
  endDate: string
  budgetType: string
  transportMethod?: string | null
  area: {
    name: string
  }
}

const ActionsCell = ({ project, onDeleteSuccess }: { project: ProjectData, onDeleteSuccess: () => void }) => {
  const { addToast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("ลบไม่สำเร็จ")
      addToast({ title: "ลบข้อมูลเรียบร้อย", type: "success" })
      setShowDeleteDialog(false)
      onDeleteSuccess()
    } catch (error) {
      console.error("Delete Project Error:", error)
      addToast({ title: "เกิดข้อผิดพลาดในการลบ", type: "error" })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>

          <Link href={`/projects/${project.id}`} className="w-full">
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" /> ดูรายละเอียด
            </DropdownMenuItem>
          </Link>

          <Link href={`/projects/${project.id}/edit`} className="w-full">
            <DropdownMenuItem className="cursor-pointer text-gray-700">
              <Pencil className="mr-2 h-4 w-4" /> แก้ไขโครงการ
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 cursor-pointer focus:text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> ลบโครงการ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Modal */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-2xl p-0 gap-0 overflow-hidden">
          {/* Header with Icon */}
          <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <AlertTriangle className="h-10 w-10 text-red-500" strokeWidth={1.5} />
            </div>

            <DialogHeader className="space-y-3 text-center items-center">
              <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight text-center w-full">
                ยืนยันการลบโครงการ
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 leading-relaxed text-center max-w-xs">
                คุณต้องการลบโครงการ<br />
                <span className="font-semibold text-gray-900 text-base block mt-1">
                  &ldquo;{project.projectName}&rdquo;
                </span>
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="flex-row gap-0 border-t border-gray-100 p-0">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="flex-1 h-14 rounded-none border-r border-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 h-14 rounded-none bg-red-500 hover:bg-red-600 text-white font-medium transition-colors border-0"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  กำลังลบ...
                </span>
              ) : (
                "ยืนยันการลบ"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const createColumns = (onDeleteSuccess: () => void): ColumnDef<ProjectData>[] => [
  {
    id: "index",
    header: "ลำดับ",
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
  },
  {
    accessorKey: "projectName",
    header: "ชื่อโครงการ / ระยะเวลา",
    cell: ({ row }) => {
      const p = row.original
      const start = new Date(p.startDate)
      const end = new Date(p.endDate)
      return (
        <div className="flex flex-col min-w-50">
          <span className="font-semibold text-primary truncate max-w-75" title={p.projectName}>{p.projectName}</span>
          <span className="text-xs text-muted-foreground">
            {format(start, "d MMM yy", { locale: th })} - {format(end, "d MMM yy", { locale: th })}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: "budgetType",
    header: "ประเภทงบประมาณ",
  },
  {
    accessorKey: "area.name",
    header: "พื้นที่อบรม",
  },
  {
    accessorKey: "transportMethod",
    header: "การเดินทาง",
    cell: ({ row }) => <div className="truncate max-w-25" title={row.original.transportMethod || ""}>{row.original.transportMethod || "-"}</div>,
  },
  {
    accessorKey: "province",
    header: "จังหวัด",
    cell: ({ row }) => <div className="truncate max-w-25" title={row.original.province}>{row.original.province?.replace('จังหวัด', '')}</div>,
  },
  {
    id: "actions",
    header: "จัดการ",
    cell: ({ row }) => <ActionsCell project={row.original} onDeleteSuccess={onDeleteSuccess} />,
  },
]
