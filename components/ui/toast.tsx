"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle2, XCircle, AlertCircle, Info, X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export type ToastType = "success" | "error" | "warning" | "info" | "loading"

export interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

// สร้าง unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = generateId()
    const newToast = { ...toast, id, duration: toast.duration || 4000 }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    if (newToast.type !== "loading") {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast Container Component
function ToastContainer({
  toasts,
  onRemove
}: {
  toasts: Toast[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-3 w-full max-w-md px-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Individual Toast Item
function ToastItem({
  toast,
  onRemove
}: {
  toast: Toast
  onRemove: (id: string) => void
}) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    loading: <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />,
  }

  const borderColors = {
    success: "border-l-emerald-400",
    error: "border-l-rose-400",
    warning: "border-l-amber-400",
    info: "border-l-blue-400",
    loading: "border-l-slate-400",
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className={`pointer-events-auto relative flex items-start gap-3 w-full bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 border-l-4 ${borderColors[toast.type]} p-4 pr-10 overflow-hidden`}
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 leading-tight">
          {toast.title}
        </h3>
        {toast.description && (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// Helper functions
export const toast = {
  success: () => {
    // This will be implemented via context
    console.log("Use useToast hook instead")
  },
  error: () => {
    console.log("Use useToast hook instead")
  },
  info: () => {
    console.log("Use useToast hook instead")
  },
  warning: () => {
    console.log("Use useToast hook instead")
  },
  loading: () => {
    console.log("Use useToast hook instead")
  },
}
