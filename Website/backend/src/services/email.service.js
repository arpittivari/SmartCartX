import nodemailer from 'nodemailer';
import config from '../config/index.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Simplest setup, as requested. In prod, use SES/SendGrid.
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendReceipt(userEmail, orderDetails) {
    if (!userEmail) return;

    try {
      const { items, total, mallName, date } = orderDetails;

      const itemsHtml = items.map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">x${item.quantity || 1}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${item.price}</td>
        </tr>
      `).join('');

      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        to: userEmail,
        subject: `Your Receipt from ${mallName || 'SmartCart'} - ₹${total}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #2e7d32;">Thank you for shopping with us!</h2>
            <p>Here is your receipt for the transaction on ${new Date(date).toLocaleString()}.</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="text-align: left; padding: 8px;">Item</th>
                  <th style="text-align: left; padding: 8px;">Qty</th>
                  <th style="text-align: left; padding: 8px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 20px; text-align: right;">
              <h3>Total Paid: ₹${total}</h3>
            </div>

            <p style="margin-top: 30px; font-size: 12px; color: #888;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Receipt sent to:', userEmail, '| ID:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Error sending receipt email:', error.message);
      // We do not throw here to avoid blocking the checkout response
    }
  }
}

export default new EmailService();
