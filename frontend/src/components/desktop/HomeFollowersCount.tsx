'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function HomeFollowersCount() {
  const { user } = useAuthStore();
  return <>{user?.stats?.followers ?? 0}</>;
}

