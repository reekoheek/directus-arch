import type { EndpointExtensionContext, HookExtensionContext } from '@directus/extensions';
import type { Mailer } from './Mailer.js';

export async function lookupMailer(ctx: HookExtensionContext | EndpointExtensionContext): Promise<Mailer> {
  const { MailService } = ctx.services;
  const schema = await ctx.getSchema();
  return new MailService({ schema });
}
