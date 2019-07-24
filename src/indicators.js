import { SMA, AwesomeOscillator, WEMA } from 'technicalindicators'
import Decimal from 'decimal.js'

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
      if (n + 3 >= highs.length) {
        return null
      }

      if (highs[n - 2] === undefined || highs[n - 1] === undefined || highs[n + 1] === undefined || highs[n + 2] === undefined) {
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
      if (n + 3 >= lows.length) {
        return null
      }

      if (lows[n - 2] === undefined || lows[n - 1] === undefined || lows[n + 1] === undefined || lows[n + 2] === undefined) {
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

/**
 * Generate ideal up fractals only for long positions
 * 
 * @param {Array} highs - Candle highs
 * 
 * @return {Array}
 */
const IdealUpFractal = (highs) => {
  return highs
    .map(x => parseFloat(x))
    .map((v, n) => {
      if (n + 3 >= highs.length) {
        return null
      }

      if (highs[n - 2] === undefined || highs[n - 1] === undefined || highs[n + 1] === undefined || highs[n + 2] === undefined) {
        return null
      }

      const up1 = (highs[n - 2] < highs[n]) && (highs[n - 1] < highs[n]) && (highs[n + 1] < highs[n]) && (
        highs[n + 2] < highs[n]) && (highs[n - 2] < highs[n - 1]) && (highs[n + 2] < highs[n + 1])

      return up1 ? v : null
    })
}

/**
 * Generate ideal down fractals only for short positions
 * 
 * @param {Array} lows - Candle lows
 * 
 * @return {Array}
 */
const IdealDownFractal = (lows) => {
  return lows
    .map(x => parseFloat(x))
    .map((v, n) => {
      if (n + 3 >= lows.length) {
        return null
      }

      if (lows[n - 2] === undefined || lows[n - 1] === undefined || lows[n + 1] === undefined || lows[n + 2] === undefined) {
        return null
      }

      const low1 = (lows[n - 2] > lows[n]) && (lows[n - 1] > lows[n]) && (lows[n + 1] > lows[n]) && (
        lows[n + 2] > lows[n]) && (lows[n + 2] > lows[n + 1]) && (lows[n - 2] > lows[n - 1])

      return low1 ? v : null
    })
}

/**
 * Generate AC
 * 
 * @param {Array} highs - Candle highs
 * @param {Array} lows - Candle lows
 * @param {Number} fastPeriod  - The period of the MA
 * @param {Number} slowPeriod  - The period of the MA
 * @param {Number} smoothPeriod  - The period of the MA
 * 
 * @return {Array}
 */
const AccelerationDecelerationOscillator = (highs, lows, fastPeriod, slowPeriod, smoothPeriod) => {
  const ao = AwesomeOscillator.calculate({ fastPeriod: fastPeriod, high: highs, low: lows, slowPeriod: slowPeriod })
  const ao_sma = SMA.calculate({ values: ao, period: smoothPeriod })
  let ac = []
  ao.forEach((x, i) => {
    ac.push(x - ao_sma[i - smoothPeriod + 1])
  })
  return ac
}

/**
 * Generate market facilitation index
 * 
 * @param {Array} highs - Candle highs
 * @param {Array} lows - Candle lows
 * @param {Array} volumes - Candle volumes
 * 
 * @return {Array}
 */
const MarketFacilitationIndex = (highs, lows, volumes) => {
  return highs
    .map((v, n) => {
      const MFI0 = (v - lows[n]) / volumes[n]
      const MFI1 = (highs[n - 1] - lows[n - 1]) / volumes[n - 1]
      const MFIplus = MFI0 > MFI1
      const MFIminus = MFI0 < MFI1
      const volplus = volumes[n] > volumes[n - 1]
      const volminus = volumes[n] < volumes[n - 1]
      if (volplus && MFIplus) return 1 // Green MFI
      if (volminus && MFIminus) return 2 // Fade MFI
      if (volminus && MFIplus) return 3 // Fake MFI
      if (volplus && MFIminus) return 4 // Squat MFI

      return 0
    })
}

/**
 * Generate smoothed moving average
 * 
 * @param {Array} highs - Candle highs
 * @param {Array} lows - Candle lows
 * @param {Array} period - Period of MA
 * 
 * @return {Array}
 */
const SMMA = (highs, lows, period) => {
  let median_prices = []
  highs.forEach((x, i) => {
    median_prices.push((x + lows[i]) / 2)
  })
  return WEMA.calculate({ values: median_prices, period: period })
}

/**
 * Generate resistance
 * 
 * @param {Array} fractals - Candle fractals
 * @param {Array} closes - Candle closes
 * @param {Array} teeths - Candle teeths
 * 
 * @return {Array}
 */
const Resistance = (fractals, closes, teeths) => {
  let resistances = []
  fractals.forEach((v, n) => {
    const closeAboveTeeth = teeths[n - 12] ? new Decimal(closes[n])
      .greaterThan(teeths[n - 12]) : false

    if (v !== null && closeAboveTeeth) {
      resistances.push(v)
    }
    else {
      resistances.push(null)
    }
  })
  return resistances
}

/**
 * Generate support
 * 
 * @param {Array} fractals - Candle fractals
 * @param {Array} closes - Candle closes
 * @param {Array} teeths - Candle teeths
 * 
 * @return {Array}
 */
const Support = (fractals, closes, teeths) => {
  let supports = []
  fractals.forEach((v, n) => {
    const closeBelowTeeth = teeths[n - 12] ? new Decimal(closes[n])
      .lessThan(teeths[n - 12]) : false

    if (v !== null && closeBelowTeeth) {
      supports.push(v)
    }
    else {
      supports.push(null)
    }
  })
  return supports
}

export {
  VWMA,
  UpFractal,
  DownFractal,
  IdealUpFractal,
  IdealDownFractal,
  Support,
  Resistance,
  SMMA,
  MarketFacilitationIndex,
  AccelerationDecelerationOscillator,
}
