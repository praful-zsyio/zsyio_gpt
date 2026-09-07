/**
 * ZsyioGPT Payment Receipt & Notification Email Service
 * - Sends real emails via Nodemailer (Gmail / any SMTP)
 * - Generates Excel invoice workbook as attachment
 * - Falls back to console-log preview when SMTP is not configured
 */

import { config } from '../../config/env.js';

// ─── Lazy-load nodemailer & xlsx so server still starts without them ─────────
let nodemailer = null;
let XLSX = null;

async function getNodemailer() {
  if (!nodemailer) {
    try {
      nodemailer = (await import('nodemailer')).default;
    } catch {
      console.warn('[Email] nodemailer not available – email will be skipped.');
    }
  }
  return nodemailer;
}

async function getXLSX() {
  if (!XLSX) {
    try {
      XLSX = (await import('xlsx')).default;
    } catch {
      console.warn('[Email] xlsx not available – Excel attachment will be skipped.');
    }
  }
  return XLSX;
}

// ─── Build reusable transporter ───────────────────────────────────────────────
let _transporter = null;
async function getTransporter() {
  if (_transporter) return _transporter;
  const nm = await getNodemailer();
  if (!nm) return null;

  const { user, pass, host, port, secure } = config.email;

  if (!user || !pass) {
    // Create Ethereal test account for local preview
    try {
      const testAccount = await nm.createTestAccount();
      _transporter = nm.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      console.log('[Email] No SMTP credentials found – using Ethereal test account.');
      console.log('[Email] Preview emails at: https://ethereal.email');
      return _transporter;
    } catch {
      return null;
    }
  }

  _transporter = nm.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
  return _transporter;
}

// ─── Excel workbook builder ───────────────────────────────────────────────────
async function buildInvoiceExcel(receiptData) {
  const xlsx = await getXLSX();
  if (!xlsx) return null;

  const {
    invoiceNumber,
    customerName,
    customerEmail,
    customerPhone = '',
    customerAddress = '',
    upiId = '',
    paymentMethod = 'UPI',
    planName,
    amount,
    currency = 'USD',
    credits,
    orderId,
    paymentId,
    date = new Date(),
  } = receiptData;

  const formattedDate = new Date(date).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const wb = xlsx.utils.book_new();

  // Sheet 1 – Invoice Summary
  const summaryRows = [
    ['ZsyioGPT – Official Tax Invoice / Receipt'],
    [],
    ['Invoice Number',  invoiceNumber],
    ['Order ID',        orderId],
    ['Transaction ID',  paymentId || orderId],
    ['Date & Time',     formattedDate],
    [],
    ['Billed To',       customerName || 'Customer'],
    ['Email',           customerEmail],
    ['Phone',           customerPhone],
    ['Address',         customerAddress],
    ['UPI ID',          upiId],
    ['Payment Method',  paymentMethod],
    [],
    ['Item Description', 'Credits', `Amount (${currency})`],
    [planName, `+${Number(credits).toLocaleString()} CR`, `$${amount} ${currency}`],
    [],
    ['TOTAL PAID', '', `$${amount} ${currency}`],
    ['Status', '', 'PAID ✓'],
    [],
    ['© ' + new Date().getFullYear() + ' ZsyioGPT. All rights reserved.'],
  ];

  const ws = xlsx.utils.aoa_to_sheet(summaryRows);

  // Basic column widths
  ws['!cols'] = [{ wch: 24 }, { wch: 28 }, { wch: 20 }];

  xlsx.utils.book_append_sheet(wb, ws, 'Invoice');

  // Sheet 2 – Raw Data (for owner records)
  const dataRows = [
    ['InvoiceNumber', 'OrderID', 'TransactionID', 'Date', 'CustomerName', 'Email', 'Phone', 'UPI_ID', 'PaymentMethod', 'Plan', 'Credits', 'Amount', 'Currency', 'Status'],
    [invoiceNumber, orderId, paymentId || orderId, formattedDate, customerName, customerEmail, customerPhone, upiId, paymentMethod, planName, credits, amount, currency, 'PAID'],
  ];
  const ws2 = xlsx.utils.aoa_to_sheet(dataRows);
  ws2['!cols'] = dataRows[0].map(() => ({ wch: 20 }));
  xlsx.utils.book_append_sheet(wb, ws2, 'Records');

  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

// ─── HTML receipt template ────────────────────────────────────────────────────
export const generateReceiptHtml = ({
  invoiceNumber,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  upiId,
  paymentMethod = 'UPI',
  planName,
  amount,
  currency = 'USD',
  credits,
  orderId,
  paymentId,
  date = new Date(),
}) => {
  const formattedDate = new Date(date).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - ${invoiceNumber}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #06080f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background: #0c101d; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #334155; }
    .brand { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; }
    .brand span { color: #00f2fe; }
    .badge { display: inline-block; padding: 4px 12px; margin-top: 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 9999px; color: #34d399; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 24px; }
    .h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0; }
    .text { font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0; }
    .invoice-card { background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .grid { display: table; width: 100%; margin-bottom: 12px; }
    .row { display: table-row; }
    .col-label { display: table-cell; padding: 6px 0; color: #64748b; font-size: 12px; }
    .col-val { display: table-cell; padding: 6px 0; color: #f1f5f9; font-size: 12px; text-align: right; font-weight: 600; font-family: monospace; }
    .table-container { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .table-container th { background: #1e293b; color: #cbd5e1; font-size: 11px; text-transform: uppercase; text-align: left; padding: 10px 12px; letter-spacing: 0.5px; }
    .table-container td { padding: 14px 12px; border-bottom: 1px solid #1e293b; font-size: 13px; }
    .total-card { background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(0, 242, 254, 0.05)); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 16px 20px; display: table; width: 100%; box-sizing: border-box; }
    .footer { padding: 24px; background: #06080f; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <div class="brand">Zsyio<span>GPT</span></div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; letter-spacing: 1px;">INTELLIGENT AI SOLUTIONS</div>
        <div class="badge">&#10003; PAYMENT CONFIRMED</div>
      </div>
      
      <div class="content">
        <div class="h1">Payment Receipt &amp; Invoice</div>
        <p class="text">
          Hi <strong>${customerName || 'Valued User'}</strong>, thank you for your payment! Your ZsyioGPT AI account credits have been updated and are ready to use immediately.
        </p>

        <!-- Customer & Order Meta -->
        <div class="invoice-card">
          <div class="grid">
            <div class="row">
              <div class="col-label">Receipt / Invoice #</div>
              <div class="col-val">${invoiceNumber}</div>
            </div>
            <div class="row">
              <div class="col-label">Date &amp; Time</div>
              <div class="col-val">${formattedDate}</div>
            </div>
            <div class="row">
              <div class="col-label">Billed To</div>
              <div class="col-val">${customerName || 'Customer'} (${customerEmail})</div>
            </div>
            ${customerPhone ? `
            <div class="row">
              <div class="col-label">Phone Number</div>
              <div class="col-val">${customerPhone}</div>
            </div>` : ''}
            ${customerAddress ? `
            <div class="row">
              <div class="col-label">Address</div>
              <div class="col-val">${customerAddress}</div>
            </div>` : ''}
            <div class="row">
              <div class="col-label">Payment Method</div>
              <div class="col-val">${paymentMethod}${upiId ? ` (UPI ID: ${upiId})` : ''}</div>
            </div>
            <div class="row">
              <div class="col-label">Transaction ID</div>
              <div class="col-val">${paymentId || orderId}</div>
            </div>
          </div>
        </div>

        <!-- Line items table -->
        <table class="table-container">
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Credits</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong style="color: #ffffff;">${planName}</strong>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">High-Speed AI Inference &amp; Media Generation Engine</div>
              </td>
              <td style="text-align: center; color: #f59e0b; font-weight: 700; font-family: monospace;">+${Number(credits).toLocaleString()} CR</td>
              <td style="text-align: right; color: #ffffff; font-weight: 700; font-family: monospace;">$${amount} ${currency}</td>
            </tr>
          </tbody>
        </table>

        <!-- Total box -->
        <div class="total-card">
          <div style="display: table-cell; vertical-align: middle;">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Total Paid via ${paymentMethod}</div>
            <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 2px;">$${amount} ${currency}</div>
          </div>
          <div style="display: table-cell; vertical-align: middle; text-align: right;">
            <div style="font-size: 11px; color: #34d399; font-weight: 700;">&#10003; PAID IN FULL</div>
            <div style="font-size: 11px; color: #94a3b8;">Status: Success</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div>This is an official transaction receipt generated by ZsyioGPT.</div>
        <div>Keep this invoice for your financial and accounting records.</div>
        <div style="margin-top: 8px;">&copy; ${new Date().getFullYear()} ZsyioGPT. All rights reserved.</div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

// ─── Main dispatch function ───────────────────────────────────────────────────
/**
 * Send payment receipt email to customer + Excel report to owner.
 * Falls back to Ethereal preview if SMTP credentials are missing.
 */
export const sendPaymentReceiptEmail = async (receiptData) => {
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const fullReceiptData = { ...receiptData, invoiceNumber };

  const html = generateReceiptHtml(fullReceiptData);

  // ── Console summary (always) ──────────────────────────────────────────────
  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH] Payment Receipt – ${invoiceNumber}`);
  console.log(`To Email : ${receiptData.customerEmail}`);
  console.log(`Customer : ${receiptData.customerName || 'User'}`);
  console.log(`UPI ID   : ${receiptData.upiId || 'N/A'}`);
  console.log(`Method   : ${receiptData.paymentMethod}`);
  console.log(`Plan     : ${receiptData.planName} ($${receiptData.amount} ${receiptData.currency || 'USD'})`);
  console.log(`Credits  : +${Number(receiptData.credits).toLocaleString()}`);
  console.log(`======================================================\n`);

  const result = {
    success: false,
    invoiceNumber,
    messageId: null,
    sentTo: receiptData.customerEmail,
    ownerNotified: false,
    sentAt: new Date().toISOString(),
    receiptHtml: html,
    previewUrl: null,
  };

  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.warn('[Email] No transporter – skipping email delivery.');
      result.success = true; // non-fatal
      return result;
    }

    // Build Excel attachment
    let excelBuffer = null;
    try {
      excelBuffer = await buildInvoiceExcel(fullReceiptData);
    } catch (xlsxErr) {
      console.warn('[Email] Excel build failed:', xlsxErr.message);
    }

    const attachments = excelBuffer
      ? [{ filename: `ZsyioGPT_Invoice_${invoiceNumber}.xlsx`, content: excelBuffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }]
      : [];

    const fromField = `"${config.email.fromName}" <${config.email.fromEmail}>`;

    // 1. Send receipt to customer
    const customerMail = await transporter.sendMail({
      from: fromField,
      to: receiptData.customerEmail,
      subject: `✅ Payment Receipt – ${invoiceNumber} | ZsyioGPT`,
      html,
      attachments,
    });

    result.messageId = customerMail.messageId;
    result.success = true;

    // Preview URL (Ethereal only)
    const nm = await getNodemailer();
    if (nm && nm.getTestMessageUrl) {
      const url = nm.getTestMessageUrl(customerMail);
      if (url) {
        result.previewUrl = url;
        console.log(`[Email] 📧 Preview receipt at: ${url}`);
      }
    }

    // 2. Send Excel report to owner
    const ownerEmail = config.email.ownerEmail;
    if (ownerEmail) {
      try {
        const ownerMail = await transporter.sendMail({
          from: fromField,
          to: ownerEmail,
          subject: `📊 New Payment – ${invoiceNumber} | $${receiptData.amount} from ${receiptData.customerName || receiptData.customerEmail}`,
          html: `
            <div style="font-family:sans-serif;padding:20px;background:#0c101d;color:#e2e8f0;">
              <h2 style="color:#00f2fe;">New Payment Received</h2>
              <p><strong>Invoice:</strong> ${invoiceNumber}</p>
              <p><strong>Customer:</strong> ${receiptData.customerName} (${receiptData.customerEmail})</p>
              <p><strong>Phone:</strong> ${receiptData.customerPhone || 'N/A'}</p>
              <p><strong>UPI ID:</strong> ${receiptData.upiId || 'N/A'}</p>
              <p><strong>Method:</strong> ${receiptData.paymentMethod}</p>
              <p><strong>Plan:</strong> ${receiptData.planName}</p>
              <p><strong>Amount:</strong> $${receiptData.amount} ${receiptData.currency || 'USD'}</p>
              <p><strong>Credits:</strong> +${Number(receiptData.credits).toLocaleString()}</p>
              <p style="color:#94a3b8;font-size:12px;">Full invoice attached as Excel spreadsheet.</p>
            </div>
          `,
          attachments,
        });
        result.ownerNotified = true;
        console.log(`[Email] 📊 Owner notified at ${ownerEmail} (${ownerMail.messageId})`);
      } catch (ownerErr) {
        console.warn('[Email] Owner notification failed:', ownerErr.message);
      }
    }

    console.log(`[Email] ✅ Receipt sent to ${receiptData.customerEmail} (${result.messageId})`);
  } catch (err) {
    console.warn('[Email] Failed to send receipt email:', err.message);
    result.error = err.message;
  }

  return result;
};

/**
 * Send welcome & account confirmation email with Google/Auth shared profile data
 */
export async function sendAuthWelcomeEmail({
  email,
  name,
  avatar,
  uid,
  provider = 'Google',
  credits = 1000,
  plan = 'Free Starter Plan',
}) {
  const result = { success: false, messageId: null, previewUrl: null };
  if (!email) return result;

  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.log(`[Email] Mock welcome email logged for ${email} (${name || 'User'}) via ${provider}`);
      return result;
    }

    const { fromName, fromEmail } = config.email;
    const fromField = `"${fromName}" <${fromEmail}>`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050814; color: #f1f5f9; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #0c1222; border-radius: 20px; border: 1px solid rgba(56, 189, 248, 0.25); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%); padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 26px; color: #ffffff; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 14px; color: #bae6fd; font-family: monospace; }
          .content { padding: 32px 28px; }
          .badge { display: inline-block; padding: 6px 14px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 9999px; color: #38bdf8; font-size: 12px; font-weight: 700; margin-bottom: 20px; font-family: monospace; }
          .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; margin-bottom: 24px; }
          .cta-btn { display: inline-block; background: linear-gradient(to right, #38bdf8, #2563eb); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; text-align: center; margin: 10px 0; box-shadow: 0 10px 25px rgba(37, 99, 235, 0.35); }
          .footer { padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.08); font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ZsyioGPT Gateway</h1>
            <p>Unified AI & Generative Media Engine</p>
          </div>
          <div class="content">
            <span class="badge">AUTH CONFIRMED & DATA CONNECTED</span>
            <h2 style="margin: 0 0 12px; color: #ffffff; font-size: 20px;">Welcome, ${name || 'Creator'}! 👋</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              Your account has successfully signed in to <strong>ZsyioGPT</strong> via <strong>${provider} Authentication</strong>. Below is your connected profile and account details.
            </p>

            <div class="card">
              <div style="font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 12px; font-family: monospace;">
                Account & Shared Profile Details
              </div>
              <table style="width:100%; border-collapse: collapse; font-size: 13px;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <td style="padding: 8px 0; color: #94a3b8;">User Name</td>
                  <td style="padding: 8px 0; color: #f8fafc; text-align: right; font-weight: 600;">${name || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <td style="padding: 8px 0; color: #94a3b8;">Email Address</td>
                  <td style="padding: 8px 0; color: #f8fafc; text-align: right; font-weight: 600;">${email}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <td style="padding: 8px 0; color: #94a3b8;">Auth Provider</td>
                  <td style="padding: 8px 0; color: #38bdf8; text-align: right; font-weight: 600;">${provider}</td>
                </tr>
                ${uid ? `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <td style="padding: 8px 0; color: #94a3b8;">Account ID / UID</td>
                  <td style="padding: 8px 0; color: #94a3b8; text-align: right; font-family: monospace; font-size: 11px;">${uid}</td>
                </tr>
                ` : ''}
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <td style="padding: 8px 0; color: #94a3b8;">Active Plan</td>
                  <td style="padding: 8px 0; color: #10b981; text-align: right; font-weight: 600;">${plan}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Starting AI Credits</td>
                  <td style="padding: 8px 0; color: #f59e0b; text-align: right; font-weight: 700; font-family: monospace;">+${Number(credits).toLocaleString()} Credits</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 28px 0;">
              <a href="http://localhost:5173" class="cta-btn">Launch AI Cockpit →</a>
            </div>

            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
              You can now access multi-LLM reasoning (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Grok), produce up to 3-hour video content, generate presentation decks, and synthesize neural voice audio.
            </p>
          </div>
          <div class="footer">
            © 2026 ZsyioGPT Unified AI Gateway. All rights reserved. • This email confirms your sign-in activity.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: fromField,
      to: email,
      subject: `🎉 Welcome to ZsyioGPT – Your Account is Connected (${name || email})`,
      html,
    });

    result.messageId = info.messageId;
    result.success = true;

    const nm = await getNodemailer();
    if (nm && nm.getTestMessageUrl) {
      const url = nm.getTestMessageUrl(info);
      if (url) {
        result.previewUrl = url;
        console.log(`[Email] 📧 Welcome email preview for ${email}: ${url}`);
      }
    }
    console.log(`[Email] ✅ Welcome email sent to ${email} (${info.messageId})`);
  } catch (err) {
    console.warn(`[Email] Welcome email delivery notice for ${email}:`, err.message);
    result.error = err.message;
  }

  return result;
}

