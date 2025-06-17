import type { EndpointExtensionContext, HookExtensionContext } from '@directus/extensions';
import type { Service } from './Service.js';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function lookupUserService<T = any>(ctx: HookExtensionContext | EndpointExtensionContext) {
  const schema = await ctx.getSchema();
  const service = new ctx.services.UsersService({ schema, knex: ctx.database });
  return service as Service<T>;
}
