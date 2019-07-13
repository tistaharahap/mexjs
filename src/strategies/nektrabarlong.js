import Strategy from './base'
import Decimal from 'decimal.js'

class NektrabarLong extends Strategy {
  filter() {
    return this.newTradesWithPricesAboveTheLastFractal()
      && this.fractalsLessThanOHC3()
      && this.greenCandles()
      && this.vwmaUnder()
  }

  /**
   * The last trade prices must be above the last fractal
   * 
   * @return {boolean}
   */
  newTradesWithPricesAboveTheLastFractal() {
    return new Decimal(this.feed.data[0].price)
      .greaterThanOrEqualTo(this.candlesticks[this.candlesticks.length - 1].lastFractal)
  }

  /**
   * The last candles OHC3 must be greater than the last fractal
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
      .greaterThan(lastCandle.lastFractal)
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
  vwmaUnder() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    return new Decimal(lastCandle.high)
      .lessThanOrEqualTo(lastCandle.vwma)
  }
}

export default NektrabarLong
