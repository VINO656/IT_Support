const nodemailer = require('nodemailer');

/**
 * Sends an email notification to the IT Support team.
 * Uses real SMTP credentials (configured in backend/.env).
 */
const sendTicketNotification = async (ticket) => {
  try {
    // If credentials are not set, log a warning and skip
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ Email credentials not set in .env. Skipping real-time notification.");
      return;
    }

    // Create a transporter using Gmail SMTP
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Setup email data
    let mailOptions = {
      from: '"OpsPilot AI" <ai-agent@opspilot.com>', // sender address
      to: "vinothini6684@gmail.com", // receiver
      subject: `🚨 New IT Ticket: [${ticket.priority.toUpperCase()}] ${ticket.title}`,
      text: `A new IT Support ticket has been created by the AI Agent.\n\nTicket ID: ${ticket._id}\nCategory: ${ticket.category}\nPriority: ${ticket.priority}\n\nDescription:\n${ticket.description}\n\nPlease review this in the admin dashboard.`,
      html: `
        <h2>🚨 New IT Support Ticket</h2>
        <p>A new ticket has been created by the AI Agent.</p>
        <ul>
          <li><strong>Ticket ID:</strong> ${ticket._id}</li>
          <li><strong>Category:</strong> ${ticket.category}</li>
          <li><strong>Priority:</strong> <span style="color: ${ticket.priority === 'critical' ? 'red' : 'black'}">${ticket.priority.toUpperCase()}</span></li>
        </ul>
        <h3>Description:</h3>
        <p>${ticket.description}</p>
        <br/>
        <p><a href="#">Click here to view in Admin Dashboard</a></p>
      `
    };

    // Send the email
    let info = await transporter.sendMail(mailOptions);

    console.log("-----------------------------------------");
    console.log("📧 Real-Time Email Notification Sent!");
    console.log("To: vinothini6684@gmail.com");
    console.log("Message ID: %s", info.messageId);
    console.log("-----------------------------------------");
    
  } catch (error) {
    console.error("Failed to send ticket notification:", error);
  }
};

module.exports = { sendTicketNotification };
