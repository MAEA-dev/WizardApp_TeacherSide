const CONNECTION_ERROR_CODES = new Set([
  'unavailable',
  'deadline-exceeded',
  'network-request-failed',
  'auth/network-request-failed',
  'functions/unavailable',
  'functions/deadline-exceeded',
]);

export const isConnectionError = (error) => {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();

  return (
    CONNECTION_ERROR_CODES.has(code) ||
    code.endsWith('/unavailable') ||
    code.endsWith('/deadline-exceeded') ||
    message.includes('client is offline') ||
    message.includes('could not reach cloud firestore') ||
    message.includes('transport errored') ||
    message.includes('network') ||
    message.includes('timed out') ||
    message.includes('deadline exceeded')
  );
};

export const shouldIgnoreSignedOutPermissionError = (error, isSignedIn) => {
  if (isSignedIn) return false;

  const code = String(error?.code || '').toLowerCase();
  return (
    code === 'permission-denied' ||
    code === 'unauthenticated' ||
    code.endsWith('/permission-denied') ||
    code.endsWith('/unauthenticated')
  );
};

export const getClientErrorMessage = (error, fallback = 'Please try again.') => {
  if (isConnectionError(error)) {
    return 'Connection is unstable or unavailable. Check your internet connection and try again.';
  }

  return typeof error?.message === 'string' && error.message.trim()
    ? error.message
    : fallback;
};
