import { TagConfig } from 'src/app/interfaces/gtm-config-generator';
import {
  createBooleanParameter,
  createTemplateParameter,
} from '../parameter-utils';

export function createGA4Configuration(
  googleTagName: string,
  measurementId: string,
  measurementIdVariable: string,
  accountId: string,
  containerId: string
): TagConfig {
  const measurementIdParameter = measurementId
    ? measurementId
    : `{{${measurementIdVariable || "Measurement ID"}}}`;
  return {
    accountId,
    containerId,
    name: googleTagName,
    type: 'googtag',
    parameter: [
      // createBooleanParameter('sendPageView', 'false'),
      // createBooleanParameter('enableSendToServerContainer', 'false'),
      createTemplateParameter('tagId', `${measurementIdParameter}`),
    ],
    firingTriggerId: ['2147479553'],
    tagFiringOption: 'ONCE_PER_EVENT',
    monitoringMetadata: {
      type: 'MAP',
    },
    consentSettings: {
      consentStatus: 'NOT_SET',
    },
  };
}
