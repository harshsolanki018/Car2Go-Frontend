const runtimeConfig = (globalThis as { __APP_CONFIG__?: { apiBaseUrl?: string } })
  .__APP_CONFIG__;

export const environment = {
  production: false,
  apiBaseUrl: runtimeConfig?.apiBaseUrl ?? 'https://car2go-backend-zbum.onrender.com/api',
};
