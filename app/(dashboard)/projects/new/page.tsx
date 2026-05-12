"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { projectSchema } from "@/schemas/project-schema"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useState, useEffect, ChangeEvent } from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { CalendarIcon, Loader2, UploadCloud, X, FileText, MapPin, Check, ChevronsUpDown } from "lucide-react"
import { useToast } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

// Import MapPicker component
import dynamic from 'next/dynamic'
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">กำลังโหลดแผนที่...</div>
})

interface TrainingArea {
  id: string
  name: string
}

interface BudgetType {
  id: string
  name: string
}

interface TransportMethod {
  id: string
  name: string
}

import { thaiProvinces } from "@/lib/thai-provinces"
// ...


export default function NewProjectPage() {
  const { addToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Map State
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)

  const [areas, setAreas] = useState<TrainingArea[]>([])
  const [budgetTypes, setBudgetTypes] = useState<BudgetType[]>([])
  const [transportMethods, setTransportMethods] = useState<TransportMethod[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingCert, setUploadingCert] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [certUrls, setCertUrls] = useState<string[]>([])

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: "",
      projectCode: "",
      areaId: "",
      budgetType: "",
      transportMethod: "",
      province: "",
      locationDetail: "",
      description: "",
      projectImages: [],
      certificates: [],
    },
  })

  // Fetch areas and budget types from DB
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [areasRes, budgetsRes, transportRes] = await Promise.all([
          fetch("/api/areas"),
          fetch("/api/budget-types"),
          fetch("/api/transport-methods")
        ])

        if (areasRes.ok) {
          const data = await areasRes.json()
          setAreas(data.areas)
        }

        if (budgetsRes.ok) {
          const data = await budgetsRes.json()
          setBudgetTypes(data.budgetTypes)
        }

        if (transportRes.ok) {
          const data = await transportRes.json()
          setTransportMethods(data.transportMethods)
        }
      } catch (error) {
        console.error("Failed to fetch options:", error)
      }
    }
    fetchOptions()
  }, [])

  // Handle Multi-image upload
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    try {
      const uploaded: string[] = []
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append("file", files[i])
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        if (res.ok) {
          const data = await res.json()
          uploaded.push(data.url)
        }
      }
      setImageUrls(prev => [...prev, ...uploaded])
    } catch (error) {
      console.error("Image Upload Error:", error)
      addToast({ title: "อัปโหลดรูปไม่สำเร็จ", type: "error" })
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle Certificates upload
  const handleCertUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingCert(true)
    try {
      const uploaded: string[] = []
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append("file", files[i])
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        if (res.ok) {
          const data = await res.json()
          uploaded.push(data.url)
        }
      }
      setCertUrls(prev => [...prev, ...uploaded])
    } catch (error) {
      console.error("Cert Upload Error:", error)
      addToast({ title: "อัปโหลดไฟล์ไม่สำเร็จ", type: "error" })
    } finally {
      setUploadingCert(false)
    }
  }

  const removeImage = (url: string) => {
    setImageUrls(prev => prev.filter(u => u !== url))
  }

  const removeCert = (url: string) => {
    setCertUrls(prev => prev.filter(u => u !== url))
  }

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    setLoading(true)

    const payload = {
      ...values,
      projectImages: imageUrls,
      certificates: certUrls,
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "เกิดข้อผิดพลาดในการบันทึก")
      }

      addToast({ title: "บันทึกโครงการเรียบร้อย!", type: "success" })
      router.push("/")
      router.refresh()
    } catch (error) {
      addToast({ title: error instanceof Error ? error.message : "เกิดข้อผิดพลาด", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
      <Card className="rounded-xl sm:rounded-2xl shadow-sm border-slate-100">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-2xl font-bold">บันทึกโครงการอบรมใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Section 1: ข้อมูลพื้นฐาน */}
              <div className="space-y-4">
                <h3 className="text-sm sm:text-lg font-bold flex items-center gap-2 border-b pb-2 text-slate-700">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" /> ข้อมูลโครงการ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อโครงการ</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น อบรมการใช้ AI เบื้องต้น" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="projectCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>หมายเลขโครงการ</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น P-2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budgetType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ประเภทงบประมาณ</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกประเภทงบประมาณ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper">
                            {budgetTypes.map((type) => (
                              <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="areaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>พื้นที่อบรม</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกพื้นที่อบรม" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper">
                            {areas.map((area) => (
                              <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>วันเริ่มต้น - วันสิ้นสุด</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "dd MMM yyyy", { locale: th })} -{" "}
                                    {format(field.value.to, "dd MMM yyyy", { locale: th })}
                                  </>
                                ) : (
                                  format(field.value.from, "dd MMM yyyy", { locale: th })
                                )
                              ) : (
                                <span>เลือกช่วงเวลาการอบรม</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start" side="bottom">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={field.value?.from}
                              selected={field.value}
                              onSelect={field.onChange}
                              numberOfMonths={2}
                              locale={th}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transportMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>การเดินทาง (ระบุพาหนะ)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกพาหนะในการเดินทาง" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper">
                            {transportMethods.map((t) => (
                              <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รายละเอียดโครงการเพิ่มเติม (ถ้ามี)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="รายละเอียดอื่นๆ..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section 2: แผนที่และสถานที่ */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm sm:text-lg font-bold flex items-center gap-2 border-b pb-2 text-slate-700">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" /> สถานที่จัดโครงการ
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>จังหวัด</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? thaiProvinces.find(
                                    (province) => province.name === field.value
                                  )?.name || field.value
                                  : "เลือกจังหวัด"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="ค้นหาจังหวัด..." />
                              <CommandList>
                                <CommandEmpty>ไม่พบจังหวัด</CommandEmpty>
                                <CommandGroup>
                                  {thaiProvinces.map((province) => (
                                    <CommandItem
                                      value={province.name}
                                      key={province.name}
                                      onSelect={() => {
                                        form.setValue("province", province.name)
                                        // Pin center logic
                                        setMapCenter([province.lat, province.lng])
                                        // Update map marker to center of province as well? 
                                        // Maybe, but user might want to pinpoint specific location.
                                        // Let's just move the map view first.
                                        // If we want to set the marker, we should also update lat/long form values.
                                        form.setValue("latitude", province.lat)
                                        form.setValue("longitude", province.lng)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          province.name === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {province.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="locationDetail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>สถานที่จัด (รายละเอียดเพิ่มเติม)</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น โรงแรม, อาคาร..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 3: อัปโหลดไฟล์ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
                {/* รูปภาพ */}
                <div className="space-y-4">
                  <FormLabel className="text-base">รูปภาพเข้าร่วมโครงการ</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {imageUrls.map((url) => {
                      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
                      return (
                        <div key={url} className="relative aspect-video rounded-lg overflow-hidden border bg-slate-50 group">
                          {isImage ? (
                            <Image src={url} alt="Project" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" unoptimized />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-2 text-center w-full">
                              <FileText className="h-8 w-8 mb-2" />
                              <span className="text-xs break-all line-clamp-2 px-2">{url.split('/').pop()}</span>
                            </div>
                          )}

                          {/* Link wrapper for non-images to open in new tab */}
                          {!isImage && (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0" />
                          )}

                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(url); }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )
                    })}
                    <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      {uploadingImage ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <>
                          <UploadCloud className="h-6 w-6 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">รูปภาพ / ไฟล์</span>
                        </>
                      )}
                      <input type="file" className="hidden" multiple onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>

                {/* เกียรติบัตร/เอกสาร */}
                <div className="space-y-4">
                  <FormLabel className="text-base">ใบรับรอง/เกียรติบัตร</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {certUrls.map((url) => {
                      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
                      return (
                        <div key={url} className="relative aspect-video rounded-lg overflow-hidden border bg-slate-50 group">
                          {isImage ? (
                            <Image src={url} alt="Certificate" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" unoptimized />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-2 text-center w-full">
                              <FileText className="h-8 w-8 mb-2" />
                              <span className="text-xs break-all line-clamp-2 px-2">{url.split('/').pop()}</span>
                            </div>
                          )}

                          {/* Link wrapper for non-images to open in new tab */}
                          {!isImage && (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0" />
                          )}

                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeCert(url); }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )
                    })}
                    <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      {uploadingCert ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <>
                          <UploadCloud className="h-6 w-6 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">อัปโหลดไฟล์</span>
                        </>
                      )}
                      <input type="file" className="hidden" multiple onChange={handleCertUpload} disabled={uploadingCert} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 4: แผนที่สถานที่จัด */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-700">
                  <MapPin className="h-4 w-4 text-indigo-500" /> ระบุพิกัดในแผนที่
                </h3>
                <MapPicker
                  center={mapCenter}
                  latitude={form.watch("latitude")}
                  longitude={form.watch("longitude")}
                  onChange={(coords) => {
                    form.setValue("latitude", coords.latitude)
                    form.setValue("longitude", coords.longitude)
                    if (coords.province) {
                      const match = thaiProvinces.find(p => p.name.includes(coords.province!) || coords.province!.includes(p.name))
                      if (match) {
                        form.setValue("province", match.name)
                      } else {
                        form.setValue("province", coords.province)
                      }
                    }
                    if (coords.district) {
                      form.setValue("district", coords.district)
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-4 border-t pt-6">
                <Button type="button" variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
                <Button type="submit" disabled={loading} className="px-8">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : "สร้างโครงการ"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
