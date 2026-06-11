import * as FileSystem from 'expo-file-system/legacy';

function getAvatarFileExtension(uri: string): string {
  const pathWithoutQuery = uri.split('?')[0] ?? uri;
  const extension = pathWithoutQuery.split('.').pop()?.toLowerCase();

  if (extension === 'png' || extension === 'webp' || extension === 'heic') {
    return extension;
  }

  return 'jpg';
}

export async function persistAvatarUri(
  userId: number,
  temporaryUri: string,
): Promise<string> {
  const documentDirectory = FileSystem.documentDirectory;

  if (!documentDirectory) {
    return temporaryUri;
  }

  const avatarsDirectory = `${documentDirectory}avatars`;

  if (temporaryUri.startsWith(avatarsDirectory)) {
    return temporaryUri;
  }

  await FileSystem.makeDirectoryAsync(avatarsDirectory, { intermediates: true });

  const destinationUri = `${avatarsDirectory}/${userId}.${getAvatarFileExtension(temporaryUri)}`;

  await FileSystem.copyAsync({
    from: temporaryUri,
    to: destinationUri,
  });

  return destinationUri;
}
