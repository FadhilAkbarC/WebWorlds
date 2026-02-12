import MobileGameDetailClient from '@/components/mobile/MobileGameDetailClient';
import { getGameById } from '@/lib/server-api-client';
import { notFound } from 'next/navigation';

export const revalidate = 60;

type MobileGameDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MobileGameDetailPage({ params }: MobileGameDetailPageProps) {
  const { id } = await params;
  const gameId = id?.trim();

  if (!gameId || gameId === 'undefined' || gameId === '$undefined') {
    notFound();
  }

  const response = await getGameById(gameId, 60);
  const game = response.success ? response.data ?? null : null;

  return <MobileGameDetailClient gameId={gameId} initialGame={game} />;
}
