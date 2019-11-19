/**
 * @license
 * Copyright 2019 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'component-barista-example',
  styles: ['button { margin-top: 24px; }'],
  template: `
    <dt-secondary-nav aria-label="Active Section Secondary Nav Example">
      <dt-secondary-nav-title>Settings</dt-secondary-nav-title>
      <dt-secondary-nav-section expandable [active]="active">
        <dt-secondary-nav-section-title>
          Monitoring
        </dt-secondary-nav-section-title>
        <dt-secondary-nav-section-description>
          Setup and overview
        </dt-secondary-nav-section-description>
        <a
          dtSecondaryNavLink
          routerLink="/"
          [class.dt-secondary-nav-active]="active"
        >
          Monitored technologies
        </a>
        <a dtSecondaryNavLink routerLink="/">Monitoring overview</a>
        <a dtSecondaryNavLink routerLink="/">Host naming</a>
      </dt-secondary-nav-section>
    </dt-secondary-nav>
    <button dt-button (click)="active = !active">toggle active</button>
  `,
})
export class SecondaryNavActiveExample {
  active = true;
}