const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function extFromMime(mime) {
  if (!mime) return 'bin';
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('png')) return 'png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  return 'bin';
}

async function saveBuffer(uploadedBy, buffer, mime, originalName) {
  const ext = originalName?.split('.')?.pop() || extFromMime(mime);
  const filename = `${uploadedBy}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;

  // Save file to database as blob
  const file = await prisma.file.create({
    data: {
      filename,
      original_name: originalName || filename,
      mime_type: mime || 'application/octet-stream',
      size: buffer.length,
      data: buffer,
      uploaded_by: uploadedBy
    }
  });

  // Return file ID that can be used to retrieve the file
  const base = process.env.PUBLIC_BASE_URL?.replace(/\/$/, '') || '';
  return `${base}/api/files/${file.id}`;
}

async function getFile(fileId) {
  const file = await prisma.file.findUnique({
    where: { id: fileId }
  });

  if (!file) {
    throw new Error('File not found');
  }

  return {
    id: file.id,
    filename: file.filename,
    originalName: file.original_name,
    mimeType: file.mime_type,
    size: file.size,
    data: file.data,
    uploadedBy: file.uploaded_by,
    createdAt: file.created_at
  };
}

async function deleteFile(fileId) {
  await prisma.file.delete({
    where: { id: fileId }
  });
}

module.exports = { saveBuffer, getFile, deleteFile };
