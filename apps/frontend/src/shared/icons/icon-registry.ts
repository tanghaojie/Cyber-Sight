import symbolIds from 'virtual:svg-icons-names'

type SvgIconNamesModule = string[] | { default?: string[] }

function unwrapSymbolIds(moduleValue: SvgIconNamesModule): string[] {
  if (Array.isArray(moduleValue)) {
    return moduleValue
  }

  return Array.isArray(moduleValue.default) ? moduleValue.default : []
}

function iconNameFromSymbolId(symbolId: string): string {
  return symbolId.startsWith('icon-') ? symbolId.slice('icon-'.length) : symbolId
}

export const iconNames = Object.freeze(
  [
    ...new Set(unwrapSymbolIds(symbolIds as SvgIconNamesModule).map(iconNameFromSymbolId)),
  ].sort(function sortIconNames(left, right) {
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
