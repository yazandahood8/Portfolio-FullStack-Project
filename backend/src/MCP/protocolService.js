export function createProtocolMessage(type, userId, payload) {
  return {
    type,
    userId,
    timestamp: new Date().toISOString(),
    payload
  };
}
