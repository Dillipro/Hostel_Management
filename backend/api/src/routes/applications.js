const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, Roles } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const prisma = new PrismaClient();
const router = express.Router();

function renderApplicationPdf(a) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Logo placeholder (text-based)
    doc.fontSize(18).font('Helvetica-Bold').text('[ UNIVERSITY LOGO ]', { align: 'center' });
    doc.moveDown(0.5);

    // Main Header
    doc.fontSize(16).font('Helvetica-Bold').text('ENGINEERING COLLEGE HOSTELS', { align: 'center' });
    doc.fontSize(14).text('College of Engineering, Guindy', { align: 'center' });
    doc.fontSize(12).text('ANNA UNIVERSITY, CHENNAI – 600025', { align: 'center' });
    doc.moveDown(1);

    // Decorative line
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Title based on type
    let title = 'APPLICATION FORM';
    switch (a.type) {
      case 'bonafide': title = 'BONAFIDE CERTIFICATE APPLICATION FORM'; break;
      case 'duplicate-id': title = 'DUPLICATE HOSTEL ID CARD REQUEST FORM'; break;
      case 'wifi-registration': title = 'HOSTEL WIFI REGISTRATION FORM'; break;
      case 'outing': title = 'OUTING / DAY PASS REQUEST FORM'; break;
      case 'room-change': title = 'ROOM CHANGE REQUEST FORM'; break;
      case 'complaint-escalation': title = 'COMPLAINT ESCALATION FORM'; break;
      case 'medical-rebate': title = 'MEDICAL REBATE APPLICATION FORM'; break;
      case 'feedback': title = 'HOSTEL FACILITIES FEEDBACK FORM'; break;
      case 'readmission': title = 'HOSTEL READMISSION APPLICATION FORM'; break;
      default: title = `${a.type.toUpperCase().replace('-', ' ')} APPLICATION FORM`; break;
    }
    doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center', underline: true });
    doc.moveDown(1.5);

    // Application ID and Date
    doc.fontSize(10).font('Helvetica').text(`Application ID: ${a.id}`, { align: 'right' });
    doc.text(`Date: ${new Date(a.created_at).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(1);

    // Student Details Section
    doc.fontSize(14).font('Helvetica-Bold').text('STUDENT DETAILS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    const studentDetails = [
      ['Name (in CAPITALS):', (a.student?.user?.name || '').toUpperCase()],
      ['Register Number:', a.student?.user?.reg_no || ''],
      ['Department & Year:', `${a.student?.user?.department || ''} - ${a.student?.user?.year || ''}`],
      ['Semester:', a.student?.user?.semester || ''],
      ['Hostel Block & Room:', `${a.student?.hostel?.name || ''} - ${a.student?.room?.room_no || ''}`],
      ['Mobile Number:', a.student?.user?.phone || ''],
      ['Email ID:', a.student?.user?.email || '']
    ];

    studentDetails.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true });
      doc.font('Helvetica').text(` ${value}`);
    });
    doc.moveDown(1);

    // Type-specific content
    const data = a.data || {};
    doc.fontSize(14).font('Helvetica-Bold').text('APPLICATION DETAILS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);

    if (a.type === 'bonafide') {
      doc.font('Helvetica-Bold').text('Purpose of Bonafide Certificate:');
      doc.font('Helvetica').text(data.purpose || 'Not specified');
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Institution/Bank Name (if applicable):');
      doc.font('Helvetica').text(data.institution || 'N/A');
      doc.moveDown(1);

    } else if (a.type === 'duplicate-id') {
      doc.font('Helvetica-Bold').text('Reason for Duplicate ID Card:');
      doc.font('Helvetica').text(data.reason || 'Not specified');
      doc.moveDown(0.5);
      if (data.reason?.toLowerCase().includes('lost')) {
        doc.font('Helvetica-Bold').text('FIR Details:');
        doc.font('Helvetica').text('FIR Copy uploaded: Yes');
      }
      doc.font('Helvetica-Bold').text('Fine Amount:');
      doc.font('Helvetica').text('Rs. 100/- (as per hostel rules)');
      doc.moveDown(1);

    } else if (a.type === 'wifi-registration') {
      doc.font('Helvetica-Bold').text('Device Information:');
      doc.moveDown(0.3);
      doc.font('Helvetica').text(`• Device Type: ${data.device_type || 'Not specified'}`);
      doc.text(`• Brand/Model: ${data.brand_model || 'Not specified'}`);
      doc.text(`• MAC Address: ${data.mac_address || 'Not specified'}`);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Terms & Conditions:');
      doc.font('Helvetica').text('• Device will be registered for hostel WiFi access only');
      doc.text('• Misuse may result in access revocation');
      doc.text('• One device per student policy');
      doc.moveDown(1);

    } else if (a.type === 'outing') {
      doc.font('Helvetica-Bold').text('Outing Request Details:');
      doc.moveDown(0.3);
      doc.font('Helvetica').text(`• Date of Exit: ${data.exit_date || 'Not specified'}`);
      doc.text(`• Time of Exit: ${data.exit_time || 'Not specified'}`);
      doc.text(`• Expected Return Date: ${data.return_date || 'Not specified'}`);
      doc.text(`• Purpose/Reason: ${data.reason || 'Not specified'}`);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Emergency Contact:');
      doc.font('Helvetica').text('Parent/Guardian details to be provided at security desk');
      doc.moveDown(1);

    } else if (a.type === 'room-change') {
      doc.font('Helvetica-Bold').text('Current Accommodation:');
      doc.font('Helvetica').text(`${a.student?.hostel?.name || ''} - Room ${a.student?.room?.room_no || ''}`);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Requested Accommodation:');
      doc.font('Helvetica').text(`Preferred Block: ${data.preferred_block || 'Not specified'}`);
      doc.text(`Preferred Room: ${data.preferred_room || 'As per availability'}`);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Reason for Room Change:');
      doc.font('Helvetica').text(data.reason || 'Not specified');
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Terms:');
      doc.font('Helvetica').text('• Subject to availability and warden approval');
      doc.text('• Room change fee: Rs. 200/-');
      doc.moveDown(1);

    } else if (a.type === 'complaint-escalation') {
      doc.font('Helvetica-Bold').text('Complaint Information:');
      doc.moveDown(0.3);
      doc.font('Helvetica').text(`• Complaint Type: ${data.complaint_type || 'Not specified'}`);
      doc.text(`• Previous Ticket Number: ${data.ticket_no || 'N/A'}`);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Complaint Description:');
      doc.font('Helvetica').text(data.description || 'Not provided');
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Previous Actions:');
      doc.font('Helvetica').text('Complaint was not resolved at RC level, hence escalated');
      doc.moveDown(1);

    } else if (a.type === 'medical-rebate') {
      doc.font('Helvetica-Bold').text('Medical Leave Details:');
      doc.moveDown(0.3);
      doc.font('Helvetica').text(`• From Date: ${data.from_date || 'Not specified'}`);
      doc.text(`• To Date: ${data.to_date || 'Not specified'}`);
      const from = new Date(data.from_date);
      const to = new Date(data.to_date);
      const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
      doc.text(`• Number of Days: ${days || 'N/A'}`);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Medical Certificate:');
      doc.font('Helvetica').text('Original medical certificate to be submitted to RC office');
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Rebate Calculation:');
      doc.font('Helvetica').text('Mess fee rebate will be calculated based on actual absence days');
      doc.moveDown(1);

    } else if (a.type === 'feedback') {
      doc.font('Helvetica-Bold').text('Feedback Category:');
      doc.font('Helvetica').text(data.feedback_type || 'Not specified');
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Rating:');
      doc.font('Helvetica').text(`${data.rating || 'N/A'}/5 stars`);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Detailed Comments:');
      doc.font('Helvetica').text(data.comments || 'No comments provided');
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Purpose:');
      doc.font('Helvetica').text('This feedback will help improve hostel facilities and services');
      doc.moveDown(1);

    } else if (a.type === 'readmission') {
      doc.font('Helvetica-Bold').text('Academic Information:');
      doc.font('Helvetica').text(`Academic Year: ${data.academic_year || 'Not specified'}`);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Hostel Block Preferences (in order):');
      const prefs = data.block_preferences || [];
      prefs.forEach((p, i) => {
        if (p) doc.font('Helvetica').text(`${i+1}. ${p}`);
      });
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Readmission Terms:');
      doc.font('Helvetica').text('• Subject to academic performance and availability');
      doc.text('• Previous dues must be cleared');
      doc.text('• Allotment based on preferences and merit');
      doc.moveDown(1);
    }

    // Declaration Section
    doc.fontSize(12).font('Helvetica-Bold').text('DECLARATION', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(
      'I hereby declare that all the information furnished above is true and correct to the best of my knowledge. ' +
      'I understand that any false information may result in rejection of this application and disciplinary action.'
    );
    doc.moveDown(1.5);

    // Signature section
    doc.font('Helvetica-Bold').text('Signature of Student:', { continued: true });
    doc.font('Helvetica').text(' _______________________________');
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Date:', { continued: true });
    doc.font('Helvetica').text(' _______________________________');
    doc.moveDown(2);

    // Approval Workflow
    doc.fontSize(12).font('Helvetica-Bold').text('APPROVAL WORKFLOW', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);

    // RC Section
    doc.font('Helvetica-Bold').text('RC (Resident Counselor) Verification:');
    doc.font('Helvetica').text('[ ] Verified and Recommended');
    doc.text('[ ] Not Recommended (Reason: __________________________)');
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('RC Signature:', { continued: true });
    doc.font('Helvetica').text(' _______________________________');
    doc.text('Date: _______________________________');
    doc.moveDown(1);

    // Warden Section
    doc.font('Helvetica-Bold').text('Warden Approval:');
    doc.font('Helvetica').text('[ ] Approved');
    doc.text('[ ] Rejected (Reason: __________________________)');
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Warden Signature:', { continued: true });
    doc.font('Helvetica').text(' _______________________________');
    doc.text('Date: _______________________________');
    doc.moveDown(1);

    // Status
    doc.fontSize(11).font('Helvetica-Bold').text(`Current Status: ${a.status.toUpperCase()}`);
    if (a.admin_remark) {
      doc.font('Helvetica').text(`Remarks: ${a.admin_remark}`);
    }
    doc.moveDown(1);

    // Footer
    doc.fontSize(8).font('Helvetica').text(
      'This is an auto-generated document. For any queries, contact hostel office.',
      { align: 'center' }
    );

    doc.end();
  });
}

router.post('/', auth, async (req, res) => {
  const { type, data } = req.body;
  const app = await prisma.application.create({ data: { student_id: req.user.sub, type, data, status: 'pending' } });
  res.status(201).json(app);
});

router.get('/me', auth, async (req, res) => {
  const items = await prisma.application.findMany({ where: { student_id: req.user.sub }, orderBy: { created_at: 'desc' } });
  res.json(items);
});

// Get applications for staff review (RC/Warden/Admin)
router.get('/', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const { status, block_id } = req.query;
  let where = {};

  if (status) where.status = String(status);
  if (block_id) where.student = { hostel_id: String(block_id) };

  // Filter by user's blocks if not admin
  if (req.user.role === Roles.warden) {
    const wardenBlocks = await prisma.hostelBlock.findMany({ where: { warden_id: req.user.sub } });
    const blockIds = wardenBlocks.map(b => b.id);
    where.student = { ...where.student, hostel_id: { in: blockIds } };
  } else if (req.user.role === Roles.rc) {
    const assignments = await prisma.rCAssignment.findMany({ where: { rc_id: req.user.sub, OR: [{ end_date: null }, { end_date: { gt: new Date() } }] } });
    const blockIds = assignments.map(a => a.block_id);
    const ownBlocks = await prisma.hostelBlock.findMany({ where: { OR: [{ rc_id: req.user.sub }, { id: { in: blockIds } }] } });
    const ownBlockIds = ownBlocks.map(b => b.id);
    where.student = { ...where.student, hostel_id: { in: ownBlockIds } };
  }

  const items = await prisma.application.findMany({
    where,
    include: { student: { include: { user: true, hostel: true } } },
    orderBy: { created_at: 'desc' }
  });
  res.json(items);
});

router.patch('/:id/approve', auth, requireRole(Roles.warden, Roles.admin), async (req, res) => {
  const updated = await prisma.application.update({ where: { id: req.params.id }, data: { status: 'approved', admin_remark: req.body.remark || null } });
  res.json(updated);
});

// RC decision (approve/reject/forward)
router.patch('/:id/decision', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const { decision, remark } = req.body; // 'approve' | 'reject' | 'forward'
  let status = 'pending';
  if (decision === 'approve') status = 'rc-approved';
  else if (decision === 'reject') status = 'rejected';
  else if (decision === 'forward') status = 'pending';
  const updated = await prisma.application.update({ where: { id: req.params.id }, data: { status, admin_remark: remark || null } });
  res.json(updated);
});

// Delete application (only by owner and only if pending)
router.delete('/:id', auth, async (req, res) => {
  const a = await prisma.application.findUnique({ where: { id: req.params.id } });
  if (!a) return res.status(404).json({ error: 'Application not found' });
  if (a.student_id !== req.user.sub) return res.status(403).json({ error: 'You can only delete your own applications' });
  if (a.status !== 'pending') return res.status(400).json({ error: 'Can only delete pending applications' });
  
  await prisma.application.delete({ where: { id: req.params.id } });
  res.json({ message: 'Application deleted successfully' });
});

// PDF download for application
router.get('/:id/pdf', auth, async (req, res) => {
  const a = await prisma.application.findUnique({ where: { id: req.params.id }, include: { student: { include: { user: true, hostel: true, room: true } } } });
  if (!a) return res.status(404).json({ error: 'Not found' });
  // Allow if user is the student or has staff role
  const isOwner = a.student_id === req.user.sub;
  const isStaff = [Roles.warden, Roles.admin, Roles.rc].includes(req.user.role);
  if (!isOwner && !isStaff) return res.status(403).json({ error: 'Forbidden' });
  let pdfBuffer = a.pdf;
  if (!pdfBuffer) {
    // Generate PDF on the fly
    pdfBuffer = await renderApplicationPdf(a);
    // Optionally store it
    await prisma.application.update({ where: { id: a.id }, data: { pdf: pdfBuffer } });
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="application-${a.id}.pdf"`);
  res.send(Buffer.from(pdfBuffer));
});

module.exports = router;
