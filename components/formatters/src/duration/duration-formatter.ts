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

import {
  DtFormattedValue,
  FormattedData,
  NO_DATA,
  SourceData,
} from '../formatted-value';
import { DtTimeUnit } from '../unit';

enum DurationMode {
  DEFAULT = 'DEFAULT',
  PRECISE = 'PRECISE',
}

// tslint:disable: no-magic-numbers
// Factorials needed for converting milliseconds to other time units
const CONVERSION_FACTORS_TO_MS = new Map<DtTimeUnit, number>([
  [DtTimeUnit.YEAR, 12 * 30.41666 * 24 * 60 * 60 * 1000],
  [DtTimeUnit.MONTH, 30.41666 * 24 * 60 * 60 * 1000],
  [DtTimeUnit.DAY, 24 * 60 * 60 * 1000],
  [DtTimeUnit.HOUR, 60 * 60 * 1000],
  [DtTimeUnit.MINUTE, 60 * 1000],
  [DtTimeUnit.SECOND, 1000],
  [DtTimeUnit.MILLISECOND, 1],
  [DtTimeUnit.MICROSECOND, 0.001],
  [DtTimeUnit.NANOSECOND, 0.000001],
]);

const CONVERSIONUNITS = 3;

/**
 * Formats a numeric value to a duration
 * @param duration numeric time value
 * @param formatMethod the formatting method
 * @param outputUnit dtTimeUnit | undefined value describing the unit to which it should format e.g to seconds
 * @param inputUnit dtTimeUnit value describing which unit the duration is in
 */
export function formatDuration(
  duration: number,
  formatMethod: string | undefined,
  outputUnit: DtTimeUnit | undefined,
  inputUnit: DtTimeUnit = DtTimeUnit.MILLISECOND,
): DtFormattedValue | string {
  const inputData: SourceData = {
    input: duration,
    unit: inputUnit,
  };
  let formattedData: FormattedData;
  let result: Map<DtTimeUnit, string> | undefined;

  if (duration <= 0 && formatMethod !== DurationMode.PRECISE) {
    // Smaller than 0 duration impossible
    return new DtFormattedValue(
      inputData,
      (formattedData = {
        transformedValue: inputData.input,
        displayValue: '< 1',
        displayUnit: inputUnit,
      }),
    );
  } else {
    if (!formatMethod) {
      formatMethod = DurationMode.DEFAULT;
    }
    if (formatMethod === DurationMode.PRECISE) {
      result = transformResultWithOutputUnit(
        duration,
        inputUnit,
        outputUnit,
        formatMethod,
      );
    } else if (formatMethod === DurationMode.DEFAULT) {
      if (outputUnit) {
        result = transformResultWithOutputUnit(
          duration,
          inputUnit,
          outputUnit,
          formatMethod,
        );
      } else {
        result = transformResult(duration, inputUnit, formatMethod);
      }
    } else {
      result = transformResult(duration, inputUnit, formatMethod);
    }

    // Return NO_DATA when inputUnit is invalid
    if (CONVERSION_FACTORS_TO_MS.get(inputUnit) === undefined) {
      return NO_DATA;
    }
    if (result === undefined) {
      return NO_DATA;
    }
    let resultString = '';
    result.forEach((value, key) => {
      resultString = `${resultString}${value}${key} `;
    });
    resultString = resultString.trim();
    formattedData = {
      transformedValue: inputData.input,
      displayValue: resultString,
      displayUnit: undefined,
    };
    return new DtFormattedValue(inputData, formattedData);
  }
}

/**
 * Calculates output duration in either "DEFAULT" or "CUSTOM" mode.
 * If precision is DEFAULT or undefined then display a maximum of three units, but
 * when precision is a number(custom), then display that amount of units.
 * @param duration numeric time value
 * @param inputUnit dtTimeUnit value describing which unit the duration is in
 * @param formatMethod the formatting method
 */
function transformResult(
  duration: number,
  inputUnit: DtTimeUnit,
  formatMethod: string | undefined,
): Map<DtTimeUnit, string> | undefined {
  const result = new Map<DtTimeUnit, string>();
  const conversionFactorKeys = Array.from(CONVERSION_FACTORS_TO_MS.keys());

  let rest = duration * CONVERSION_FACTORS_TO_MS.get(inputUnit)!;
  let displayedUnits = 0;
  let unitsToDisplay = CONVERSIONUNITS;

  if (
    formatMethod &&
    formatMethod !== DurationMode.DEFAULT &&
    formatMethod !== undefined
  ) {
    unitsToDisplay = parseInt(formatMethod);
  }

  for (const key of conversionFactorKeys) {
    const factor = CONVERSION_FACTORS_TO_MS.get(key)!;
    const amount = Math.trunc(rest / factor);
    if (displayedUnits < unitsToDisplay) {
      if (amount > 0) {
        result.set(key, amount.toString());
        displayedUnits++;
      } else if (displayedUnits > 0) {
        displayedUnits++;
      }
    }
    rest = rest - amount * factor;
  }

  return result;
}

/**
 * Calculates duration based on the outputUnit provided and presents the output only in that outputUnit.
 * @param duration numeric time value
 * @param inputUnit dtTimeUnit value describing which unit the duration is in
 * @param outputUnit dtTimeUnit | undefined value describing the unit to which it should format
 * @param formatMethod the formatting method
 */
function transformResultWithOutputUnit(
  duration: number,
  inputUnit: DtTimeUnit,
  outputUnit: DtTimeUnit | undefined,
  formatMethod: string,
): Map<DtTimeUnit, string> | undefined {
  let result = new Map<DtTimeUnit, string>();
  const conversionFactorKeys = Array.from(CONVERSION_FACTORS_TO_MS.keys());

  let amount = duration;

  if (inputUnit === DtTimeUnit.MILLISECOND) {
    amount = duration;
  } else if (
    conversionFactorKeys.indexOf(inputUnit) <
    conversionFactorKeys.indexOf(DtTimeUnit.MILLISECOND)
  ) {
    amount = convertToMilliseconds(duration, inputUnit, false);
  } else {
    amount = convertToMilliseconds(duration, inputUnit, true);
  }

  if (outputUnit) {
    let factor = CONVERSION_FACTORS_TO_MS.get(outputUnit)!;
    if (formatMethod === DurationMode.PRECISE) {
      amount = amount / factor;
      return result.set(outputUnit, amount.toString());
    } else {
      amount = Math.round(amount / factor);
      if (amount < 1) {
        return result.set(outputUnit, '< 1');
      }
      return result.set(outputUnit, amount.toString());
    }
  } else {
    return transformResult(
      duration,
      inputUnit,
      CONVERSION_FACTORS_TO_MS.size.toString(),
    );
  }
}

/**
 * Converts any duration to milliseconds
 * @param duration numeric time value
 * @param inputUnit dtTimeUnit value describing which unit the duration is in
 * @param isSmaller whether duration is smaller than a millisecond
 */
function convertToMilliseconds(
  duration: number,
  inputUnit: DtTimeUnit,
  isSmaller: boolean,
): number {
  let amount = duration;
  const conversionFactorKeys = Array.from(CONVERSION_FACTORS_TO_MS.keys());

  if (isSmaller) {
    if (
      conversionFactorKeys.indexOf(inputUnit) ===
      conversionFactorKeys.indexOf(DtTimeUnit.NANOSECOND)
    ) {
      amount =
        amount *
        CONVERSION_FACTORS_TO_MS.get(DtTimeUnit.NANOSECOND)! *
        CONVERSION_FACTORS_TO_MS.get(DtTimeUnit.MICROSECOND)!;
    }
    if (conversionFactorKeys.indexOf(inputUnit)) {
      amount = amount * CONVERSION_FACTORS_TO_MS.get(DtTimeUnit.MICROSECOND)!;
    }
  } else {
    amount = amount * CONVERSION_FACTORS_TO_MS.get(inputUnit)!;
  }

  return amount;
}
