// lib/utils/qr-code.ts
import QRCode from "qrcode";

export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw new Error("Failed to generate QR code");
  }
}
