import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
}
