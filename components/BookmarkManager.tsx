'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
}

export default function BookmarkManager({ userId }: { userId: string }) {

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  // Fetch bookmarks
  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBookmarks(data)
    }
  }

  // Add bookmark
  const addBookmark = async () => {
    if (!title || !url) return

    await supabase.from('bookmarks').insert([
      {
        title,
        url,
        user_id: userId,
      },
    ])

    setTitle('')
    setUrl('')
  }

  // Delete bookmark
  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }


useEffect(() => {
  if (!userId) return

  fetchBookmarks()

  const channel = supabase
    .channel('bookmarks-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookmarks',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Change received!', payload)
        fetchBookmarks() // safest & consistent
      }
    )
    .subscribe((status) => {
      console.log('REALTIME STATUS:', status)
    })

  return () => {
    supabase.removeChannel(channel)
  }
}, [userId])



  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 mr-2 rounded"
        />
        <input
          type="text"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 mr-2 rounded"
        />
        <button
          onClick={addBookmark}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <ul>
        {bookmarks.map((bookmark) => (
          <li
            key={bookmark.id}
            className="flex justify-between items-center border-b py-2"
          >
            <a
              href={bookmark.url}
              target="_blank"
              className="text-blue-600 underline"
            >
              {bookmark.title}
            </a>

            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
