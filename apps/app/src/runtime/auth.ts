import { directusClient } from './directusClient.js';
import { config } from './config.js';
import { DirectusAuth } from '@lib/directus/DirectusAuth.js';

export const auth = new DirectusAuth(directusClient, config.authDomain);
