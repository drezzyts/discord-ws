import { WebSocket } from 'ws';
import * as Constants from '../utils/constants';
import { ShardOptions } from '../types/web-socket';
import { EventEmitter } from 'stream';
import { GatewayIdentify, GatewayIdentifyData, GatewayReceivePayload } from 'discord-api-types/v10';

export default class Shard extends EventEmitter {
  private ws?: WebSocket;

  public constructor(public options: ShardOptions) {
    super();
  }

  public async connect() {
    this.ws = new WebSocket(Constants.GATEWAY_URL);
    this.ws.on('open', this.openWsEvent.bind(this));
  }

  private openWsEvent() {
    this.identify();
    this.ws!.on('message', this.messageWsEvent.bind(this));
  }

  private messageWsEvent(data: string) {
    const payload: GatewayReceivePayload = JSON.parse(data);
    console.log(payload);
    // this.options.discordWs.emit('message', payload);
  }

  private identify() {
    const intents = this.options.client.options.intents.reduce((acc, intent) => {
      return acc | intent
    });

    const data: GatewayIdentifyData = {
      intents,
      shard: [this.options.id, this.options.client.options.shards!],
      token: this.options.client.options.token,
      properties: {
        os: 'linux',
        browser: Constants.IDENTIFY_BROWSER,
        device: Constants.IDENTIFY_DEVICE
      }
    }

    const payload: GatewayIdentify = {
      op: 2,
      d: data
    }

    this.ws!.send(JSON.stringify(payload));
  }
}