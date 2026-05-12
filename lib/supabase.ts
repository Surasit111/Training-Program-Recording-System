// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// ใช้ Service Role Key เพื่อให้มีสิทธิ์จัดการไฟล์ได้เต็มที่ (ฝั่ง Server เท่านั้น)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'training-assets'
