import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SetupConstructorService {
  configurationName: BehaviorSubject<string> = new BehaviorSubject<string>('');

  setConfigurationName(name: string) {
    this.configurationName.next(name);
  }

  getConfigurationName() {
    return this.configurationName.asObservable();
  }
}
