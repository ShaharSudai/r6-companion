export async function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    // If the path is from the share intent, redirect to the main route (/)
    // so that the CompanionScreen component is mounted and handles the payload
    if (path.includes('expo-share-intent') || path.includes('dataUrl=')) {
      return '/';
    }
    return path;
  } catch {
    return '/';
  }
}
