import Strategy from './base'
import Decimal from 'decimal.js'
import { DownFractal, WilliamsAlligator, Support } from '../indicators'

class Wisemen3Short extends Strategy {
  constructor(candlesticks, feed) {
    const highs = candlesticks.map(x => x.high)
    const lows = candlesticks.map(x => x.low)

    // Define indicators here [indicatorFunction, ['indicator', 'inputs]]
    const indicators = [
      [DownFractal, [lows]],
      [WilliamsAlligator, [highs, lows]]
    ]

    // Call super right after setting which indicators to use
    super(candlesticks, feed, indicators)

    // Anything to be calculated after indicator calculation goes here
    let lastFractal = 0.0

    const downFractals = this.candlesticks.map(x => x.DownFractal)
    const teeth = this.candlesticks.map((x) => {
      if (!x.hasOwnProperty('WilliamsAlligator')) {
        return null
      }
      return x.WilliamsAlligator.teeth
    })
    
    let supports = Support(downFractals, lows, teeth)
    supports = supports
      .slice(0, supports.length - 3)
    supports
      .forEach((v, n) => {
        this.candlesticks[n]['Support'] = v
        if (v !== null) {
          lastFractal = v
        }
        this.candlesticks[n + 3]['LastDownFractal'] = lastFractal
      })
  }

  filter() {
    return this.breakoutCandle()
      && this.candleBelowAlligatorMouth()
  }

  /**
   * The current price must be breakout fractal
   * 
   * @return {boolean}
   */
  breakoutCandle() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const currentPrice = new Decimal(this.feed.data[0].price)
    const currentPriceBelowFractal = currentPrice
      .lessThan(lastCandle.LastDownFractal)

    return currentPriceBelowFractal
  }

  /**
   * The current price must be below alligator mouth
   * 
   * @return {boolean}
   */
  candleBelowAlligatorMouth() {
    const lastCandle = this.candlesticks[this.candlesticks.length - 1]
    const lastCandleHigh = new Decimal(lastCandle.high)
    const highBelowJaw = lastCandleHigh
      .lessThan(lastCandle.WilliamsAlligator.jaw)
    const highBelowTeeth = lastCandleHigh
      .lessThan(lastCandle.WilliamsAlligator.teeth)
    const highBelowLips = lastCandleHigh
      .lessThan(lastCandle.WilliamsAlligator.lips)

    return highBelowJaw && highBelowTeeth && highBelowLips
  }
}

export default Wisemen3Short