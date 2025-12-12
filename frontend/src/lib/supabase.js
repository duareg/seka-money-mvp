import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aqdonumtzlvjfpltnmid.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZG9udW10emx2amZwbHRubWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjQ5MjcsImV4cCI6MjA4MDM0MDkyN30.hFy1TPT39RGNun222RgAdSxMdA_awfks7VPRTw_ez8k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
