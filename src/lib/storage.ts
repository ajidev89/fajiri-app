import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY; // In a real app, this should be an env variable

export const storage = {
    set: (key: string, value: any) => {
        const data = JSON.stringify(value);
        const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
        localStorage.setItem(key, encrypted);
    },

    get: (key: string) => {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;

        try {
            const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);

            if (!decrypted) {
                console.warn(
                    `[Storage] Decryption returned empty string for key: ${key}`,
                );
                return null;
            }

            try {
                return JSON.parse(decrypted);
            } catch (jsonError) {
                console.error(
                    `[Storage] JSON Parse Error for key: ${key}. Content:`,
                    decrypted,
                );
                // Fallback: If it's not JSON, return as raw string if it looks like one
                return decrypted;
            }
        } catch (e) {
            console.error(`[Storage] Decryption Error for key: ${key}`, e);
            return null;
        }
    },

    remove: (key: string) => {
        localStorage.removeItem(key);
    },
};
