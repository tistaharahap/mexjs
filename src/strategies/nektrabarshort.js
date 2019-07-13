import Strategy from './base'
import Decimal from 'decimal.js'

class NektrabarLong extends Strategy {
  filter() {
    return this.fractalsGreaterThanOLC3()
      && this.redCandles()
      && this.vwmaBelow()
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
      .lessThan(lastCandle.lastFractal)
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
   * VMWA must be less or equal to last candle's low
   * 
   * @return {boolean}
   */
  vwmaBelow() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    return new Decimal(lastCandle.low)
      .greaterThanOrEqualTo(lastCandle.vwma)
  }
}

export default NektrabarLong
