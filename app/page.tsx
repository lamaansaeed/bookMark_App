'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import LoginButton from '../components/LoginButton'
import BookmarkManager from '../components/BookmarkManager'

export default function Home() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!user) {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoginButton />
    </div>
  )
}

  return (
  <div className="min-h-screen p-8">
    <div className="flex justify-between mb-6">
      <h1 className="text-xl font-bold">Smart Bookmark App</h1>
      <button
        onClick={() => supabase.auth.signOut()}
        className="text-sm text-red-500"
      >
        Logout
      </button>
    </div>

    <BookmarkManager userId={user.id} />
  </div>
)
}







