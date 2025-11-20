// services/payment.service.ts
import { queryOne } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { generateQRCode } from "@/utils/qr-code";
import * as Blockchain from '@/lib/blockchain';
import { Network } from '@/types';

interface PaymentAddress {
  address: string;
  network: Network;
  qrCode: string;
}

// Encryption utility for private keys (AES-256)
import crypto from 'crypto';

// FIX #5: Fail fast if encryption key not set - never use defaults for cryptographic keys
const WEB3_DISABLED = process.env.WEB3_DISABLED === 'true' || process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true';

const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error(
    'CRITICAL SECURITY ERROR: WALLET_ENCRYPTION_KEY environment variable must be set and be at least 32 characters. ' +
    'Never use default encryption keys in production. Generate a secure key with: openssl rand -hex 32'
  );
}
const ENCRYPTION_IV_LENGTH = 16;

function encryptPrivateKey(privateKey: string): string {
  const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
  let encrypted = cipher.update(privateKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptPrivateKey(encryptedData: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export class PaymentService {
  static async getDepositAddress(
    userId: string,
    network: Network
  ): Promise<PaymentAddress> {
    // Check if user already has a deposit wallet for this network
    let wallet = await queryOne<any>(
      `SELECT * FROM "CryptoWallet" WHERE "userId" = $1 AND "network" = $2 AND "isDeposit" = true LIMIT 1`,
      [userId, network]
    );

    if (!wallet) {
      // Generate new wallet based on network
      let address: string;
      let privateKey: string;

      // In the hard-cleanup offchain-only mode we no longer create real chain wallets.
      // Instead, we generate deterministic OFFCHAIN_* placeholders that are safe for the Web2-only flow.
      if (network === 'TRC20') {
        address = `OFFCHAIN_TRC20_${uuidv4()}`;
        privateKey = `OFFCHAIN_PRIVATE_KEY_${uuidv4()}`;
      } else {
        address = `OFFCHAIN_BEP20_${uuidv4()}`;
        privateKey = `OFFCHAIN_PRIVATE_KEY_${uuidv4()}`;
      }

      // Encrypt and store private key
      const encryptedPrivateKey = encryptPrivateKey(privateKey);

      // Save wallet to database
      wallet = await queryOne<any>(
        `INSERT INTO "CryptoWallet" ("userId", "address", "network", "privateKey", "isDeposit", "isActive", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, true, true, NOW(), NOW()) RETURNING *`,
        [userId, address, network, encryptedPrivateKey]
      );
    }

    // Generate QR code for the wallet address
    const qrCode = await generateQRCode(wallet.address);

    return {
      address: wallet.address,
      network,
      qrCode,
    };
  }

  static async verifyTransaction(
    txHash: string,
    network: Network,
    expectedAddress: string,
    expectedAmount: number
  ): Promise<{ verified: boolean; amount?: number; from?: string }> {
    try {
      // Delegate to lib/blockchain which operates in offchain-only mode when web3 libs are removed
      const verified = await Blockchain.verifyBlockchainTransaction(
        txHash,
        network,
        expectedAmount,
        expectedAddress
      );
      return { verified, amount: expectedAmount, from: verified ? 'OFFCHAIN_SIMULATION' : undefined };
    } catch (error) {
      console.error('Transaction verification error:', error);
      return { verified: false };
    }
  }

  // TRC20 verification removed in hard-cleanup. Offchain-only verification is handled by lib/blockchain.

  // BEP20 verification removed in hard-cleanup. Offchain-only verification is handled by lib/blockchain.

  // ERC20 verification removed in hard-cleanup. Offchain-only verification is handled by lib/blockchain.
}

