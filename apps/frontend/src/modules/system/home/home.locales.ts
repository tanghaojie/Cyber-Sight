import { defineLocalizationResource } from '@/modules/system/localization/localization.resource'

export const localizationResource = defineLocalizationResource('home', {
  'zh-CN': {
    'overview.label': '工作台总览',
    'hero.kicker': '系统简报',
    'hero.lineOne': '让系统脉络可见，',
    'hero.lineTwo': '让每次变更有据可循。',
    'hero.description': '{name} 已连接数据库菜单、模块边界与统一运行时契约。',
    'hero.systemIndex': '系统索引',
    'hero.activeNodes': '活跃节点',
    'cards.externalResource': '外部资源',
    'views.home': '工作台总览',
  },
  'en-US': {
    'overview.label': 'Dashboard overview',
    'hero.kicker': 'SYSTEM BRIEF',
    'hero.lineOne': 'Make the system visible.',
    'hero.lineTwo': 'Make every change traceable.',
    'hero.description':
      '{name} connects database navigation, module boundaries, and unified runtime contracts.',
    'hero.systemIndex': 'SYSTEM INDEX',
    'hero.activeNodes': 'ACTIVE NODES',
    'cards.externalResource': 'EXTERNAL RESOURCE',
    'views.home': 'Dashboard overview',
  },
})
