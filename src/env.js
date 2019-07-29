import packageJson from '../package.json'
import os from 'os'

const env = {
  apiKey: process.env.API_KEY || 'API_KEY',
  apiSecret: process.env.API_SECRET || 'API_SECRET',
  candleIntervalInSeconds: process.env.CANDLE_INTERVAL_IN_SECONDS || 10,
  tf: process.env.TF || '5m',
  symbol: process.env.SYMBOL || 'XBTUSD',
  tpStrategy: process.env.TP_STRATEGY || 'PERCENTAGE',
  tpInPercentage: parseFloat(process.env.TP_IN_PERCENTAGE || 0.2),
  tpInPip: parseFloat(process.env.TP_IN_PIP || 20.0),
  slStrategy: process.env.SL_STRATEGY || 'PERCENTAGE',
  slInPercentage: parseFloat(process.env.SL_IN_PERCENTAGE || 0.2),
  slInPip: parseFloat(process.env.SL_IN_PIP || 20.0),
  useTestnet: process.env.USE_TESTNET || 0,
  orderQuantity: process.env.ORDER_QUANTITY || 100,
  margin: process.env.MARGIN || 50,
  version: packageJson.version,
  strategy: process.env.STRATEGY || 'nektrabar-long',
  tradeOnClose: process.env.TRADE_ON_CLOSE || 1,
  orderRetries: process.env.ORDER_RETRIES || 3,
  idealFractalsOnly: process.env.IDEAL_FRACTALS_ONLY || 0,
  name: process.env.NAME || os.hostname(),
}

export default env
