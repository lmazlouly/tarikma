import { setRTLTextPlugin, getRTLTextPluginStatus } from 'maplibre-gl'

const RTL_PLUGIN_URL =
  'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js'

export function ensureRTLPlugin(): void {
  if (getRTLTextPluginStatus() === 'unavailable') {
    setRTLTextPlugin(RTL_PLUGIN_URL, true)
  }
}
