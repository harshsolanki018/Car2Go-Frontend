const runtimeConfig = (globalThis as { __APP_CONFIG__?: { apiBaseUrl?: string } })
  .__APP_CONFIG__;

export const environment = {
  production: false,
  apiBaseUrl: runtimeConfig?.apiBaseUrl ?? 'http://localhost:5000/api',
};
