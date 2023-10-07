import { TagConfig } from 'src/app/interfaces/gtm-config-generator';

export function createGA4Configuration(
  accountId: string,
  containerId: string
): TagConfig {
  return {
    name: 'GA4 Configuration',
    type: 'gaawc',
    accountId,
    containerId,
    parameter: [
      {
        type: 'BOOLEAN',
        key: 'sendPageView',
        value: 'false',
      },
      {
        type: 'BOOLEAN',
        key: 'enableSendToServerContainer',
        value: 'false',
      },
      {
        type: 'TEMPLATE',
        key: 'measurementId',
        value: '{{Custom JS - Measurement ID}}',
      },
    ],
    firingTriggerId: ['2147479553'],
  };
}
