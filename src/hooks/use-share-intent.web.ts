export function useSafeShareIntent() {
  return {
    hasShareIntent: false,
    shareIntent: { type: 'text', value: '' },
    resetShareIntent: () => {},
    error: null,
  };
}
