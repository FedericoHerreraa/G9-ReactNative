import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../constants/theme';

export default function ScreenContainer({ children, scrollable = false, style }) {
  if (scrollable) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, style]}>
        {children}
      </ScrollView>
    );
  }
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
});
