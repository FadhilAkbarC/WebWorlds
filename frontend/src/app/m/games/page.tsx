import MobileGamesClient from '@/components/mobile/MobileGamesClient';
import { getGamesList } from '@/lib/serverApi';

export const revalidate = 30;

export default async function MobileGamesPage() {
  const response = await getGamesList({ page: 1, limit: 8, revalidate: 30 });
  const games = response.success ? response.data ?? [] : [];
  const total = response.meta?.pagination?.total ?? games.length;

  return (
    <MobileGamesClient
      initialGames={games}
      initialPage={1}
      initialTotal={total}
      initialSuccess={response.success}
    />
  );
}