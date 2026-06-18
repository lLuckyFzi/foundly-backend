import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const { Client, LocalAuth } = pkg;

// Inisialisasi Client WA dengan LocalAuth agar sesi tersimpan (tidak perlu scan QR setiap kali server restart)
const waClient = new Client({
  authStrategy: new LocalAuth({ clientId: "foundly-bot" }),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

let isReady = false;

export const initWhatsApp = () => {
  waClient.on('qr', (qr: string) => {
    console.log('\n==================================================');
    console.log('[WHATSAPP BOT] SCAN QR CODE DI BAWAH INI:');
    qrcode.generate(qr, { small: true });
    console.log('==================================================\n');
  });

  waClient.on('ready', () => {
    isReady = true;
    console.log('[WHATSAPP BOT] Sistem Notifikasi WhatsApp Berhasil Terhubung!');
  });

  waClient.on('auth_failure', (msg: string) => {
    console.error('[WHATSAPP BOT] Autentikasi Gagal:', msg);
  });

  waClient.on('disconnected', (reason: string) => {
    isReady = false;
    console.log('[WHATSAPP BOT] Terputus:', reason);
  });

  waClient.initialize();
};

export const sendWhatsAppMessage = async (nomorHp: string, pesan: string): Promise<boolean> => {
  if (!isReady) {
    console.error('⚠️ [WHATSAPP BOT] Gagal mengirim pesan. Bot belum siap/belum login.');
    return false;
  }

  try {
    // STANDARISASI NOMOR HP KE FORMAT WHATSAPP (c.us)
    // Contoh: "0815574647" -> "62815574647" -> "62815574647@c.us"
    let formattedNumber = nomorHp.replace(/\D/g, '');
    
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '62' + formattedNumber.substring(1);
    } else if (!formattedNumber.startsWith('62')) {
      formattedNumber = '62' + formattedNumber;
    }

    const chatId = `${formattedNumber}@c.us`;

    await waClient.sendMessage(chatId, pesan);
    console.log(`[WHATSAPP BOT] Notifikasi terkirim ke: ${formattedNumber}`);
    return true;
  } catch (error) {
    console.error(`[WHATSAPP BOT] Gagal mengirim ke ${nomorHp}:`, error);
    return false;
  }
};