import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import isSessionAdmin from '@/lib/auth';

// Allowed MIME types for upload (images + MP4 video + PDF for guide files)
// NOTE: SVG and icon types are intentionally excluded to avoid script-in-SVG risks.
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'application/pdf',
]);

// Max file size: 10MB (enough for ~1 min optimized mobile video)
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    // Require authenticated session for uploads (upload endpoint is admin-only)
    const session = await getServerSession(authOptions as any);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
// Admin check (logs removed now fixed)
  if (!isSessionAdmin(session as any)) {
    return NextResponse.json({ error: 'Forbidden - not admin' }, { status: 403 });
  }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const requestedFolder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File size exceeds the 10MB limit' }, { status: 413 });
    }

    // Validate MIME type against whitelist
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images, MP4 videos, and PDF are allowed.' },
        { status: 415 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a safe filename using UUID + original extension from MIME type
    const MIME_TO_EXT: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'application/pdf': 'pdf',
    };
    const fileExtension = MIME_TO_EXT[file.type] || 'blob';
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Choose the folder: public/uploads or public/seoImage
    const subFolder = requestedFolder === 'seoImage' ? 'seoImage' : 'uploads';
    const uploadDir = join(process.cwd(), 'public', subFolder);
    const path = join(uploadDir, fileName);

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    await writeFile(path, buffer);
    const url = `/${subFolder}/${fileName}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
