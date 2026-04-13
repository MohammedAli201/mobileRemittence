import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { fintechColors } from '../components/ui/fintech';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: fintechColors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: fintechColors.text,
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    color: fintechColors.primary,
  },
});
