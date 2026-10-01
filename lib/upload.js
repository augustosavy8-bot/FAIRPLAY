'use client';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { createUploadUrl } from '@/app/admin/actions';

// Sube un archivo a Storage con una URL firmada emitida por el servidor (solo admins).
export async function uploadImage(file, bucket = 'imagenes') {
  const { data, error } = await createUploadUrl(file.name, file.type || 'image/jpeg');
  if (error) throw new Error(error.message);

  const { error: upErr } = await getSupabaseBrowser()
    .storage.from(bucket)
    .uploadToSignedUrl(data.path, data.token, file, { contentType: file.type || 'image/jpeg' });
  if (upErr) throw new Error(upErr.message || 'Error al subir la imagen');

  return data.publicUrl;
}
