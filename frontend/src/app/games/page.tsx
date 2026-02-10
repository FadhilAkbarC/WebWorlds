import GamesClient from '@/components/desktop/GamesClient';
import { getGamesList } from '@/lib/serverApi';

export const revalidate = 30;

export default async function GamesPage() {
  const response = await getGamesList({
    page: 1,
    limit: 12,
    revalidate: 30,
    timeoutMs: 3500,
  });
  const games = response.success ? response.data ?? [] : [];
  const total = response.meta?.pagination?.total ?? games.length;

  return (
    <GamesClient
      initialGames={games}
      initialPage={1}
      initialTotal={total}
      initialSuccess={response.success}
    />
  );
}
