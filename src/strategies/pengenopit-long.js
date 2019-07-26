import Strategy from './base'
import Decimal from 'decimal.js'

class PengenOpitLong extends Strategy {
  filter() {
    return this.breakoutCandle()
      && this.candleAboveAlligatorMouth()
      && this.breakoutVWMA()
  }

  /**
   * The current price must be breakout fractal
   * 
   * @return {boolean}
   */
  breakoutCandle() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const currentPrice = new Decimal(this.feed.data[0].price)
    const currentPriceAboveFractal = currentPrice
      .greaterThan(lastCandle.lastUpFractal)

    return currentPriceAboveFractal
  }

  /**
   * The current candle must be breakout vwma 21
   * 
   * @return {boolean}
   */
  breakoutVWMA() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const lowBelowVWMA21 = new Decimal(lastCandle.low)
      .lessThan(lastCandle.vwma21)
    const highAboveVWMA21 = new Decimal(lastCandle.high)
      .greaterThan(lastCandle.vwma21)

    return lowBelowVWMA21 && highAboveVWMA21
  }

  /**
   * The current price must be above alligator mouth
   * 
   * @return {boolean}
   */
  candleAboveAlligatorMouth() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const lastCandleLow = new Decimal(lastCandle.low)
    const lowAboveJaw = lastCandleLow
      .greaterThan(lastCandle.jaw)
    const lowAboveTeeth = lastCandleLow
      .greaterThan(lastCandle.teeth)
    const lowAboveLips = lastCandleLow
      .greaterThan(lastCandle.lips)

    return lowAboveJaw && lowAboveTeeth && lowAboveLips
  }
}

export default PengenOpitLong