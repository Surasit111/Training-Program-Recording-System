// lib/storage.ts
import { supabaseAdmin, STORAGE_BUCKET } from './supabase'
import fs from 'fs/promises'
import path from 'path'

export type StorageProvider = 'local' | 'supabase'

const provider: StorageProvider = (process.env.STORAGE_PROVIDER as StorageProvider) || 'local'

/**
 * บันทึกไฟล์ไปยัง Local หรือ Supabase ตามที่ตั้งค่าใน STORAGE_PROVIDER
 * @returns URL ของไฟล์ที่บันทึก
 */
export async function uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
  const filePath = `${folder}/${fileName}`

  if (provider === 'supabase') {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (error) {
      console.error('Supabase upload error:', error)
      throw new Error('Failed to upload to Supabase')
    }

    // สร้าง Public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    return publicUrl
  } else {
    // Local Storage - อยู่นอก public เพื่อความปลอดภัย (ใช้ร่วมกับ /api/uploads/[filename])
    const uploadDir = path.join(process.cwd(), folder)
    
    // ตรวจสอบ/สร้างโฟลเดอร์
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    await fs.writeFile(path.join(uploadDir, fileName), buffer)
    
    // ถ้าใช้ folder ชื่อ 'uploads' ให้ส่งกลับเป็น /api/uploads/... เพื่อให้ Route รับไปจัดการ
    if (folder === 'uploads') {
      return `/api/uploads/${fileName}`
    }
    return `/${folder}/${fileName}`
  }
}

/**
 * ลบไฟล์จาก Local หรือ Supabase
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return

  if (provider === 'supabase') {
    // ดึง path จาก URL (สมมติว่าเป็น Public URL ของ Supabase)
    // ตัวอย่าง: https://xxx.supabase.co/storage/v1/object/public/bucket/folder/file.jpg
    const urlParts = fileUrl.split(`${STORAGE_BUCKET}/`)
    if (urlParts.length < 2) return
    
    const filePath = urlParts[1]
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Supabase delete error:', error)
    }
  } else {
    // Local Delete
    if (fileUrl.startsWith('/')) {
      const filePath = path.join(process.cwd(), 'public', fileUrl)
      try {
        await fs.unlink(filePath)
      } catch (err) {
        console.error('Local delete error:', err)
      }
    }
  }
}
