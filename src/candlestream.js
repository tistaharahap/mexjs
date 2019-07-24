import Rx from '@reactivex/rxjs'
import Decimal from 'decimal.js'
import { BitmexAPI } from 'bitmex-node'
import { UpFractal, DownFractal, IdealUpFractal, IdealDownFractal, VWMA, SMMA, Support, Resistance } from './indicators'
import { ADX, RSI } from 'technicalindicators'
import env from './env'

/**
 * Generate a stream of candles
 * 
 * @param {string} apiKey - Bitmex API key
 * @param {string} apiSecret - Bitmex API secret
 * @param {string} symbol  - the instrument symbol you want
 * @param {string} binSize  - the timeframe for your candles, valid options are: 1m | 5m | 1h | 1d
 * @param {number} count - The number of candles you want returned
 * 
 * @return {Rx.Observable<Array>}
 */
const generateCandleStream = (apiKey, apiSecret, symbol, binSize, count) => {
  const client = new BitmexAPI({
    apiKeyID: apiKey,
    apiKeySecret: apiSecret,
    testnet: env.testnet === 1,
  })
  const opts = {
    symbol,
    binSize,
    count,
    reverse: true,
    partial: env.tradeOnClose === '1' ? false : true,
  }
  return Rx.Observable.fromPromise(client.Trade.getBucketed(opts))
    .map((klines) => {
      klines.reverse()
      return klines
    })
    .map((klines) => {
      const highs = klines.map(x => x.high)
      const closes = klines.map(x => x.close)
      const volumes = klines.map(x => x.volume)
      const lows = klines.map(x => x.low)

      const lipsPeriod = 5
      const lipsOffset = 3
      const teethPeriod = 8
      const teethOffset = 5
      const jawsPeriod = 13
      const jawsOffset = 8

      // Get Alligator data
      let lips = SMMA(highs, lows, lipsPeriod)
      lips = lips.slice(0, lips.length - lipsOffset)
      let teeths = SMMA(highs, lows, teethPeriod)
      teeths = teeths.slice(0, teeths.length - teethOffset)
      let jaws = SMMA(highs, lows, jawsPeriod)
      jaws = jaws.slice(0, jaws.length - jawsOffset)

      lips.forEach((v, n) => {
        klines[n + lipsPeriod + lipsOffset - 1]['lips'] = new Decimal(v).toDecimalPlaces(1).toNumber()
      })
      teeths.forEach((v, n) => {
        klines[n + teethPeriod + teethOffset - 1]['teeth'] = new Decimal(v).toDecimalPlaces(1).toNumber()
      })
      jaws.forEach((v, n) => {
        klines[n + jawsPeriod + jawsOffset - 1]['jaw'] = new Decimal(v).toDecimalPlaces(1).toNumber()
      })

      let lastFractal = {
        up: 0.0,
        down: 0.0,
      }

      const vwmas = VWMA(closes, volumes, 13)
      const vwmas8 = VWMA(closes, volumes, 8)
      const upFractals = env.idealFractalsOnly === 1 ? IdealUpFractal(highs) : UpFractal(highs)
      const downFractals = env.idealFractalsOnly === 1 ? IdealDownFractal(lows) : DownFractal(lows)
      const adxs = ADX.calculate({ high: highs, low: lows, close: closes, period: 34 })
      const rsis = RSI.calculate({ values: closes, period: 14 })

      vwmas.forEach((v, n) => {
        // klines[n]['upFractal'] = n !== klines.length - 1 ? upFractals[n] : null
        // klines[n]['downFractal'] = n !== klines.length - 1 ? downFractals[n] : null
        
        // if (upFractals[n] !== null) {
        //   lastFractal.up = n !== vwmas.length - 1 ? upFractals[n] : null
        // }
        // if (downFractals[n] !== null) {
        //   lastFractal.down = n !== vwmas.length - 1 ? downFractals[n] : null
        // }

        // klines[n]['lastUpFractal'] = lastFractal.up
        // klines[n]['lastDownFractal'] = lastFractal.down
        klines[n]['vwma'] = v
        klines[n]['vwma8'] = vwmas8[n]
      })

      // Get Resistance data
      let resistances = Resistance(upFractals, highs, teeths)
      resistances = resistances.slice(0, resistances.length - 2)

      resistances.forEach((v, n) => {
        klines[n]['resistance'] = v
        if (v !== null) {
          lastFractal.up = v
        }
        klines[n+2]['lastUpFractal'] = lastFractal.up
      })

      // Get Resistance data
      let supports = Support(downFractals, lows, teeths)
      supports = supports.slice(0, supports.length - 2)

      supports.forEach((v, n) => {
        klines[n]['support'] = v
        if (v !== null) {
          lastFractal.down = v
        }
        klines[n+2]['lastDownFractal'] = lastFractal.down
      })

      klines = klines
        .map((v, i) => {
          const adx = adxs
            .slice(i - i - i)
            .slice(-1)[0]
          const rsi14 = rsis
            .slice(i - i - i)
            .slice(-1)[0]
          klines[i]['adx'] = adx.adx
          klines[i]['pdi'] = adx.pdi
          klines[i]['mdi'] = adx.mdi
          klines[i]['rsi14'] = rsi14
          return klines[i]
        })

      return klines
    })
    .catch((err) => {
      console.log(err.stack)
      return Rx.Observable.from([])
    })
}

export {
  generateCandleStream
}
