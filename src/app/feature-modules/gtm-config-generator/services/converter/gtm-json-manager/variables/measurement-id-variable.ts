import { VariableConfig } from 'src/app/interfaces/gtm-config-generator';

export function createMeasurementIdCJS(
  accountId: string,
  containerId: string,
  measurementIdCustomJS: string
): VariableConfig {
  return {
    name: 'Measurement ID',
    type: 'jsm',
    accountId,
    containerId,
    parameter: [
      {
        type: 'TEMPLATE',
        key: 'javascript',
        value: measurementIdCustomJS,
      },
    ],
    formatValue: {},
  };
}
