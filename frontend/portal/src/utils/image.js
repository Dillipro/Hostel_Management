export async function cropImageToSquare(file, size = 256) {
  const img = await createImageBitmap(file)
  const s = Math.min(img.width, img.height)
  const sx = (img.width - s) / 2
  const sy = (img.height - s) / 2
  const canvas = new OffscreenCanvas(size, size)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size)
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 })
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '-square.jpg', { type: blob.type })
}
