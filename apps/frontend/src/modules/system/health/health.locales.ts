import { defineLocalizationResource } from '@/modules/system/localization/localization.resource'

export const localizationResource = defineLocalizationResource('health', {
  'zh-CN': {
    'errors.unreachable': '无法连接后端服务',
  },
  'en-US': {
    'errors.unreachable': 'Unable to reach the backend service',
  },
})
