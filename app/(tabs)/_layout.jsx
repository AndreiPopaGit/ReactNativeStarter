import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const CustomTabBarIcon = ({ color, focused, iconName }) => (
    <View style={{
      backgroundColor: focused ? '#ffffff' : 'transparent',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
      width: 48,
      height: 36,
      shadowColor: focused ? '#000' : 'transparent',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: focused ? 3 : 0,
    }}>
      <Ionicons name={iconName} size={22} color={color} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#e3f2fd', // Light blue background
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: '#2962FF',
        tabBarInactiveTintColor: '#90a4ae', // Light gray-blue
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarItemStyle: {
          padding: 0,
          marginHorizontal: 8,
          borderRadius: 10,
        },
        tabBarHideOnKeyboard: true,
        tabBarPressColor: 'transparent',
        tabBarPressOpacity: 1,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <CustomTabBarIcon color={color} focused={focused} iconName="home-outline" />
          ),
          tabBarButton: (props) => (
            <Pressable
              {...props}
              android_disableSound={true}
              android_ripple={{ color: 'transparent' }}
              style={({ pressed }) => [props.style, { opacity: 1 }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: "Test",
          tabBarIcon: ({ color, focused }) => (
            <CustomTabBarIcon color={color} focused={focused} iconName="flask-outline" />
          ),
          tabBarButton: (props) => (
            <Pressable
              {...props}
              android_disableSound={true}
              android_ripple={{ color: 'transparent' }}
              style={({ pressed }) => [props.style, { opacity: 1 }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <CustomTabBarIcon color={color} focused={focused} iconName="person-outline" />
          ),
          tabBarButton: (props) => (
            <Pressable
              {...props}
              android_disableSound={true}
              android_ripple={{ color: 'transparent' }}
              style={({ pressed }) => [props.style, { opacity: 1 }]}
            />
          ),
        }}
      />
    </Tabs>
  );
}
