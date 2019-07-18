import env from '../env'
import { signatureForWebsocketAuth } from '../utils'
import Rx from '@reactivex/rxjs'
import WebSocket from 'ws'
import qs from 'querystring'
import { filter } from '@reactivex/rxjs/dist/package/operator/filter';

const apiKey = '-9xx_XEcnO1nC2DhA4W-YgNU'
const apiSecret = '7iRpLObkNT26lPdVzas2-XyN6enQGzgM3wOt3abWcEAYAZXg'

const opts = {
  url: 'wss://testnet.bitmex.com/realtime',
  WebSocketCtor: WebSocket,
}

const AUTHORIZED = false
const socket$ = Rx.Observable.webSocket(opts)
  .filter(res => !AUTHORIZED ? res.success === true : AUTHORIZED)

socket$.subscribe(
  res => console.log(res),
  () => console.error('Oops..')
)
const signature = signatureForWebsocketAuth(apiSecret)
console.log(signature)
const subsOpts = JSON.stringify({ 
  op: 'authKeyExpires', 
  args: [
    apiKey, 
    signature.expires, 
    signature.signature,
  ] 
})
console.log(subsOpts)
socket$.next(subsOpts)
