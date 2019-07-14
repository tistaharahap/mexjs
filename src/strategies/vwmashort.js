import Strategy from './base'
import Decimal from 'decimal.js'

class VMWAShort extends Strategy {
  filter() {
    return this.newTradesWithPricesLowerTheLastFractal() &&
      this.adxIsAbove30() &&
      this.VWMAIsAboveLow() &&
      this.pmdiIsFavorable()
  }

  /**
   * The last trade prices must be below the last fractal
   * 
   * @return {boolean}
   */
  newTradesWithPricesLowerTheLastFractal() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    return new Decimal(this.feed.data[0].price)
      .lessThan(lastCandle.lastDownFractal)
  }

  /**
   * ADX is above 30
   * 
   * @return {boolean}
   */
  adxIsAbove30() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    return new Decimal(lastCandle.adx)
      .greaterThanOrEqualTo(30)
  }

  /**
   * VWMA is less than Low
   * 
   * @return {boolean}
   */
  VWMAIsAboveLow() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    return new Decimal(lastCandle.vwma)
      .lessThanOrEqualTo(lastCandle.low)
  }

  /**
   * (P|M)DI is favorable
   * 
   * @return {boolean}
   */
  pmdiIsFavorable() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const candleBeforeLastCandle = this.candlesticks[this.candlesticks.length - 2]
    return new Decimal(lastCandle.mdi)
      .greaterThan(candleBeforeLastCandle.mdi) &&
      new Decimal(lastCandle.pdi)
        .lessThan(candleBeforeLastCandle.pdi) &&
      new Decimal(lastCandle.mdi)
        .greaterThanOrEqualTo(30.0)
  }
}

export default VMWAShort
