export interface Address {
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface MailingProvider {
  createLetter(to: Address, from: Address, pdfUrl: string): Promise<void>;
}

class LobMailingProvider implements MailingProvider {
  constructor(private apiKey: string) {}
  async createLetter(to: Address, from: Address, pdfUrl: string) {
    const Lob = (await import('lob')).default;
    const lob = new Lob(this.apiKey);
    await lob.letters.create({
      to,
      from,
      file: pdfUrl,
      color: false,
    });
  }
}

class ConsoleMailingProvider implements MailingProvider {
  async createLetter(to: Address, from: Address, pdfUrl: string) {
    console.log('Letter', { to, from, pdfUrl });
  }
}

export function createMailingProvider(): MailingProvider {
  if (process.env.LOB_API_KEY) {
    return new LobMailingProvider(process.env.LOB_API_KEY);
  }
  return new ConsoleMailingProvider();
}
