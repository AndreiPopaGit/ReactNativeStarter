import 'react-native-url-polyfill/auto';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import Auth from '../components/Auth';
import { useAuth } from '../context/AuthContext';

export default function App() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      router.replace('/(tabs)/home');
    }
  }, [loading, session]);

  if (loading) return null;

  return <View><Auth /></View>;
}
