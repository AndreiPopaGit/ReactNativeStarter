import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { useEffect } from 'react';
import { initializeFoodList } from '../lib/initializeFoodList';


export default function RootLayout() {
  useEffect(() => {
    initializeFoodList();
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{headerShown: false}}/>
    </AuthProvider>
  );
}
