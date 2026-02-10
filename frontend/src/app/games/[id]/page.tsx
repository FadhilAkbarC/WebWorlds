import GameDetailClient from '@/components/desktop/GameDetailClient';
import { getGameById } from '@/lib/serverApi';

export const revalidate = 60;

type GameDetailPageProps = {
  params: { id: string };
};

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const response = await getGameById(params.id, 60);
  const game = response.success ? response.data ?? null : null;

  return <GameDetailClient gameId={params.id} initialGame={game} />;
}
