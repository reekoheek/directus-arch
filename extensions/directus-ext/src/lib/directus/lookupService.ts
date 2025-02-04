import type { EndpointExtensionContext, HookExtensionContext } from '@directus/extensions';
import type { Service } from './Service.js';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function lookupService<T = any>(ctx: HookExtensionContext | EndpointExtensionContext, collection: string) {
  const schema = await ctx.getSchema();
  const service = new ctx.services.ItemsService(collection, { schema, knex: ctx.database });
  return service as Service<T>;
}
