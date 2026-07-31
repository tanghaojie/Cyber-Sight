import { defineLocalizationResource } from '@/modules/system/localization/localization.resource'

export const localizationResource = defineLocalizationResource('errors', {
  'zh-CN': {
    'notFound.kicker': '未找到节点',
    'notFound.title': '这个节点不在当前系统图谱中。',
    'notFound.description': '地址可能已被移动、停用，或数据库菜单尚未为你开放对应入口。',
    'notFound.home': '返回工作台',
    'notFound.back': '返回上一页',
  },
  'en-US': {
    'notFound.kicker': 'NODE NOT FOUND',
    'notFound.title': 'This node is not in the current system map.',
    'notFound.description':
      'The address may have moved, been disabled, or is not available in your database navigation.',
    'notFound.home': 'Return to dashboard',
    'notFound.back': 'Go back',
  },
})
