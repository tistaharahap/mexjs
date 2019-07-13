import { SMA } from 'technicalindicators'

/**
 * Generate Volume Weighted Moving Average values for given time series
 * 
 * @param {Array} closes - Candle closes
 * @param {Array} volumes - Candle volumes
 * @param {Number} period  - The period of the MA
 * 
 * @return {Array}
 */
const VWMA = (closes, volumes, period) => {
  let closes_volumes = []
  closes.forEach((x, i) => {
    closes_volumes.push(x * volumes[i])
  })
  const closes_volumes_ma = SMA.calculate({ period: period, values: closes_volumes })
  const volumes_ma = SMA.calculate({ period: period, values: volumes })

  let vwmas = []
  closes_volumes_ma.forEach((x, i) => {
    vwmas.push(x / volumes_ma[i])
  })

  return vwmas
}

/**
 * Generate fractals for long positions
 * 
 * @param {Array} highs - Candle highs
 * 
 * @return {Array}
 */
const UpFractal = (highs) => {
  return highs
    .map((v, n) => {
      if (n + 3 > highs.length) {
        return null
      }

      const up1 = ((highs[n - 2] < highs[n]) && (highs[n - 1] < highs[n]) && (highs[n + 1] < highs[n]) && (
        highs[n + 2] < highs[n]))
      const up2 = ((highs[n - 3] < highs[n]) && (highs[n - 2] < highs[n]) && (highs[n - 1] === highs[n]) && (
        highs[n + 1] < highs[n]) && (highs[n + 2] < highs[n]))
      const up3 = ((highs[n - 4] < highs[n]) && (highs[n - 3] < highs[n]) && (highs[n - 2] === highs[n]) && (
        highs[n - 1] <= highs[n]) && (highs[n + 1] < highs[n]) && (highs[n + 2] < highs[n]))
      const up4 = ((highs[n - 5] < highs[n]) && (highs[n - 4] < highs[n]) && (highs[n - 3] === highs[n]) && (
        highs[n - 2] == highs[n]) && (highs[n - 1] <= highs[n]) && (highs[n + 1] < highs[n]) && (
          highs[n + 2] < highs[n]))
      const up5 = ((highs[n - 6] < highs[n]) && (highs[n - 5] < highs[n]) && (highs[n - 4] === highs[n]) && (
        highs[n - 3] <= highs[n]) && (highs[n - 2] == highs[n]) && (highs[n - 1] <= highs[n]) && (
          highs[n + 1] < highs[n]) && (highs[n + 2] < highs[n]))

      if (up1 || up2 || up3 || up4 || up5) {
        return v
      }

      return null
    })
}

/**
 * Generate fractals for short positions
 * 
 * @param {Array} lows - Candle lows
 * 
 * @return {Array}
 */
const DownFractal = (lows) => {
  return lows
    .map((v, n) => {
      if (n + 3 > lows.length) {
        return null
      }

      const low1 = ((lows[n - 2] > lows[n]) && (lows[n - 1] > lows[n]) && (lows[n + 1] > lows[n]) && (
        lows[n + 2] > lows[n]))
      const low2 = ((lows[n - 3] > lows[n]) && (lows[n - 2] > lows[n]) && (lows[n - 1] === lows[n]) && (
        lows[n + 1] > lows[n]) && (lows[n + 2] > lows[n]))
      const low3 = ((lows[n - 4] > lows[n]) && (lows[n - 3] > lows[n]) && (lows[n - 2] === lows[n]) && (
        lows[n - 1] >= lows[n]) && (lows[n + 1] > lows[n]) && (lows[n + 2] > lows[n]))
      const low4 = ((lows[n - 5] > lows[n]) && (lows[n - 4] > lows[n]) && (lows[n - 3] === lows[n]) && (
        lows[n - 2] == lows[n]) && (lows[n - 1] >= lows[n]) && (lows[n + 1] > lows[n]) && (
          lows[n + 2] > lows[n]))
      const low5 = ((lows[n - 6] > lows[n]) && (lows[n - 5] > lows[n]) && (lows[n - 4] === lows[n]) && (
        lows[n - 3] >= lows[n]) && (lows[n - 2] == lows[n]) && (lows[n - 1] >= lows[n]) && (
          lows[n + 1] > lows[n]) && (lows[n + 2] > lows[n]))

      if (low1 || low2 || low3 || low4 || low5) {
        return v
      }

      return null
    })
}

export {
  VWMA,
  UpFractal,
  DownFractal,
}
