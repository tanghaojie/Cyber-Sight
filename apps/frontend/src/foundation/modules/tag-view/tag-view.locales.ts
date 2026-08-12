import { defineLocalizationResource } from '@/foundation/shared/localization/localization.resource'

export const localizationResource = defineLocalizationResource('tag-view', {
  'zh-CN': {
    'history.label': '页面标签历史',
    'close.label': '关闭{title}',
    'actions.label': '标签操作',
    'actions.closeCurrent': '关闭当前',
    'actions.closeOthers': '关闭其他',
    'actions.closeAll': '关闭全部',
  },
  'en-US': {
    'history.label': 'Page tab history',
    'close.label': 'Close {title}',
    'actions.label': 'Tab actions',
    'actions.closeCurrent': 'Close current',
    'actions.closeOthers': 'Close others',
    'actions.closeAll': 'Close all',
  },
})
