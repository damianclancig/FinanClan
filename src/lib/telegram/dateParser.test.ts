/*
 * Copyright 2026 Clancig FullstackWeb
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it, expect } from 'vitest';
import { parseDateExpression } from './dateParser';

describe('parseDateExpression Timezone Handling', () => {
  it('should parse "hoy" relative to different timezones correctly', () => {
    // 2026-07-07T01:30:00.000Z (July 6th 22:30 in Argentina UTC-3)
    const referenceUTC = new Date('2026-07-07T01:30:00.000Z');

    // In Argentina (UTC-3), it is July 6th at 22:30.
    // So "hoy" should resolve to July 6th midnight local -> 2026-07-06T03:00:00.000Z.
    const argentinaDate = parseDateExpression('hoy', referenceUTC, 'America/Argentina/Buenos_Aires');
    expect(argentinaDate?.toISOString()).toBe('2026-07-06T03:00:00.000Z');

    // In Spain (UTC+2 / CEST in summer), it is July 7th at 03:30.
    // So "hoy" should resolve to July 7th midnight local -> 2026-07-06T22:00:00.000Z.
    const spainDate = parseDateExpression('hoy', referenceUTC, 'Europe/Madrid');
    expect(spainDate?.toISOString()).toBe('2026-07-06T22:00:00.000Z');
  });

  it('should parse "ayer" relative to different timezones correctly', () => {
    // 2026-07-07T01:30:00.000Z (July 6th 22:30 in Argentina UTC-3)
    const referenceUTC = new Date('2026-07-07T01:30:00.000Z');

    // Argentina "ayer" (from July 6th) -> July 5th midnight local -> 2026-07-05T03:00:00.000Z
    const argentinaDate = parseDateExpression('ayer', referenceUTC, 'America/Argentina/Buenos_Aires');
    expect(argentinaDate?.toISOString()).toBe('2026-07-05T03:00:00.000Z');

    // Spain "ayer" (from July 7th) -> July 6th midnight local -> 2026-07-05T22:00:00.000Z
    const spainDate = parseDateExpression('ayer', referenceUTC, 'Europe/Madrid');
    expect(spainDate?.toISOString()).toBe('2026-07-05T22:00:00.000Z');
  });
});
