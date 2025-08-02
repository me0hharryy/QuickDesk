const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

const sendTicketNotification = async (ticket, type, user) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  const emailTemplates = {
    created: {
      subject: `New Ticket Created: ${ticket.subject}`,
      html: `
        <h2>New Support Ticket Created</h2>
        <p><strong>Ticket #:</strong> ${ticket.ticketNumber}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Description:</strong> ${ticket.description}</p>
        <p><strong>Created by:</strong> ${user.username}</p>
        <p><strong>Category:</strong> ${ticket.category.name}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <a href="${baseUrl}/tickets/${ticket._id}">View Ticket</a>
      `
    },
    statusChanged: {
      subject: `Ticket Status Updated: ${ticket.subject}`,
      html: `
        <h2>Ticket Status Updated</h2>
        <p><strong>Ticket #:</strong> ${ticket.ticketNumber}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>New Status:</strong> ${ticket.status}</p>
        <a href="${baseUrl}/tickets/${ticket._id}">View Ticket</a>
      `
    },
    assigned: {
      subject: `Ticket Assigned to You: ${ticket.subject}`,
      html: `
        <h2>New Ticket Assignment</h2>
        <p>You have been assigned a new ticket:</p>
        <p><strong>Ticket #:</strong> ${ticket.ticketNumber}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <a href="${baseUrl}/tickets/${ticket._id}">View Ticket</a>
      `
    },
    commented: {
      subject: `New Comment on Ticket: ${ticket.subject}`,
      html: `
        <h2>New Comment Added</h2>
        <p>A new comment has been added to your ticket:</p>
        <p><strong>Ticket #:</strong> ${ticket.ticketNumber}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <a href="${baseUrl}/tickets/${ticket._id}">View Ticket</a>
      `
    }
  };

  const template = emailTemplates[type];
  if (!template) {
    throw new Error(`Invalid email template type: ${type}`);
  }

  return await sendEmail({
    to: user.email,
    subject: template.subject,
    html: template.html
  });
};

module.exports = {
  sendEmail,
  sendTicketNotification
};
