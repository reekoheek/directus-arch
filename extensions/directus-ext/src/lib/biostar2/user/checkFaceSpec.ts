import type { BiostarRequest } from '../BiostarRequest.js';

export interface FaceSpec {
  image: string;
  image_template: string;
}

export function checkFaceSpec(base64Pic: string): BiostarRequest<FaceSpec> {
  const body = {
    template_ex_picture: base64Pic,
  };

  return {
    method: 'PUT',
    url: '/users/check/upload_picture',
    body,
  };
}
