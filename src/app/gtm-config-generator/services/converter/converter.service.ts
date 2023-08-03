import { Injectable } from '@angular/core';
import { exportGtmJSON } from './configuration-utilities';
import {
  GtmConfigGenerator,
  Tag,
  Trigger,
  Parameter,
} from '../../../interfaces/gtm-cofig-generator';
import {
  formatSingleEventParameters,
  getAllObjectPaths,
  isBuiltInEvent,
} from './utilities';

@Injectable({
  providedIn: 'root',
})
export class ConverterService {
  dataLayers: string[] = [];
  triggers: Trigger[] = [];
  tags: Tag[] = [];
  measurementIdCustomJS = '';

  convert(gtmConfigGenerator: GtmConfigGenerator) {
    try {
      const specs = this.parseAllSpecs(gtmConfigGenerator.specs);
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

      return exportGtmJSON(
        formattedData,
        gtmConfigGenerator.accountId,
        gtmConfigGenerator.containerId,
        gtmConfigGenerator.containerName,
        gtmConfigGenerator.gtmId,
        this.tags,
        this.dataLayers,
        this.triggers,
        this.measurementIdCustomJS
      );
    } catch (error) {
      console.error('error: ', error);
      throw { error };
    }
  }

  // ------------------------------------------------------------
  // tags-related methods
  // ------------------------------------------------------------

  private formatSingleTag(formattedParams: Parameter[], eventName: string) {
    if (isBuiltInEvent(eventName)) {
      return;
    }
    this.addTagIfNotExists(eventName, formattedParams);
  }

  private addTagIfNotExists(eventName: string, formattedParams: Parameter[]) {
    if (!this.tags.some((tag) => tag.name === eventName) && this.triggers) {
      this.tags.push({
        name: eventName,
        parameters: formattedParams,
        triggers: [
          this.triggers.find((trigger) => trigger.name === eventName)!,
        ],
      });
    }
  }

  // ------------------------------------------------------------
  // triggers-related methods
  // ------------------------------------------------------------

  private formatSingleTrigger(eventName: string) {
    if (isBuiltInEvent(eventName)) {
      return;
    }

    this.addTriggerIfNotExists(eventName);
  }

  private addTriggerIfNotExists(eventName: string) {
    if (!this.triggers.some((trigger) => trigger.name === eventName)) {
      this.triggers.push({
        name: eventName,
        triggerId: (this.triggers.length + 1).toString(),
      });
    }
  }

  // ------------------------------------------------------------
  // variables-related methods
  // ------------------------------------------------------------

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

  private parseAllSpecs(inputString: string) {
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
      // If JSON parsing fails, throw an error.
      throw new Error(
        'Cannot parse JSON. Please revise the format to follow JSON structure rules'
      );
    }
  }

  private addDataLayer(paths: string[]) {
    const uniquePaths = this.filterDuplicates(paths);
    this.dataLayers.push(...uniquePaths);
  }

  private filterDuplicates(paths: string[]): string[] {
    return paths.filter((path) => !this.dataLayers.includes(path));
  }
}
