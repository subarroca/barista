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
  tagOverlay,
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

// TODO: lukas.holzer investigate why this test is flaky on Browserstack
// tslint:disable-next-line: dt-no-focused-tests
test.skip('should show is required error when the input is dirty', async () => {
  await clickOption(3)
    .typeText(input, 'a')
    .pressKey('backspace')
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

test('should remove all filters when clicking the clear-all button', async () => {
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

test('should not show the overlay on a tag because the tag value is not ellipsed', async () => {
  await clickOption(1)
    .typeText(input, 'abcdefghijklmno')
    // Wait for a certain amount of time to let the filterfield refresh
    .wait(250)
    // Select the free text node and start typing
    .pressKey('enter')
    .wait(250)
    // Hover the filter field tag
    .hover(filterTags)
    .expect(tagOverlay.exists)
    .notOk();
});

test('should show the overlay on a tag because the tag value is ellipsed', async () => {
  await clickOption(1)
    .typeText(
      input,
      'abcdefghijklmnopqrstuvwxyz, 1234567890, abcdefghijklmnopqrstuvwxyz',
    )
    // Wait for a certain amount of time to let the filterfield refresh
    .wait(250)
    // Select the free text node and start typing
    .pressKey('enter')
    .wait(250)
    // Hover the filter field tag
    .hover(filterTags)
    .expect(tagOverlay.exists)
    .ok();
});
