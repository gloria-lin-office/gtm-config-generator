import { VariableConfig } from 'src/app/interfaces/gtm-config-generator';

export function createVariable(
  accountId: string,
  containerId: string,
  dataLayerName: string
): VariableConfig {
  return {
    name: `DLV - ${dataLayerName}`,
    type: 'v',
    accountId,
    containerId,
    parameter: [
      {
        type: 'INTEGER',
        key: 'dataLayerVersion',
        value: '2',
      },
      {
        type: 'BOOLEAN',
        key: 'setDefaultValue',
        value: 'false',
      },
      {
        type: 'TEMPLATE',
        key: 'name',
        value: dataLayerName,
      },
    ],
  };
}
