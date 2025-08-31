export interface Mail {
  to: string;
  subject: string;
  html: string;
}

export interface Mailer {
  send(mail: Mail): Promise<void>;
}

class ResendMailer implements Mailer {
  constructor(private apiKey: string) {}
  async send(mail: Mail) {
    const { Resend } = await import('resend');
    const resend = new Resend(this.apiKey);
    await resend.emails.send({
      from: 'no-reply@creditcraft.local',
      ...mail,
    });
  }
}

class SmtpMailer implements Mailer {
  constructor(private host: string, private user: string, private pass: string) {}
  async send(mail: Mail) {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: this.host,
      auth: { user: this.user, pass: this.pass },
    });
    await transporter.sendMail({ from: this.user, ...mail });
  }
}

export function createMailer() : Mailer {
  if (process.env.RESEND_API_KEY) {
    return new ResendMailer(process.env.RESEND_API_KEY);
  }
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return new SmtpMailer(process.env.SMTP_HOST, process.env.SMTP_USER, process.env.SMTP_PASS);
  }
  return { async send() { console.log('Email', arguments); } } as Mailer;
}
