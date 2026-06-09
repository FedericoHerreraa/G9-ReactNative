import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import * as robotApi from '../api/robot';
import { isDevBypassAuthEnabled } from '../constants/dev';
import { ROBOT_TYPES } from '../constants/theme';
import { isConnectedState, mapConnectionState } from '../utils/statusMapper';
import { useAuth } from './AuthContext';

const RobotContext = createContext(null);

export function RobotProvider({ children }) {
  const { token } = useAuth();
  const [robotType, setRobotType] = useState(ROBOT_TYPES.GO2);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [networkInterface, setNetworkInterface] = useState('eth0');
  const [statusData, setStatusData] = useState(null);
  const [isDevSimulated, setIsDevSimulated] = useState(false);
  const [isSeated, setIsSeated] = useState(false);

  const wantsConnectionRef = useRef(false);
  const reconnectingRef = useRef(false);

  const applyStatusFromApi = useCallback((data) => {
    if (!data) return;
    const state = mapConnectionState(data.connection_state);
    setConnectionStatus(state);
    setIsConnected(isConnectedState(state));
    setStatusData(data);
    if (data.robot_type) {
      setRobotType(data.robot_type);
    }
    if (data.network_interface) {
      setNetworkInterface(data.network_interface);
    }
  }, []);

  const attemptReconnect = useCallback(async () => {
    if (!wantsConnectionRef.current || reconnectingRef.current) {
      return null;
    }

    reconnectingRef.current = true;
    setConnectionStatus('connecting');
    try {
      const data = await robotApi.connectRobot({
        robot_type: robotType,
        network_interface: networkInterface || undefined,
      });
      setIsConnected(true);
      setConnectionStatus('connected');
      setStatusData(data);
      return data;
    } catch (err) {
      setIsConnected(false);
      setConnectionStatus('error');
      throw err;
    } finally {
      reconnectingRef.current = false;
    }
  }, [robotType, networkInterface]);

  const fetchStatus = useCallback(async () => {
    const data = await robotApi.getRobotStatus();
    applyStatusFromApi(data);

    const state = mapConnectionState(data.connection_state);
    if (
      wantsConnectionRef.current &&
      state !== 'connected' &&
      state !== 'connecting' &&
      !reconnectingRef.current
    ) {
      await attemptReconnect();
    }

    return data;
  }, [applyStatusFromApi, attemptReconnect]);

  // Punto 2: GET /status al iniciar la app (con sesión activa)
  useEffect(() => {
    if (!token) return;

    fetchStatus().catch(() => {
      // Sin sesión válida o servidor offline: se mantiene estado local.
    });
  }, [token, fetchStatus]);

  const connectRobot = useCallback(async () => {
    wantsConnectionRef.current = true;
    setIsDevSimulated(false);
    setConnectionStatus('connecting');
    try {
      const data = await robotApi.connectRobot({
        robot_type: robotType,
        network_interface: networkInterface || undefined,
      });
      setIsConnected(true);
      setConnectionStatus('connected');
      setStatusData(data);
      return data;
    } catch (err) {
      setIsConnected(false);
      setConnectionStatus('error');
      throw err;
    }
  }, [robotType, networkInterface]);

  const disconnectRobot = useCallback(async () => {
    wantsConnectionRef.current = false;
    if (isDevSimulated) {
      setIsDevSimulated(false);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setStatusData(null);
      return;
    }
    try {
      await robotApi.disconnectRobot();
    } finally {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setStatusData(null);
      setIsSeated(false);
    }
  }, [isDevSimulated]);

  const refreshStatus = useCallback(async () => {
    return fetchStatus();
  }, [fetchStatus]);

  const markRobotSeated = useCallback(() => setIsSeated(true), []);
  const markRobotStanding = useCallback(() => setIsSeated(false), []);

  const simulateDevConnection = useCallback(() => {
    if (!isDevBypassAuthEnabled) return;
    wantsConnectionRef.current = true;
    setIsDevSimulated(true);
    setIsConnected(true);
    setConnectionStatus('connected');
    setStatusData({
      connection_state: 'connected',
      robot_type: robotType,
      network_interface: networkInterface,
      connected_at: new Date().toISOString(),
      last_error: null,
      _dev_mock: true,
    });
  }, [robotType, networkInterface]);

  const value = useMemo(
    () => ({
      robotType,
      setRobotType,
      isConnected,
      connectionStatus,
      setConnectionStatus,
      networkInterface,
      setNetworkInterface,
      statusData,
      setStatusData,
      connectRobot,
      disconnectRobot,
      refreshStatus,
      fetchStatus,
      simulateDevConnection,
      isDevBypassAuthEnabled,
      isDevSimulated,
      isSeated,
      markRobotSeated,
      markRobotStanding,
    }),
    [
      robotType,
      isConnected,
      connectionStatus,
      networkInterface,
      statusData,
      connectRobot,
      disconnectRobot,
      refreshStatus,
      fetchStatus,
      simulateDevConnection,
      isDevSimulated,
      isSeated,
      markRobotSeated,
      markRobotStanding,
    ]
  );

  return <RobotContext.Provider value={value}>{children}</RobotContext.Provider>;
}

export function useRobot() {
  const context = useContext(RobotContext);
  if (!context) {
    throw new Error('useRobot debe usarse dentro de RobotProvider');
  }
  return context;
}
