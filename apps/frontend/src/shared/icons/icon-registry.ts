import symbolIds from 'virtual:svg-icons-names'

function iconNameFromSymbolId(symbolId: string): string {
  return symbolId.startsWith('icon-') ? symbolId.slice('icon-'.length) : symbolId
}

export const iconNames = Object.freeze(
  [...new Set(symbolIds.map(iconNameFromSymbolId))].sort(function sortIconNames(left, right) {
    return left.localeCompare(right)
  }),
)

const iconNameSet = new Set(iconNames)

export const iconOptions = Object.freeze(
  iconNames.map(function toIconOption(name) {
    return { value: name, label: name }
  }),
)

export function resolveIconName(name: string): string {
  return iconNameSet.has(name) ? name : 'alert'
}
