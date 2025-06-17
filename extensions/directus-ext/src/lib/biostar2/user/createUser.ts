import type { BiostarRequest } from '../BiostarRequest.js';

export interface CreateUserParam {
  id: string;
  groupId: string;
  name: string;
  startTime: Date;
  expiryTime: Date;
  accessGroupId?: string;
  pin?: string;
  tzOffset?: number;
}

export function createUser(param: CreateUserParam): BiostarRequest {
  const tzOffset = param.tzOffset ?? 0;
  const tzOffsetMillis = tzOffset * 1000 * 60 * 60;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const body: any = {
    User: {
      user_id: param.id,
      name: param.name,
      user_group_id: { id: param.groupId },
      start_datetime: new Date(param.startTime.getTime() + tzOffsetMillis).toJSON(),
      expiry_datetime: new Date(param.expiryTime.getTime() + tzOffsetMillis).toJSON(),
    },
  };

  if (param.accessGroupId) {
    body.User.access_groups = [{ id: param.accessGroupId }];
  }

  if (param.pin) {
    body.User.pin = param.pin;
  }

  return {
    method: 'POST',
    url: '/users',
    body,
  };
}
