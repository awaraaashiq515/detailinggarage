import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

/**
 * Generate a UPI QR code for a given UPI ID and amount
 * Saves the QR code as an image in the public/uploads/qrcodes directory
 */
export async function generateUPIQRCode(upiId: string, name: string, amount?: number): Promise<string> {
  // Construct UPI URL: upi://pay?pa=address@upi&pn=PayeeName&am=Amount&cu=INR
  let upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&cu=INR`;
  if (amount) {
    upiUrl += `&am=${amount}`;
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'qrcodes');

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate a unique filename
  const fileName = `upi-qr-${Date.now()}.png`;
  const filePath = path.join(uploadDir, fileName);
  const publicPath = `/uploads/qrcodes/${fileName}`;

  try {
    // Generate QR code image
    await QRCode.toFile(filePath, upiUrl, {
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      width: 400,
    });

    return publicPath;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate a UPI QR code and return it as a Data URL (base64)
 */
export async function generateUPIQRDataURL(upiId: string, name: string, amount?: number): Promise<string> {
  // Construct UPI URL: upi://pay?pa=address@upi&pn=PayeeName&am=Amount&cu=INR
  let upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&cu=INR`;
  if (amount) {
    upiUrl += `&am=${amount}`;
  }

  try {
    const dataUrl = await QRCode.toDataURL(upiUrl, {
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      width: 400,
      margin: 1,
    });

    return dataUrl;
  } catch (error) {
    console.error('Error generating QR data URL:', error);
    throw new Error('Failed to generate QR data URL');
  }
}


/**
 * Delete a QR code image
 */
export function deleteQRCode(publicPath: string): void {
  if (!publicPath) return;

  const filePath = path.join(process.cwd(), 'public', publicPath);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error deleting QR code file:', error);
    }
  }
}
