import Strategy from './base'
import Decimal from 'decimal.js'

class NektrabarLong extends Strategy {
  filter() {
    return this.fractalsLessThanOHC3()
      && this.greenCandles()
      && this.vwmaCrossCandle()
      && this.breakoutCandle()
  }

  /**
   * The last candles OHC3 must be greater than or above the last fractal
   * 
   * @return {boolean}
   */
  fractalsLessThanOHC3() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const ohc3 = (
      new Decimal(lastCandle.open)
        .add(lastCandle.high)
        .add(lastCandle.close)
    ).dividedBy(3)

    return ohc3
      .greaterThan(lastCandle.lastUpFractal)
  }

  /**
   * The last candle must be green
   * 
   * @return {boolean}
   */
  greenCandles() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    return new Decimal(lastCandle.close)
      .greaterThan(lastCandle.open)
  }

  /**
   * The last candle must be breakout
   * 
   * @return {boolean}
   */
  breakoutCandle() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const openBelowFractal = new Decimal(lastCandle.open)
      .lessThan(lastCandle.lastUpFractal)
    const closeAboveFractal = new Decimal(lastCandle.close)
      .greaterThan(lastCandle.lastUpFractal)

    return openBelowFractal && closeAboveFractal
  }

  /**
   * VMWA must be less or equal to last candle's high
   * 
   * @return {boolean}
   */
  vwmaCrossCandle() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const vwmaAboveLow = new Decimal(lastCandle.low)
      .lessThan(lastCandle.vwma)
    const vwmaBelowHigh = new Decimal(lastCandle.high)
      .greaterThan(lastCandle.vwma)
    const vwmaAboveFractal = new Decimal(lastCandle.vwma)
      .greaterThan(lastCandle.lastUpFractal)

    return vwmaAboveLow && vwmaBelowHigh && vwmaAboveFractal
  }
}

export default NektrabarLong