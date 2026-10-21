import nodemailer from 'nodemailer';
import config from '../config/config.js';
import { getTransporter, isMailConfigured } from '../config/mailer.js';
import { escapeHtml } from '../utils/escapeHtml.js';

const DISPLAY_TIME_ZONE = 'America/Argentina/Buenos_Aires';

const formatDate = (date) =>
  new Date(date).toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short', timeZone: DISPLAY_TIME_ZONE });

const buildTicketConfirmationHtml = ({ event, ticket }) => `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1f2937;">
    <h2 style="color: #0f766e;">¡Tu inscripción está confirmada!</h2>
    <p>Te inscribiste a <strong>${escapeHtml(event.title)}</strong>.</p>
    <table style="border-collapse: collapse; width: 100%;">
      <tr><td style="padding: 6px 0; color: #6b7280;">Fecha</td><td>${escapeHtml(formatDate(event.date))}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Lugar</td><td>${escapeHtml(event.location)}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Entradas</td><td>${ticket.quantity}</td></tr>
      <tr><td style="padding: 6px 0; color: #6b7280;">Código de reserva</td><td><strong>${escapeHtml(ticket.reservationCode)}</strong></td></tr>
    </table>
    <p style="color: #6b7280; font-size: 13px;">Presentá el código de reserva el día del evento. Si no podés asistir, cancelá tu inscripción para liberar el lugar.</p>
  </div>
`;

class NotificationService {
  async sendTicketConfirmation({ to, event, ticket }) {
    if (!isMailConfigured()) {
      console.warn(`Email de confirmación no enviado a ${to}: el envío de emails no está configurado`);
      return { sent: false };
    }

    const info = await getTransporter().sendMail({
      from: config.mail.from,
      to,
      subject: `Inscripción confirmada: ${event.title}`,
      text: [
        `Tu inscripción a "${event.title}" está confirmada.`,
        `Fecha: ${formatDate(event.date)}`,
        `Lugar: ${event.location}`,
        `Entradas: ${ticket.quantity}`,
        `Código de reserva: ${ticket.reservationCode}`
      ].join('\n'),
      html: buildTicketConfirmationHtml({ event, ticket })
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Email de confirmación enviado a ${to}. Vista previa: ${previewUrl}`);
    }

    return { sent: true };
  }
}

export default new NotificationService();
