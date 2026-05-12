"use client"

import {
  CheckCircle2,
  Info,
  Loader2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      expand={false}
      richColors={false}
      closeButton={false}
      duration={4000}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={2} />,
        info: <Info className="h-5 w-5 text-blue-500" strokeWidth={2} />,
        warning: <AlertCircle className="h-5 w-5 text-amber-500" strokeWidth={2} />,
        error: <XCircle className="h-5 w-5 text-red-500" strokeWidth={2} />,
        loading: <Loader2 className="h-5 w-5 text-slate-500 animate-spin" strokeWidth={2} />,
      }}
      toastOptions={{
        classNames: {
          toast: "group relative flex items-start gap-3 w-full max-w-[420px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-4 pr-10 overflow-hidden",
          title: "text-sm font-semibold text-slate-900 leading-tight",
          description: "text-xs text-slate-500 leading-relaxed mt-0.5",
          actionButton: "bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm",
          cancelButton: "bg-white text-slate-600 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors",
          closeButton: "absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all",
          success: "border-l-4 border-l-emerald-400",
          error: "border-l-4 border-l-red-400",
          warning: "border-l-4 border-l-amber-400",
          info: "border-l-4 border-l-blue-400",
          loading: "border-l-4 border-l-slate-400",
        },
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#0f172a",
          "--normal-border": "#f1f5f9",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
