export interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface Mailer {
  send(opts: MailOptions): Promise<void>;
}
