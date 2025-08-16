const memory = {};

export function getModelContext(userId) {
  return memory[userId] || { lastResult: null, history: [] };
}

export function updateModelContext(userId, updates) {
  memory[userId] = { ...getModelContext(userId), ...updates };
}
