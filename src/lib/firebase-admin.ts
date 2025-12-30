import "server-only";
import * as admin from "firebase-admin";

interface FirebaseConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
    storageBucket: string;
}

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, "\n");
}

export function getFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const config: FirebaseConfig = {
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY!),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
    };

    if (!config.projectId || !config.clientEmail || !config.privateKey) {
        throw new Error("Firebase Admin SDK configuration is missing.");
    }

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: config.privateKey,
        }),
        storageBucket: config.storageBucket,
    });
}

export async function getStorageBucket() {
    const app = getFirebaseAdmin();
    return app.storage().bucket();
}
