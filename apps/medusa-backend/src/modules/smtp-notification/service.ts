import nodemailer, { type Transporter } from "nodemailer";
import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils";
import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types";
import { renderTemplate } from "./templates";

type Options = {
  host: string;
  port: number;
  user: string;
  pass: string;
  /** e.g. "WDIS <hello@example.com>" */
  from: string;
  /** Gets a BCC of every order confirmation. */
  ordersBcc?: string;
};

/**
 * Sends Medusa "email" channel notifications over SMTP. Works with Gmail
 * (app password) today and with Resend / Brevo / SES SMTP once the store has
 * its own domain — only the env vars change.
 */
export default class SmtpNotificationService extends AbstractNotificationProviderService {
  static identifier = "smtp";

  private transporter: Transporter;
  private options: Options;
  private logger: Logger;

  constructor({ logger }: { logger: Logger }, options: Options) {
    super();
    this.logger = logger;
    this.options = options;
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.port === 465,
      auth: { user: options.user, pass: options.pass },
    });
  }

  static validateOptions(options: Record<string, unknown>) {
    for (const key of ["host", "user", "pass", "from"]) {
      if (!options[key]) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `SMTP notification: "${key}" is required`);
      }
    }
  }

  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    const { subject, html, text } = renderTemplate(notification.template, notification.data ?? {});
    const info = await this.transporter.sendMail({
      from: this.options.from,
      to: notification.to,
      bcc: notification.template === "order-placed" ? this.options.ordersBcc : undefined,
      subject,
      html,
      text,
    });
    this.logger.info(`[email] "${notification.template}" sent to ${notification.to}`);
    return { id: info.messageId };
  }
}
