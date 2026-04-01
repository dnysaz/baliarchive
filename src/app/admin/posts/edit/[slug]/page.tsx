'use client'

import PostForm from '@/components/PostForm'
import { useParams } from 'next/navigation'

export default function EditPostPage() {
  const params = useParams()
  return <PostForm slug={params.slug as string} />
}

