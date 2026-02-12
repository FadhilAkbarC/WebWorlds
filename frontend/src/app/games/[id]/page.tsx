import GameDetailClient from '@/components/desktop/GameDetailClient';
import { getGameById } from '@/lib/server-api-client';
import { notFound } from 'next/navigation';

export const revalidate = 60;

type GameDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = await params;
  const gameId = id?.trim();

  if (!gameId || gameId === 'undefined' || gameId === '$undefined') {
    notFound();
  }

  const response = await getGameById(gameId, 60);
  const game = response.success ? response.data ?? null : null;

  return <GameDetailClient gameId={gameId} initialGame={game} />;
}
