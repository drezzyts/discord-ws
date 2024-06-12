import { WebSocket } from 'ws';
import * as Constants from '../utils/constants';
import { ShardOptions } from '../types/web-socket';
import { EventEmitter } from 'stream';
import { 
  GatewayCloseCodes,
  GatewayDispatchEvents,
  GatewayHeartbeat,
  GatewayIdentify, 
  GatewayIdentifyData, 
  GatewayOpcodes, 
  GatewayReceivePayload,
  GatewayUpdatePresence,
  PresenceUpdateStatus,
} from 'discord-api-types/v10';
import { ClientPresence } from '../types/client';

export default class Shard extends EventEmitter {
  private ws?: WebSocket;
  private lastHeartbeatTimestamp: number;
  private heartbeatInterval: number;
  private offlineTimestamp: number;

  public ping: number;

  public constructor(public options: ShardOptions) {
    super();

    this.lastHeartbeatTimestamp = 0;
    this.offlineTimestamp = 0;
    this.heartbeatInterval = 0;
    this.ping = 0;
  }

  public async connect() {
    this.ws = new WebSocket(Constants.GATEWAY_URL);
    this.ws.on('open', this.gatewayOpenEvent.bind(this));
    this.ws.on('close', this.gatewayCloseEvent.bind(this));
  }

  public async updatePresence(data: ClientPresence): Promise<boolean> {
    if (!this.ws) return false;
    if (data.status == PresenceUpdateStatus.Idle) this.offlineTimestamp = Date.now();

    const payload: GatewayUpdatePresence = {
      op: GatewayOpcodes.PresenceUpdate,
      d: {
        activities: data.activities || [],
        afk: data.status == PresenceUpdateStatus.Idle,
        since: data.status == PresenceUpdateStatus.Idle ? this.offlineTimestamp : null,
        status: data.status
      },
    };

    this.ws.send(JSON.stringify(payload));
    
    return true;
  }

  private gatewayOpenEvent() {
    this.gatewayIdentify();
    this.ws!.on('message', this.gatewayMessageEvent.bind(this));
  }

  private gatewayMessageEvent(data: string) {
    const payload: GatewayReceivePayload = JSON.parse(data);
    this.options.discordWs.emit('message', payload);
    
    switch (payload.t) {
      case GatewayDispatchEvents.Ready:
        this.options.client.connectedShards++;
        this.options.client.emit('shardConnect', payload.d, this.options.id);

        if (this.options.client.connectedShards >= this.options.client.options.shards!) {
          this.options.client.connectionTimestamp = Date.now();
          this.options.client.emit('connect', payload.d.user);
        }

        break;
    }

    switch (payload.op) {
      case GatewayOpcodes.Hello:
        this.heartbeatInterval = payload.d.heartbeat_interval;
        setInterval(this.gatewayHeartbeat.bind(this), this.heartbeatInterval);
        break;
      case GatewayOpcodes.HeartbeatAck:
        this.calculateShardPing();
        break;
      case GatewayOpcodes.InvalidSession:
        this.gatewayIdentify();
        break;
    }
  }

  private gatewayCloseEvent(code: GatewayCloseCodes, reason: Buffer) {
    switch (code) {
      case GatewayCloseCodes.AuthenticationFailed:
        return console.error(`[error-${code}] Authentication Failed, Shard: ${this.options.id}\n Reason: ${reason}`);
      default:
        return console.error(`[error-${code}] Shard: ${this.options.id}, Reason: ${reason}`);
    }
  }

  private calculateShardPing() {
    if (!this.heartbeatInterval)
      this.ping = 1;
    else
      this.ping = Date.now() - this.lastHeartbeatTimestamp;
  }

  private gatewayIdentify() {
    const intents = this.options.client.options.intents.reduce((acc, intent) => {
      return acc | intent
    });

    const data: GatewayIdentifyData = {
      intents,
      shard: [this.options.id, this.options.client.options.shards!],
      token: this.options.client.options.token,
      properties: {
        os: Constants.IDENTIFY_OS,
        browser: Constants.IDENTIFY_BROWSER,
        device: Constants.IDENTIFY_DEVICE
      }
    }

    const payload: GatewayIdentify = {
      op: GatewayOpcodes.Identify,
      d: data
    }

    this.ws!.send(JSON.stringify(payload));
  }

  private gatewayHeartbeat() {
    const payload: GatewayHeartbeat = {
      op: GatewayOpcodes.Heartbeat,
      d: null
    }

    this.lastHeartbeatTimestamp = Date.now();
    this.ws!.send(JSON.stringify(payload));
  }
}