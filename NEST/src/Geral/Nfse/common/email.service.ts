import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'seu-email@gmail.com',
      pass: 'sua-senha',
    },
  });

  async enviarEmail({ to, subject, body, attachments }: any): Promise<void> {
    await this.transporter.sendMail({
      from: 'seu-email@gmail.com',
      to,
      subject,
      text: body,
      attachments,
    });
  }
}
