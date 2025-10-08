import nodemailer from 'nodemailer';
import { config } from '../configs';
import { Notification, NotificationType } from '../models/notification';
import logger from './logger';

// Configure transporter
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass
  }
});

// Send email
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      text,
      html
    });
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error('Email sending failed:', error);
  }
};

// Send in-app notification
export const sendInAppNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType
) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type
    });
    logger.info(`Notification sent to user ${userId}`);
  } catch (error) {
    logger.error('In-app notification failed:', error);
  }
};

// Combined send notification (email + in-app)
export const sendNotification = async (
  user: any,
  title: string,
  message: string,
  type: NotificationType
) => {
  await sendEmail(user.email, title, message);
  await sendInAppNotification(user._id.toString(), title, message, type);
};
