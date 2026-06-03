import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket => {
  if (!socket) {
    socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const trackSchedule = (scheduleId: string): void => {
  socket?.emit('track:schedule', scheduleId);
};

export const untrackSchedule = (scheduleId: string): void => {
  socket?.emit('untrack:schedule', scheduleId);
};

export const lockSeat = (seatId: string, scheduleId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    socket?.emit('seat:lock', { seatId, scheduleId }, (response: any) => {
      if (response.error) reject(new Error(response.error));
      else resolve(response);
    });
  });
};

export const releaseSeat = (seatId: string, scheduleId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    socket?.emit('seat:release', { seatId, scheduleId }, (response: any) => {
      if (response.error) reject(new Error(response.error));
      else resolve(response);
    });
  });
};

export const onSeatLocked = (callback: (data: any) => void): void => {
  socket?.on('seat:locked', callback);
};

export const onSeatReleased = (callback: (data: any) => void): void => {
  socket?.on('seat:released', callback);
};

export const onSeatExpired = (callback: (data: any) => void): void => {
  socket?.on('seat:expired', callback);
};

export const onBookingUpdated = (callback: (data: any) => void): void => {
  socket?.on('booking:updated', callback);
};

export const removeSocketListeners = (): void => {
  socket?.off('seat:locked');
  socket?.off('seat:released');
  socket?.off('seat:expired');
  socket?.off('booking:updated');
};
