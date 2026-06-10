import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput
} from 'react-native';

import * as authApi from '../api/auth';
import { colors, fonts, spacing } from '../constants/theme';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ─── Validaciones ──────────────────────────────────────────────────────────
  const validate = () => {
    if (!username.trim()) {
      setError('El nombre de usuario es obligatorio.');
      return false;
    }
    if (username.trim().length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      return false;
    }
    if (!email.trim()) {
      setError('El email es obligatorio.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Ingresá un email válido.');
      return false;
    }
    if (!password) {
      setError('La contraseña es obligatoria.');
      return false;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (!validate()) return;

    setSubmitting(true);
    try {
await authApi.register(username.trim(), email.trim(), password);
      setSuccess('Cuenta creada. Ya podés iniciar sesión.');
      setTimeout(() => navigation.navigate('Login'), 1500);
    } catch (err) {
      console.error('[Register] full error:', JSON.stringify({ message: err?.message, code: err?.code, status: err?.response?.status, data: err?.response?.data, config_url: err?.config?.url, config_baseURL: err?.config?.baseURL }));
      const status = err.response?.status;
      const serverMsg =
        (err.response?.data?.message ?? err.response?.data?.detail ?? '').toLowerCase();

      // Mensajes específicos según el error del servidor
      if (status === 409 || status === 400) {
        if (serverMsg.includes('email')) {
          setError('Ese email ya está registrado. Probá con otro o iniciá sesión.');
        } else if (
          serverMsg.includes('username') ||
          serverMsg.includes('usuario') ||
          serverMsg.includes('user')
        ) {
          setError('Ese nombre de usuario ya existe. Elegí otro.');
        } else {
          setError('El email o nombre de usuario ya está en uso.');
        }
      } else if (!err.response) {
        setError(`Sin conexión: ${err?.message ?? err?.code ?? 'error desconocido'}`);
      } else {
        setError(
          err.response?.data?.message ??
          err.response?.data?.detail ??
          'No se pudo completar el registro.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Indicador en tiempo real de contraseñas que no coinciden
  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">

      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Registrate para operar el robot</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={(t) => { setUsername(t); setError(''); }}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={(t) => { setEmail(t); setError(''); }}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña (mínimo 6 caracteres)"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={(t) => { setPassword(t); setError(''); }}
      />
      <TextInput
        style={[styles.input, passwordMismatch && styles.inputError]}
        placeholder="Confirmar contraseña"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={confirmPassword}
        onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
      />

      {/* Indicador en tiempo real */}
      {passwordMismatch && (
        <Text style={styles.inlineError}>Las contraseñas no coinciden</Text>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Pressable
        style={[styles.button, (submitting || success) && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={submitting || !!success}>
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Volver al inicio de sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: fonts.sizes.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fonts.sizes.md,
    marginBottom: spacing.xl,
  },
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
  inputError: {
    borderColor: colors.error,
  },
  inlineError: {
    color: colors.error,
    fontSize: fonts.sizes.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
    fontSize: fonts.sizes.md,
  },
  success: {
    color: colors.success,
    marginBottom: spacing.md,
    fontSize: fonts.sizes.md,
  },
  button: {
    backgroundColor: colors.text,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.black,
    fontWeight: '700',
    fontSize: fonts.sizes.lg,
  },
  link: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
