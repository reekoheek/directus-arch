import type { BiostarRequest } from '../BiostarRequest.js';

export function registerFaceTemplate(userId: string, base64Pic: string): BiostarRequest {
  const body = {
    User: {
      photo: base64Pic,
      credentials: {
        visualFaces: [
          {
            template_ex_picture: base64Pic,
            useProfile: 'false',
          },
        ],
      },
    },
  };

  return {
    method: 'PUT',
    url: `/users/${userId}`,
    body,
  };
}
