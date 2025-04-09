import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
    const router = useRouter();

    return (
        <View>
            <Text>🏠 Welcome to the Home Screen!</Text>
        </View>
    )
}