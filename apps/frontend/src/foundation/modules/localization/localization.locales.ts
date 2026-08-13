import { defineLocalizationResource } from '@/foundation/shared/localization/localization.resource'

export const localizationResource = defineLocalizationResource('localization', {
  'zh-CN': {
    'switcher.label': '切换界面语言',
    'switcher.zh-CN': '切换到中文',
    'switcher.en-US': 'Switch to English',
    'creator.createdBy': '创作者',
  },
  'en-US': {
    'switcher.label': 'Switch interface language',
    'switcher.zh-CN': '切换到中文',
    'switcher.en-US': 'Switch to English',
    'creator.createdBy': 'CREATED BY',
  },
})
