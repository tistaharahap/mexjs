import Strategy from './base'
import Decimal from 'decimal.js'

class NektrabarLong extends Strategy {
  filter() {
    return this.fractalsLessThanOHC3()
      && this.greenCandles()
      && this.vwmaAbove()
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
   * VMWA must be less or equal to last candle's high
   * 
   * @return {boolean}
   */
  vwmaAbove() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    return new Decimal(lastCandle.high)
      .lessThanOrEqualTo(lastCandle.vwma)
  }
}

export default NektrabarLong
