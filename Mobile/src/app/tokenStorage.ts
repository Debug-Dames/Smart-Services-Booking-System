import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export const saveToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const loadToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const deleteToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};