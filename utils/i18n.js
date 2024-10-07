import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";

import common_en from '@assets/locales/en/common.json'
import common_fr from '@assets/locales/fr/common.json'
import common_de from '@assets/locales/de/common.json'
import common_es from '@assets/locales/es/common.json'
import common_ru from '@assets/locales/ru/common.json'
import common_it from '@assets/locales/it/common.json'
import common_vi from '@assets/locales/vi/common.json'

import phrases_en from '@assets/locales/en/phrases.json'
import phrases_fr from '@assets/locales/fr/phrases.json'
import phrases_de from '@assets/locales/de/phrases.json'
import phrases_es from '@assets/locales/es/phrases.json'
import phrases_ru from '@assets/locales/ru/phrases.json'
import phrases_it from '@assets/locales/it/phrases.json'
import phrases_vi from '@assets/locales/vi/phrases.json'


i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        common: common_en,
        phrases: phrases_en
      },
      fr: {
        common: common_fr,
        phrases: phrases_fr
      },
      ge: {
        common: common_de,
        phrases: phrases_de
      },
      sp: {
        common: common_es,
        phrases: phrases_es
      },
      ru: {
        common: common_ru,
        phrases: phrases_ru
      },
      it: {
        common: common_it,
        phrases: phrases_it
      },
      vi: {
        common: common_vi,
        phrases: phrases_vi
      }
    },
    ns: ['common', 'phrases'],
    defaultNS: "common",
    lng: "en",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;