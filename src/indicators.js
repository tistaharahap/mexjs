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
  return closes.map((v, i) => {
    if (i < period) {
      return (v * volumes[i]) / volumes[i]
    }

    const firstIndex = i - period
    const closesWithPeriod = closes
      .slice(firstIndex,i)
    const volsWithPeriod = volumes
      .slice(firstIndex,i)
    const closesValue = closesWithPeriod
      .reduce((x, y, i) => {
        const cv = y * volsWithPeriod[i]
        return x + cv
      }, 0)
    const volsValue = volsWithPeriod
      .reduce((x, y) => x + y, 0)

    const value = closesValue / volsValue

    return value
  })
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
    .map(x => parseFloat(x))
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
    .map(x => parseFloat(x))
    .map((v, n) => {
      if (n + 3 > highs.length) {
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
