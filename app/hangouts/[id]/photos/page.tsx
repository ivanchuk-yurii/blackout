import { createClient } from '@/lib/supabase/server';
import { type Photo } from '@/lib/supabase/custom-types';
import { SIGN_TTL } from '@/app/hangouts/[id]/photo';
import { PageHeader } from '@/components/common/page-header';
import { PhotoGrid } from './photo-grid';

export default async function HangoutPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: files } = await supabase.storage
    .from('hangout-photos')
    .list(id, { sortBy: { column: 'created_at', order: 'desc' } });
  const paths = (files ?? []).map((file) => `${id}/${file.name}`);

  let photos: Photo[] = [];
  if (paths.length) {
    const { data: signed } = await supabase.storage
      .from('hangout-photos')
      .createSignedUrls(paths, SIGN_TTL);
    photos = (signed ?? [])
      .filter((entry) => !entry.error && entry.signedUrl && entry.path)
      .map((entry) => ({ path: entry.path!, url: entry.signedUrl! }));
  }

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Photos" />

      <PhotoGrid hangoutId={id} photos={photos} />
    </main>
  );
}
