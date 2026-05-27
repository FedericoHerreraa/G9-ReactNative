import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { RobotProvider } from './src/context/RobotContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RobotProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </RobotProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
