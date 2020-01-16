/**
 * @license
 * Copyright 2020 Dynatrace LLC
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

// tslint:disable no-lifecycle-call no-use-before-declare no-magic-numbers
// tslint:disable no-any max-file-line-count no-unbound-method use-component-selector

import {
  clickOption,
  errorBox,
  input,
  clearAll,
  filterTags,
  setupSecondTestScenario,
} from './filter-field.po';
import { Selector } from 'testcafe';

fixture('Filter Field').page('http://localhost:4200/filter-field');

test('should not show a error box if there is no validator provided', async () => {
  await clickOption(1)
    .typeText(input, 'abc')
    .expect(errorBox.exists)
    .notOk();
});

test('should show a error box if does not meet the validation function', async () => {
  await clickOption(3)
    .typeText(input, 'a')
    .expect(errorBox.exists)
    .ok()
    .expect(errorBox.innerText)
    .match(/min 3 characters/gm);
});

test('should show is required error when the input is dirty', async () => {
  await clickOption(3)
    .typeText(input, 'a')
    .wait(150)
    .pressKey('backspace')
    .wait(250)
    .expect(errorBox.exists)
    .ok()
    .expect(errorBox.innerText)
    .match(/field is required/gm);
});

test('should hide the error box when the node was deleted', async () => {
  await clickOption(3)
    .pressKey('backspace')
    .pressKey('backspace')
    .expect(errorBox.exists)
    .notOk();
});

test('should remove all filters when clicking the clear-all button', async (testController: TestController) => {
  // Create a new filter by clicking the outer- and inner-option
  await clickOption(4);
  await clickOption(1)
    // Click somewhere outside so the clear-all button appears
    .click(Selector('.outside'))
    .wait(300)
    .expect(clearAll.exists)
    .ok()
    // Click the clear all-button, the created filter should be removed
    .click(clearAll)
    .wait(300)
    .expect(filterTags.exists)
    .notOk();
});

test('should remove all removable filters when clicking the clear-all button', async (testController: TestController) => {
  // Setup the second datasource.
  await testController
    .click(setupSecondTestScenario)
    // Wait for the filterfield to catch up.
    .wait(500);

  // Manually set an option, because this seems to break the
  // clear all change detection.
  await clickOption(1);
  await clickOption(1)
    .expect(filterTags.count)
    .eql(2)
    // Click somewhere outside so the clear-all button appears
    .click(Selector('.outside'))
    // Wait for the filterfield to catch up.
    .wait(500)
    .expect(clearAll.exists)
    .ok()
    // Click the clear all-button, the created filter should be removed
    .click(clearAll)
    // Wait for the filterfield to catch up.
    .wait(500)
    .expect(filterTags.count)
    .eql(1);
});
