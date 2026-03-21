'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ─── Sign Up ─────────────────────────────────────────────────
export async function signUp(formData: {
  fullName: string
  email: string
  password: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
        role: 'subscriber',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.session) {
    return { error: 'Check your email for a confirmation link.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ─── Sign In ─────────────────────────────────────────────────
export async function signIn(formData: {
  email: string
  password: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.session) {
    return { error: 'Could not create session. Please try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ─── Sign Out ─────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

// ─── Get Current User ─────────────────────────────────────────
export async function getCurrentUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// ─── Admin Sign In ────────────────────────────────────────────
export async function signInAdmin(formData: {
  email: string
  password: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut()
    return { error: 'Access denied. Admin only.' }
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}
