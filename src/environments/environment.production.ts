const runtimeConfig = (globalThis as { __APP_CONFIG__?: { apiBaseUrl?: string } })
  .__APP_CONFIG__;

export const environment = {
  production: true,
  apiBaseUrl: runtimeConfig?.apiBaseUrl ?? 'https://car2go-backend-zbum.onrender.com/api',
};
