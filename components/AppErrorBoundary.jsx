import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default class AppErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App render error:', error, info?.componentStack);
  }

  retry = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          The app could not display this screen. Please try again.
        </Text>
        <Pressable accessibilityRole="button" onPress={this.retry} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  title: { color: '#1F2937', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  message: { color: '#4B5563', fontSize: 15, textAlign: 'center', marginBottom: 18 },
  button: { backgroundColor: '#36559C', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
});
