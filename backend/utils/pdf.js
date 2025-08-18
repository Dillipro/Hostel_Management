const path = require('path');

function getInstitutionInfo() {
  return {
    name: process.env.INSTITUTION_NAME || 'College of Engineering, Guindy',
    subtitle: process.env.INSTITUTION_SUBTITLE || 'Hostel Management System',
    address: process.env.INSTITUTION_ADDRESS || 'Sardar Patel Road, Guindy, Chennai - 600025',
    phone: process.env.INSTITUTION_PHONE || '+91-44-2220-3500',
    email: process.env.INSTITUTION_EMAIL || 'info@example.edu',
    logoPath: process.env.INSTITUTION_LOGO_PATH || null
  };
}

function drawHeader(doc, title) {
  const info = getInstitutionInfo();
  const { logoPath } = info;
  const top = doc.y;
  const left = doc.x;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Branding bar
  doc.save();
  doc.rect(left, top, width, 50).fill('#f0f4ff');
  doc.restore();

  // Logo if available
  if (logoPath) {
    try {
      doc.image(path.resolve(logoPath), left + 10, top + 5, { height: 40 });
    } catch (_) {
      // ignore if logo not found
    }
  }

  // Titles
  doc.fillColor('#0b3d91').fontSize(14).text(info.name, logoPath ? left + 60 : left + 10, top + 8, { continued: false });
  doc.fillColor('#333').fontSize(10).text(info.subtitle, { align: 'left' });
  doc.moveDown(0.5);
  doc.fillColor('#111').fontSize(16).text(title || '', { align: 'center' });
  doc.moveDown(0.5);

  // Divider
  const y = doc.y;
  doc.moveTo(left, y).lineTo(left + width, y).stroke('#d0d7e2');
  doc.moveDown(0.5);
}

function drawFooter(doc) {
  const info = getInstitutionInfo();
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const bottom = doc.page.height - doc.page.margins.bottom + 10;
  doc.save();
  doc.fontSize(9).fillColor('#666');
  doc.text(`${info.address} | ${info.phone} | ${info.email}`, doc.page.margins.left, bottom, { width, align: 'center' });
  doc.restore();
}

module.exports = { drawHeader, drawFooter, getInstitutionInfo };
