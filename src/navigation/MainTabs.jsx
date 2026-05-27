import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ConnectionScreen from '../screens/ConnectionScreen';
import MovementScreen from '../screens/MovementScreen';
import ActionsScreen from '../screens/ActionsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Connection: 'link-outline',
  Movement: 'game-controller-outline',
  Actions: 'flash-outline',
  History: 'time-outline',
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
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
