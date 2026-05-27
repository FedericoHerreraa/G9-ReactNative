import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import * as robotApi from '../api/robot';
import { ROBOT_TYPES } from '../constants/theme';

const RobotContext = createContext(null);

export function RobotProvider({ children }) {
  const [robotType, setRobotType] = useState(ROBOT_TYPES.GO2);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [networkInterface, setNetworkInterface] = useState('eth0');
  const [statusData, setStatusData] = useState(null);

  const connectRobot = useCallback(async () => {
  // TODO: connect to API — validar respuesta real del backend
    const data = await robotApi.connectRobot({
      robot_type: robotType,
      network_interface: networkInterface,
    });
    setIsConnected(true);
    setConnectionStatus('connected');
    setStatusData(data);
    return data;
  }, [robotType, networkInterface]);

  const disconnectRobot = useCallback(async () => {
  // TODO: connect to API
    await robotApi.disconnectRobot();
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setStatusData(null);
  }, []);

  const refreshStatus = useCallback(async () => {
    if (!isConnected) return null;
  // TODO: connect to API — polling opcional
    const data = await robotApi.getRobotStatus();
    setStatusData(data);
    return data;
  }, [isConnected]);

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
