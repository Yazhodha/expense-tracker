import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/providers/AuthContext';

export default function LoginScreen() {
  const { signIn, loading } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="wallet" size={80} color="#6366f1" />
        <Text variant="headlineLarge" style={styles.title}>
          Expense Tracker
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Track your expenses with ease
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={signIn}
          icon="google"
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Sign in with Google
        </Button>
      </View>

      <Text variant="bodySmall" style={styles.footer}>
        Your data is securely stored with Firebase
      </Text>
      <Text variant="bodySmall" style={styles.footer}>
        Same account as web app - data syncs automatically!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    marginTop: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 8,
    color: '#64748b',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    marginTop: 32,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
