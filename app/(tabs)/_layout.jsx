import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { initializeFoodList } from '@/lib/initializeFoodList';

export default function TabLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/');
    }
  }, [loading, session]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Tabs
    screenOptions={
      { headerShown: false }
    }
  />;
}
