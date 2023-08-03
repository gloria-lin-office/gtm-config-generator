import {
  TagConfig,
  TriggerConfig,
  VariableConfig,
} from './../../../interfaces/gtm-cofig-generator';
import { Injectable } from '@angular/core';
import {
  formatSingleEventParameters,
  getAllObjectPaths,
  getGTMFinalConfiguration,
  isBuiltInEvent,
} from './utility';
import {
  GtmConfigGenerator,
  Tag,
  Trigger,
  Error,
  Parameter,
} from '../../../interfaces/gtm-cofig-generator';
import {
  createScrollTrigger,
  createTrigger,
  createVideoTrigger,
} from './trigger-utilities';
import {
  createGA4Configuration,
  createScrollTag,
  createTag,
  createVideoTag,
} from './tag-utilities';
import {
  createMeasurementIdCJS,
  createVariable,
  getBuiltInVariables,
} from './variable-utilities';

@Injectable({
  providedIn: 'root',
})
export class ConverterService {
  dataLayers: string[] = [];
  triggers: Trigger[] = [];
  tags: Tag[] = [];
  measurementIdCustomJS = '';
  errors: Error[] = [];

  convert(gtmConfigGenerator: GtmConfigGenerator) {
    const specs = this.fiftyFiveParseAllSpecs(gtmConfigGenerator.specs);
    const formattedData = specs.map((spec: { [x: string]: any }) => {
      const eventName = spec['event'];

      const eventParameters = { ...spec }; // copy of spec
      delete eventParameters['event'];

      const formattedParameters = formatSingleEventParameters(
        JSON.stringify(eventParameters)
      );

      this.formatSingleTrigger(eventName);
      this.formatSingleTag(formattedParameters, eventName);

      return { formattedParameters, eventName };
    });

    const measurementIdSettings = {
      stagingMeasurementId: gtmConfigGenerator.stagingMeasurementId,
      stagingUrl: gtmConfigGenerator.stagingUrl,
      productionMeasurementId: gtmConfigGenerator.productionMeasurementId,
      productionUrl: gtmConfigGenerator.productionUrl,
    };

    this.setMeasurementIdCustomJSVariable(measurementIdSettings);

    return this.exportGtmJSON(
      formattedData,
      gtmConfigGenerator.accountId,
      gtmConfigGenerator.containerId,
      gtmConfigGenerator.containerName,
      gtmConfigGenerator.gtmId
    );
  }

  // ------------------------------------------------------------
  // tags-related methods
  // ------------------------------------------------------------

  private formatSingleTag(formattedParams: Parameter[], eventName: string) {
    if (isBuiltInEvent(eventName)) {
      return;
    }
    this.addTagIfNotExists(eventName, formattedParams);
    console.log('this.tags', this.tags);
  }

  private addTagIfNotExists(eventName: string, formattedParams: Parameter[]) {
    if (!this.tags.some((tag) => tag.name === eventName)) {
      this.tags.push({
        name: eventName,
        parameters: formattedParams,
        triggers: [
          this.triggers.find((trigger) => trigger.name === eventName)!,
        ],
      });
    }
  }

  private getTags(
    accountId: string,
    containerId: string,
    data: Record<string, string>[],
    triggers: TriggerConfig[]
  ): TagConfig[] {
    return [
      // config tag
      createGA4Configuration(accountId, containerId),
      // normal tags
      ...this.tags.map((tag) => {
        return createTag(
          accountId,
          containerId,
          tag,
          this.dataLayers,
          triggers
        );
      }),
      // built-in tags. Currently only video and scroll
      ...createVideoTag(accountId, containerId, data, triggers),
      ...createScrollTag(accountId, containerId, data, triggers),
    ].map((_data, index) => ({
      ..._data,
      tagId: (index + 1).toString(),
    }));
  }

  // ------------------------------------------------------------
  // triggers-related methods
  // ------------------------------------------------------------

  private formatSingleTrigger(eventName: string) {
    if (isBuiltInEvent(eventName)) {
      return;
    }

    this.addTriggerIfNotExists(eventName);
    console.log('this.triggers', this.triggers);
  }

  private addTriggerIfNotExists(eventName: string) {
    if (!this.triggers.some((trigger) => trigger.name === eventName)) {
      this.triggers.push({
        name: eventName,
        triggerId: (this.triggers.length + 1).toString(),
      });
    }
  }

  private getTriggers(
    accountId: string,
    containerId: string,
    data: Record<string, string>[]
  ): TriggerConfig[] {
    return [
      ...this.triggers.map(({ name: trigger }) => {
        return createTrigger(accountId, containerId, trigger);
      }),
      ...createVideoTrigger(accountId, containerId, data),
      ...createScrollTrigger(accountId, containerId, data),
    ].map((_trigger, index) => ({
      ..._trigger,
      triggerId: (index + 1).toString(),
    }));
  }

  // ------------------------------------------------------------
  // variables-related methods
  // ------------------------------------------------------------

  private getVariables(
    accountId: string,
    containerId: string
  ): VariableConfig[] {
    const variables = this.dataLayers.map((dL, i) => {
      return createVariable(accountId, containerId, dL);
    });

    const measurementIdVariable = createMeasurementIdCJS(
      accountId,
      containerId,
      this.measurementIdCustomJS
    );
    variables.push(measurementIdVariable);

    return variables.map((data, index) => ({
      ...data,
      variableId: (index + 1).toString(),
    }));
  }

  private setMeasurementIdCustomJSVariable(data: { [x: string]: any }) {
    const stagingMeasurementId = data['stagingMeasurementId'];
    const stagingUrl = data['stagingUrl'];
    const productionMeasurementId = data['productionMeasurementId'];
    const productionUrl = data['productionUrl'];

    const measurementIdCustomJS = `function() {\n  
        var MEASUREMENT_ID_STAGING = '${stagingMeasurementId}'\n  
        var MEASUREMENT_ID_PROD = '${productionMeasurementId}'\n\n  
        var originUrl = window.origin\n\n  
        if(originUrl === '${stagingUrl}') return MEASUREMENT_ID_STAGING\n  
        if(originUrl === '${productionUrl}') return MEASUREMENT_ID_PROD\n\n  
        throw new Error('Invalid environment provided')\n
      }\n`;
    this.measurementIdCustomJS = measurementIdCustomJS;
  }

  // ------------------------------------------------------------
  // general utility
  // ------------------------------------------------------------

  // data parsing

  private fiftyFiveParseAllSpecs(inputString: string) {
    const allSpecs = JSON.parse(inputString);
    // Using 'map' to apply the 'parseSpec' function to each object in the 'allSpecs' array
    // 'bind(this)' is used to ensure that 'this' inside 'parseSpec' refers to the class instance
    // When passing a method like 'parseSpec' as a callback, the context of 'this' is lost
    // Using 'bind(this)', the context is preserved and 'this' inside 'parseSpec' still refers to the class instance
    return allSpecs.map(this.parseSpec.bind(this));
  }

  private parseSpec(parsedJSON: Record<string, string>) {
    if (parsedJSON) {
      const { event, ...Json } = parsedJSON;

      // the paths is for building data layer variables
      const paths = getAllObjectPaths(Json);
      this.addDataLayer(paths);

      return parsedJSON;
    } else {
      this.addError(parsedJSON);
      return null;
    }
  }

  private addDataLayer(paths: string[]) {
    const uniquePaths = this.filterDuplicates(paths);
    this.dataLayers.push(...uniquePaths);
  }

  private addError(parsedJSON: Record<string, string>) {
    this.errors.push({
      type: 'dL',
      reason:
        'cannot parse JSON. please revise the format to follow JSON format structures',
      meta: parsedJSON,
    });
  }

  private filterDuplicates(paths: string[]): string[] {
    return paths.filter((path) => !this.dataLayers.includes(path));
  }

  // export

  private exportGtmJSON(
    data: Record<string, string>[],
    accountId: string,
    containerId: string,
    containerName: string,
    gtmId: string
  ) {
    const _variable = this.getVariables(accountId, containerId);
    const _triggers = this.getTriggers(accountId, containerId, data);
    const _tags = this.getTags(accountId, containerId, data, _triggers);
    const builtInVariable = getBuiltInVariables(accountId, containerId, data);

    return getGTMFinalConfiguration(
      accountId,
      containerId,
      _variable,
      _triggers,
      _tags,
      builtInVariable,
      containerName,
      gtmId
    );
  }
}
