import nodemailer from 'nodemailer';
import config, { missingMailEnv } from './config.js';

const SECURE_SMTP_PORT = 465;

let transporter = null;

export const isMailConfigured = () => missingMailEnv().length === 0;

export const getTransporter = () => {
  if (!transporter) {
    const { host, port, user, pass } = config.mail;
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === SECURE_SMTP_PORT,
      auth: { user, pass }
    });
  }
  return transporter;
};
