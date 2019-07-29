import Strategy from './base'
import Decimal from 'decimal.js'

class PengenOpitLong extends Strategy {
  filter() {
    return this.breakoutCandle()
      && (this.candleAboveAlligatorMouth() || this.candleBreakoutAlligatorMouth())
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
    const openBelowFractal = new Decimal(lastCandle.open)
      .lessThan(lastCandle.lastUpFractal)

    return currentPriceAboveFractal && openBelowFractal
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
    const teethAboveJaw = new Decimal(lastCandle.jaw)
      .lessThan(lastCandle.teeth)
    const teethBelowLips = new Decimal(lastCandle.teeth)
      .lessThan(lastCandle.lips)

    return lowAboveJaw && lowAboveTeeth && lowAboveLips && teethAboveJaw && teethBelowLips
  }

  /**
   * The current price must be breakout alligator mouth
   * 
   * @return {boolean}
   */
  candleBreakoutAlligatorMouth() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const lastCandleLow = new Decimal(lastCandle.low)
    const lastCandleHigh = new Decimal(lastCandle.high)
    const lowBelowJaw = lastCandleLow
      .lessThan(lastCandle.jaw)
    const lowBelowTeeth = lastCandleLow
      .lessThan(lastCandle.teeth)
    const lowBelowLips = lastCandleLow
      .lessThan(lastCandle.lips)
    const highAboveJaw = lastCandleHigh
      .greaterThan(lastCandle.jaw)
    const highAboveTeeth = lastCandleHigh
      .greaterThan(lastCandle.teeth)
    const highAboveLips = lastCandleHigh
      .greaterThan(lastCandle.lips)

    return lowBelowJaw && lowBelowTeeth && lowBelowLips && highAboveJaw && highAboveTeeth && highAboveLips
  }
}

export default PengenOpitLong
