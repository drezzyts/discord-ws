export const LIBRARY_NAME = 'discord-ws';

export const GATEWAY_VERSION = 10;
export const GATEWAY_ENCODING = 'json';
export const GATEWAY_BASE_URL = 'wss://gateway.discord.gg';
export const GATEWAY_URL = `${GATEWAY_BASE_URL}/?v=${GATEWAY_VERSION}&encoding=${GATEWAY_ENCODING}`;

export const IDENTIFY_BROWSER = LIBRARY_NAME;
export const IDENTIFY_DEVICE = LIBRARY_NAME; 