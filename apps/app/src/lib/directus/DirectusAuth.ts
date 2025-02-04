import { readMe, type AuthenticationClient, type RestClient } from '@directus/sdk';
import type { Auth } from '@lib/auth/Auth.js';
import type { Claims } from '@lib/auth/Claims.js';
import { UnauthorizedError } from '@lib/auth/UnauthorizedError.js';

interface TokenClaims {
  token: string;
  claims: Claims;
}

export class DirectusAuth implements Auth {
  private tokenClaims?: TokenClaims | null;

  constructor(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    private directusClient: AuthenticationClient<any> & RestClient<any>,
    private authDomain: string,
  ) {}

  token(): string | null {
    return this.tokenClaims?.token ?? null;
  }

  claims(): Claims | null {
    return this.tokenClaims?.claims ?? null;
  }

  async login(username: string, password: string): Promise<void> {
    const email = `${username}@${this.authDomain}`;
    await this.directusClient.login(email, password);

    await this.prepareTokenClaims();
  }

  private async prepareTokenClaims() {
    const token = await this.directusClient.getToken();
    if (!token) {
      throw new UnauthorizedError();
    }

    const user = await this.directusClient.request(
      readMe({
        fields: ['*', 'role.id', 'role.name'],
      }),
    );

    this.tokenClaims = {
      token,
      claims: {
        sub: user.email,
        username: user.email.split('@')[0],
        card_id: user.description,
        ...user,
      },
    };
  }

  async authenticate(): Promise<void> {
    if (this.tokenClaims === undefined) {
      await this.prepareTokenClaims();
    }

    if (!this.tokenClaims) {
      throw new UnauthorizedError();
    }
  }

  async logout(): Promise<void> {
    this.tokenClaims = null;
    await this.directusClient.logout();
  }
}
