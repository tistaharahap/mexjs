import packageJson from '../package.json'
import os from 'os'

const env = {
  apiKey: process.env.API_KEY || 'aK-fz1BnkySpjH1hUh3eIKva',
  apiSecret: process.env.API_SECRET || '2wOWrzZZQXn9HcbBS5G7xS42bw3OCA1ectCzrA9TcWt5ABek',
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
  idealFractalsOnly: process.env.IDEAL_FRACTALS_ONLY || 0,
  name: process.env.NAME || os.hostname(),
  vwmaSlBuffer: parseFloat(process.env.VWMA_SL_BUFFER) || 0.0,
}

export default env
