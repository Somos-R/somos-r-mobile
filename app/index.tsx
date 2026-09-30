import { StyleSheet, Text, View } from 'react-native';

// Placeholder until the first real screens (Citizen and Recycler apps) are built.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Somos R</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
