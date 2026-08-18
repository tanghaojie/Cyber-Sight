import type { GeoPluginDefinition } from './core/geo-plugin'
import { comparePlugin } from './plugins/compare/compare.plugin'
import { geoDataPlugin } from './plugins/data/data.plugin'
import { drawingPlugin } from './plugins/drawing/drawing.plugin'
import { measurementPlugin } from './plugins/measurement/measurement.plugin'
import { modelPlugin } from './plugins/model/model.plugin'
import { geoScenePlugin } from './plugins/scene/scene.plugin'
import { terrainPlugin } from './plugins/terrain/terrain.plugin'
import { geoViewPlugin } from './plugins/view/view.plugin'

export const geoPlugins: readonly GeoPluginDefinition[] = [
  geoDataPlugin,
  geoViewPlugin,
  geoScenePlugin,
  drawingPlugin,
  measurementPlugin,
  modelPlugin,
  terrainPlugin,
  comparePlugin,
]
