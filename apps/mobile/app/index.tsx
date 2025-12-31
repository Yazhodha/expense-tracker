import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/providers/AuthContext';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated - redirect to app
        // TODO: Create main app screens
        console.log('User authenticated:', user.email);
        // For now, stay on this screen
        // router.replace('/(tabs)');
      } else {
        // User is not authenticated - redirect to login
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text variant="titleMedium" style={styles.text}>
        Loading Expense Tracker...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 16,
  },
});
