import { VariableConfig } from '../../../interfaces/gtm-cofig-generator';
import { scrollBuiltInVariable, videoBuiltInVariable } from './constant';
import { isIncludeScroll, isIncludeVideo } from './utility';

export function createMeasurementIdCJS(
  accountId: string,
  containerId: string,
  measurementIdCustomJS: string
): VariableConfig {
  return {
    name: 'Custom JS - Measurement ID',
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

export function getBuiltInVariables(
  accountId: string,
  containerId: string,
  data: Record<string, string>[]
): VariableConfig[] {
  return [
    ...(isIncludeVideo(data)
      ? [...videoBuiltInVariable({ accountId, containerId })]
      : []),
    ...(isIncludeScroll(data)
      ? [...scrollBuiltInVariable({ accountId, containerId })]
      : []),
  ];
}
