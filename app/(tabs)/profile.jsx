import { View, Text } from 'react-native';
import { Button } from '@rneui/themed';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function Profile() {
    const { session } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/');
    };

    if (!session) return null;

    const showStorageContents = async () => {
        const keys = await AsyncStorage.getAllKeys();
        console.log('🔑 Keys:', keys);
      
        const entries = await AsyncStorage.multiGet(keys);
        console.log('🧠 AsyncStorage Contents:');
        entries.forEach(([key, value]) => {
          console.log(`${key}:`, value);
        });
      };
      

    return (
        <View>
            <Text>Logged in as: {session.user.email}</Text>
            <Button title="Sign Out" onPress={handleSignOut} />
            <Button title="Show Async Storage" onPress={showStorageContents}></Button>
            <Button
                title="Reset Food Init"
                onPress={async () => {
                    await AsyncStorage.removeItem('foodListVersion');
                    console.log('🔄 Food list version flag removed');
                }}
            />
        </View>
    );
}
