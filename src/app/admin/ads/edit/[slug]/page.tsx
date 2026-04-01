'use client'

import PostForm from '@/components/PostForm'
import { useParams } from 'next/navigation'

export default function EditAdPage() {
  const params = useParams()
  return <PostForm slug={params.slug as string} isAdForm={true} />
}

