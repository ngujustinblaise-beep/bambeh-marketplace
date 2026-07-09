import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { getOrCreateConversation, sendMessage } from '@/services/message.service'

export default function JobApplicationPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [cv, setCv] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!name || !phone) return

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: listing } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .single()

    const convo = await getOrCreateConversation(id!, user.id, listing.user_id)

    await sendMessage(
      convo.id,
      user.id,
      'Job Application from ' + name,
      { name, phone, email, coverLetter }
    )

    navigate('/chat')
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <h2 className="font-bold text-xl">Apply for Job</h2>

      <input
        placeholder="Full Name *"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <input
        placeholder="Phone *"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <textarea
        placeholder="Cover Letter"
        value={coverLetter}
        onChange={e => setCoverLetter(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <button
        onClick={submit}
        disabled={loading}
        className="bg-teal-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Sending...' : 'Send Application'}
      </button>
    </div>
  )
}
