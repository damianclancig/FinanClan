import { describe, it, expect } from 'vitest';
import es from '../locales/es.json';
import en from '../locales/en.json';
import pt from '../locales/pt.json';

describe('i18n Key Consistency', () => {
  const esKeys = Object.keys(es).sort();
  const enKeys = Object.keys(en).sort();
  const ptKeys = Object.keys(pt).sort();

  it('should have the same keys in English as in Spanish', () => {
    const missingInEn = esKeys.filter(key => !enKeys.includes(key));
    const extraInEn = enKeys.filter(key => !esKeys.includes(key));

    expect(missingInEn, `Keys present in es.json but missing in en.json`).toEqual([]);
    expect(extraInEn, `Keys present in en.json but missing in es.json`).toEqual([]);
  });

  it('should have the same keys in Portuguese as in Spanish', () => {
    const missingInPt = esKeys.filter(key => !ptKeys.includes(key));
    const extraInPt = ptKeys.filter(key => !esKeys.includes(key));

    expect(missingInPt, `Keys present in es.json but missing in pt.json`).toEqual([]);
    expect(extraInPt, `Keys present in pt.json but missing in es.json`).toEqual([]);
  });

  it('should not have empty translations', () => {
    const checkEmpty = (obj: any, lang: string) => {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'string') {
          expect(value.trim().length, `Empty translation for key "${key}" in ${lang}`).toBeGreaterThan(0);
        } else if (typeof value === 'object' && value !== null) {
          checkEmpty(value, `${lang}.${key}`);
        }
      });
    };

    checkEmpty(es, 'es');
    checkEmpty(en, 'en');
    checkEmpty(pt, 'pt');
  });
});
