import { View, Text, StyleSheet } from 'react-native';

export default function Meditation() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meditation Timer</Text>
      <Text style={styles.subtitle}>Start your meditation practice</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});
