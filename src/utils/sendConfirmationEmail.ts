import axios from 'axios';

export const sendConfirmationEmail = async (to: string, name: string, invoiceNo: string) => {
  await axios.post('https://api.resend.com/emails', {
    from: 'orders@yourdomain.com',
    to,
    subject: 'Payment Confirmation',
    html: `<p>Hello ${name},</p>
      <p>Your payment for invoice <strong>#${invoiceNo}</strong> has been received. We'll process your order shortly.</p>
      <p>Thanks for shopping with us!</p>`,
  }, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
};
