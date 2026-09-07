import { initializeApp, getApps, getApp } from 'firebase/app';
import { config } from './env.js';

let firebaseApp = null;

export const getFirebaseApp = () => {
    if (!firebaseApp) {
        if (config.firebase.apiKey) {
            const firebaseConfig = {
                apiKey: config.firebase.apiKey,
                authDomain: config.firebase.authDomain,
                projectId: config.firebase.projectId,
                storageBucket: config.firebase.storageBucket,
                messagingSenderId: config.firebase.messagingSenderId,
                appId: config.firebase.appId,
                measurementId: config.firebase.measurementId,
            };
            firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        }
    }
    return firebaseApp;
};

export const isBackendFirebaseConfigured = () => {
    return !!config.firebase.apiKey;
};
