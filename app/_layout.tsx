import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import LoginScreen from './LoginScreen';
import TabLayout from './(tabs)/_layout';

export default function RootLayout() {
  useFrameworkReady();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  if (user === undefined) {
    // Loading state
    return null;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <>
      <TabLayout />
      <StatusBar style="auto" />
    </>
  );
}
