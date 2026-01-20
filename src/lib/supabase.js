import { createClient } from '@supabase/supabase-js'

// REEMPLAZA estos valores con los tuyos:
const supabaseUrl = 'https://ktjlviaduxxldpjhbzfm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0amx2aWFkdXh4bGRwamhiemZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4ODQ0MDYsImV4cCI6MjA4NDQ2MDQwNn0.Z8iICuwuhM6v98EONnw7CifhsLy3cqY7KDKn2QNUCII'

export const supabase = createClient(supabaseUrl, supabaseKey)