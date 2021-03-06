import Strategy from './base'
import Decimal from 'decimal.js'

class NektrabarShort extends Strategy {
  filter() {
    return this.fractalsGreaterThanOLC3()
      && this.redCandles()
      && this.vwmaCrossCandle()
      && this.breakoutCandle()
  }

  /**
   * The last candles OLC3 must be less than or below the last fractal
   * 
   * @return {boolean}
   */
  fractalsGreaterThanOLC3() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const olc3 = (
      new Decimal(lastCandle.open)
        .add(lastCandle.low)
        .add(lastCandle.close)
    ).dividedBy(3)

    return olc3
      .lessThan(lastCandle.lastDownFractal)
  }

  /**
   * The last candle must be red
   * 
   * @return {boolean}
   */
  redCandles() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    return new Decimal(lastCandle.open)
      .greaterThan(lastCandle.close)
  }

  /**
   * The last candle must be breakout
   * 
   * @return {boolean}
   */
  breakoutCandle() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    return new Decimal(lastCandle.high)
      .greaterThan(lastCandle.lastDownFractal)
  }

  /**
   * VMWA must be less or equal to last candle's low
   * 
   * @return {boolean}
   */
  vwmaCrossCandle() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const vwmaAboveLow = new Decimal(lastCandle.low)
      .lessThanOrEqualTo(lastCandle.vwma)
    const vwmaBelowHigh = new Decimal(lastCandle.high)
      .greaterThanOrEqualTo(lastCandle.vwma)

    return vwmaAboveLow && vwmaBelowHigh
  }
}

export default NektrabarShort