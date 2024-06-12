import { EventEmitter } from "stream";
import Shard from "./Shard";
import Client from "../structs/Client";
import { ClientPresence } from "../types/client";

export default class DiscordWebSocket extends EventEmitter {
  public shards: Map<number, Shard>;

  public constructor(public client: Client) {
    super();
    this.shards = new Map();
  }

  public async connect() {
    for (let id = 0; id < this.client.options.shards!; id++) {
      const shard = new Shard({ client: this.client, discordWs: this, id });
      await shard.connect();
      this.shards.set(id, shard);
    }
  }

  public async updatePresence(data: ClientPresence): Promise<boolean> {
    for (const shard of this.shards.values()) {
      const result = await shard.updatePresence(data);
      if (!result) return false;
    }

    return true;
  }
}