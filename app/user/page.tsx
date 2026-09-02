import Link from 'next/link';
import { IconSettings } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/page-header';
import { EditInput } from '@/components/common/edit-input';
import { AvatarPicker } from './avatar-picker';
import { StatusPicker } from './status-picker';
import { Share } from '@/components/common/share';
import { StatsGrid } from './stats-grid';
import { FavouriteDrink } from './favourite-drink';
import { DrinkingChart } from './drinking-chart';
import { startOfRange } from '@/lib/utils/calculate-weekly-drinks';

const CHART_WEEKS = 10;

export default async function UserPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();

  if (!auth?.claims) return null;

  const [
    { data: user },
    { count: buddiesCount },
    { count: hangoutsCount },
    { count: spotsCount },
    { count: drinksCount },
    { data: favouriteDrink },
    { data: recentDrinks },
  ] = await Promise.all([
    supabase.from('users').select().eq('id', auth.claims.sub).maybeSingle(),
    supabase.from('my_buddy_ids').select('*', { count: 'exact', head: true }),
    supabase.from('my_hangout_ids').select('*', { count: 'exact', head: true }),
    supabase.from('my_spot_ids').select('*', { count: 'exact', head: true }),
    supabase
      .from('hangout_drinks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth.claims.sub),
    supabase
      .from('favorite_drink_ids')
      .select('count, drinks(name, category)')
      .gte('count', 3)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('hangout_drinks')
      .select('created_at, volume, drinks(abv)')
      .eq('user_id', auth.claims.sub)
      .gte('created_at', new Date(startOfRange(CHART_WEEKS)).toISOString()),
  ]);

  if (!user) return null;

  async function shareProfile(token: string) {
    'use server';
    const supabase = await createClient();
    return supabase
      .from('buddy_shares')
      .insert({ id: auth?.claims.sub as string, token });
  }

  async function saveName(name: string) {
    'use server';
    const supabase = await createClient();
    return supabase
      .from('users')
      .update({ name })
      .eq('id', auth?.claims.sub as string);
  }

  return (
    <>
      <PageHeader title="Profile">
        <Share
          path={`/buddies/${user.id}`}
          title="Share profile"
          onShare={shareProfile}
        />
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Settings"
          nativeButton={false}
          render={<Link href="/user/settings" />}
        >
          <IconSettings className="size-5" />
        </Button>
      </PageHeader>
      <main className="px-4 flex flex-1 flex-col">
        <div className="mt-8 flex items-start gap-4">
          <AvatarPicker {...user} />
          <div className="min-w-0 flex-1">
            <EditInput
              label="Name"
              placeholder="Your name"
              autoComplete="name"
              value={user.name ?? ''}
              onSave={saveName}
            />
            <div className="mt-2">
              <StatusPicker userId={user.id} status={user.status} />
            </div>
          </div>
        </div>
        <StatsGrid
          buddies={buddiesCount ?? 0}
          hangouts={hangoutsCount ?? 0}
          spots={spotsCount ?? 0}
          drinks={drinksCount ?? 0}
        />
        {favouriteDrink?.drinks && (
          <FavouriteDrink
            {...favouriteDrink.drinks}
            count={favouriteDrink.count}
          />
        )}
        <DrinkingChart
          weeks={CHART_WEEKS}
          drinks={(recentDrinks ?? []).flatMap(({ drinks, ...drink }) =>
            drinks ? [{ ...drink, abv: drinks.abv }] : [],
          )}
        />
      </main>
    </>
  );
}
