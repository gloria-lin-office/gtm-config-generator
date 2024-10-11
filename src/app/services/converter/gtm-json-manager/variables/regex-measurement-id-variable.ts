import { VariableConfig } from '../../../../interfaces/gtm-config-generator';
import {
  createBooleanParameter,
  createTemplateParameter,
} from '../parameter-utils';

export function createRegexMeasurementIdVariable(
  accountId: string,
  containerId: string,
  measurementIdVariable: string
): VariableConfig {
  return {
    name: measurementIdVariable || `Measurement ID`,
    type: 'remm',
    accountId,
    containerId,
    parameter: [
      createBooleanParameter('setDefaultValue', 'true'),
      createTemplateParameter('input', '{{Page URL}}'),
      createBooleanParameter('fullMatch', 'false'),
      createBooleanParameter('replaceAfterMatch', 'false'),
      createTemplateParameter('defaultValue', 'G-1'),
      createBooleanParameter('ignoreCase', 'true'),
    ],
    fingerprint: '1696861232768',
    formatValue: {},
  };
}
