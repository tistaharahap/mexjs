import packageJson from '../package.json'
import os from 'os'

const env = {
  apiKey: process.env.API_KEY || '-9xx_XEcnO1nC2DhA4W-YgNU',
  apiSecret: process.env.API_SECRET || '7iRpLObkNT26lPdVzas2-XyN6enQGzgM3wOt3abWcEAYAZXg',
  candleIntervalInSeconds: process.env.CANDLE_INTERVAL_IN_SECONDS || 10,
  tf: process.env.TF || '5m',
  symbol: process.env.SYMBOL || 'XBTUSD',
  tpInPercentage: parseFloat(process.env.TP_IN_PERCENTAGE || 0.4),
  slInPercentage: parseFloat(process.env.SL_IN_PERCENTAGE || 0.5),
  useTestnet: process.env.USE_TESTNET || 1,
  orderQuantity: process.env.ORDER_QUANTITY || 50,
  margin: process.env.MARGIN || 50,
  version: packageJson.version,
  strategy: process.env.STRATEGY || 'fractalbreakout-long',
  tradeOnClose: process.env.TRADE_ON_CLOSE || 1,
  orderRetries: process.env.ORDER_RETRIES || 3,
  idealFractalsOnly: parseInt(process.env.IDEAL_FRACTALS_ONLY, 10) || 0,
  name: process.env.NAME || os.hostname(),
}

export default env
