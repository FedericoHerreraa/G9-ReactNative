import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, View } from 'react-native';

import StatusBadge from '../components/StatusBadge';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useRobot } from '../context/RobotContext';
import { useStatusPolling } from '../hooks/useStatusPolling';
import ActionsScreen from '../screens/ActionsScreen';
import ConnectionScreen from '../screens/ConnectionScreen';
import HistoryScreen from '../screens/HistoryScreen';
import MovementScreen from '../screens/MovementScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Connection: 'link-outline',
  Movement: 'game-controller-outline',
  Actions: 'flash-outline',
  History: 'time-outline',
};

function HeaderStatusBadge() {
  const { connectionStatus } = useRobot();
  return (
    <View style={{ marginRight: spacing.md }}>
      <StatusBadge status={connectionStatus} compact />
    </View>
  );
}

function HeaderLogoutButton() {
  const { logout } = useAuth();
  return (
    <Pressable onPress={logout} style={{ marginLeft: spacing.md }}>
      <Ionicons name="log-out-outline" size={24} color={colors.text} />
    </Pressable>
  );
}

export default function MainTabs() {
  useStatusPolling();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerLeft: () => <HeaderLogoutButton />,
        headerRight: () => <HeaderStatusBadge />,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}>
      <Tab.Screen
        name="Connection"
        component={ConnectionScreen}
        options={{ title: 'Conexión', tabBarLabel: 'Conexión' }}
      />
      <Tab.Screen
        name="Movement"
        component={MovementScreen}
        options={{ title: 'Movimiento', tabBarLabel: 'Movimiento' }}
      />
      <Tab.Screen
        name="Actions"
        component={ActionsScreen}
        options={{ title: 'Acciones', tabBarLabel: 'Acciones' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Historial', tabBarLabel: 'Historial' }}
      />
    </Tab.Navigator>
  );
}