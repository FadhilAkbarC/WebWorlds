import MobileGameDetailClient from '@/components/mobile/MobileGameDetailClient';
import { getGameById } from '@/lib/serverApi';

export const revalidate = 60;

type MobileGameDetailPageProps = {
  params: { id: string };
};

export default async function MobileGameDetailPage({ params }: MobileGameDetailPageProps) {
  const response = await getGameById(params.id, 60);
  const game = response.success ? response.data ?? null : null;

  return <MobileGameDetailClient gameId={params.id} initialGame={game} />;
}
