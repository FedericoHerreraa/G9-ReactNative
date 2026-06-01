import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { colors, fonts, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, loginAsDev, isDevBypassAuthEnabled } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!identifier.trim()) {
      setError('Completá el email o usuario.');
      return false;
    }
    if (identifier.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier.trim())) {
        setError('El email no tiene un formato válido.');
        return false;
      }
    }
    if (!password) {
      setError('La contraseña es obligatoria.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 400) {
        setError('Email o contraseña incorrectos.');
      } else if (status === 404) {
        setError('Usuario no encontrado.');
      } else {
        setError(
          err.response?.data?.message ??
          err.response?.data?.detail ??
          'No se pudo iniciar sesión. Verificá tus credenciales.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginAsDev();
    } catch (err) {
      const message = err?.message ?? 'No se pudo iniciar el modo desarrollo.';
      setError(message);
      Alert.alert('Modo desarrollo', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Control Unitree</Text>
      <Text style={styles.subtitle}>Go2 / G1 vía REST API</Text>

      <TextInput
        style={styles.input}
        placeholder="Email o usuario"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        value={identifier}
        onChangeText={(t) => { setIdentifier(t); setError(''); }}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={(t) => { setPassword(t); setError(''); }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        )}
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tenés cuenta? Registrate</Text>
      </Pressable>

      {isDevBypassAuthEnabled ? (
        <>
          <Text style={styles.devHint}>
            Modo desarrollo: no hace falta completar email ni contraseña.
          </Text>
          <Pressable
            style={[styles.devButton, submitting && styles.buttonDisabled]}
            onPress={handleDevLogin}
            disabled={submitting}>
            <Text style={styles.devButtonText}>Entrar sin API (desarrollo)</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  title: { color: colors.text, fontSize: fonts.sizes.xxl, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: fonts.sizes.md, marginBottom: spacing.xl },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    color: colors.text,
    marginBottom: spacing.md,
    fontSize: fonts.sizes.lg,
  },
  error: { color: colors.error, marginBottom: spacing.md, fontSize: fonts.sizes.md },
  button: { backgroundColor: colors.text, padding: spacing.md, borderRadius: 10, alignItems: 'center', marginBottom: spacing.md },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.black, fontWeight: '700', fontSize: fonts.sizes.lg },
  link: { color: colors.textMuted, textAlign: 'center', fontSize: fonts.sizes.md },
  devHint: { color: colors.textMuted, fontSize: fonts.sizes.sm, textAlign: 'center', marginTop: spacing.xl, marginBottom: spacing.sm },
  devButton: { padding: spacing.md, borderRadius: 10, borderWidth: 1, borderColor: colors.warning, borderStyle: 'dashed', alignItems: 'center' },
  devButtonText: { color: colors.warning, fontSize: fonts.sizes.md, fontWeight: '600' },
});