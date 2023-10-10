import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GtmConfigGenerator } from 'src/app/interfaces/gtm-config-generator';
import { extractAccountAndContainerId } from '../converter/utilities/utilities';

@Injectable({
  providedIn: 'root',
})
export class SetupConstructorService {
  configurationName: BehaviorSubject<string> = new BehaviorSubject<string>(
    'GA4 Configuration'
  );

  includeItemScopedVariables: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  setConfigurationName(name: string) {
    this.configurationName.next(name);
  }

  getConfigurationName() {
    return this.configurationName.asObservable();
  }

  setIncludeItemScopedVariables(include: boolean) {
    this.includeItemScopedVariables.next(include);
  }

  getIncludeItemScopedVariables() {
    return this.includeItemScopedVariables.asObservable();
  }

  generateGtmConfig(
    json: any,
    tagManagerUrl: string,
    containerName: string,
    gtmId: string
  ): GtmConfigGenerator {
    const { accountId, containerId } =
      extractAccountAndContainerId(tagManagerUrl);

    const gtmConfigGenerator: GtmConfigGenerator = {
      accountId: accountId,
      containerId: containerId,
      containerName: containerName,
      gtmId: gtmId,
      specs: json,
    };

    return gtmConfigGenerator;
  }
}
