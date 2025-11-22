import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { useRuntimeConfig, defineNuxtPlugin } from "#app";
import type { NuxtApp } from "#app";
import { firebaseConfig } from "~/config"

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig().public as unknown as typeof firebaseConfig;

    const app = initializeApp(firebaseConfig);

    const auth = getAuth(app);
    const firestore = getFirestore(app);

    return {
        provide: {
            auth,
            firestore
        }
    }  
})