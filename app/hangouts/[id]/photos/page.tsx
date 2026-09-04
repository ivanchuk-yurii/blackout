import { createClient } from '@/lib/supabase/server';
import { type Photo } from '@/lib/supabase/custom-types';
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
    .list(id);
  const paths = (files ?? []).map((file) => `${id}/${file.name}`);

  let photos: Photo[] = [];
  if (paths.length) {
    const { data: signed } = await supabase.storage
      .from('hangout-photos')
      .createSignedUrls(paths, 60 * 60);
    photos = (signed ?? [])
      .filter((entry) => !entry.error && entry.signedUrl && entry.path)
      .map((entry) => ({ path: entry.path!, url: entry.signedUrl! }));
  }

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Photos" />

      <PhotoGrid initialPhotos={photos} />
    </main>
  );
}
