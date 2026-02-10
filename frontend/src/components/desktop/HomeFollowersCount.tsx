'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function HomeFollowersCount() {
  const user = useAuthStore((state) => state.user);
  return <>{user?.stats?.followers ?? 0}</>;
}
