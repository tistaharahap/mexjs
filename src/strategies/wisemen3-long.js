import Strategy from './base'
import Decimal from 'decimal.js'
import { UpFractal, WilliamsAlligator, Resistance } from '../indicators'

class Wisemen3Long extends Strategy {
  constructor(candlesticks, feed) {
    const highs = candlesticks.map(x => x.high)
    const lows = candlesticks.map(x => x.low)

    // Define indicators here [indicatorFunction, ['indicator', 'inputs]]
    const indicators = [
      [UpFractal, [highs]],
      [WilliamsAlligator, [highs, lows]]
    ]

    // Call super right after setting which indicators to use
    super(candlesticks, feed, indicators)

    // Anything to be calculated after indicator calculation goes here
    let lastFractal = 0.0

    const upFractals = this.candlesticks.map(x => x.UpFractal)
    const teeth = this.candlesticks.map((x) => {
      if (!x.hasOwnProperty('WilliamsAlligator')) {
        return null
      }
      return x.WilliamsAlligator.teeth
    })
    
    let resistances = Resistance(upFractals, highs, teeth)
    resistances = resistances
      .slice(0, resistances.length - 3)
    resistances
      .forEach((v, n) => {
        this.candlesticks[n]['Resistance'] = v
        if (v !== null) {
          lastFractal = v
        }
        this.candlesticks[n + 3]['LastUpFractal'] = lastFractal
      })
  }

  filter() {
    return this.breakoutCandle()
      && this.candleAboveAlligatorMouth()
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
      .greaterThan(lastCandle.LastUpFractal)

    return currentPriceAboveFractal
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
      .greaterThan(lastCandle.WilliamsAlligator.jaw)
    const lowAboveTeeth = lastCandleLow
      .greaterThan(lastCandle.WilliamsAlligator.teeth)
    const lowAboveLips = lastCandleLow
      .greaterThan(lastCandle.WilliamsAlligator.lips)

    return lowAboveJaw && lowAboveTeeth && lowAboveLips
  }
}

export default Wisemen3Long