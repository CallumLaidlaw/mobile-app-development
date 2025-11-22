import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import type { Auth, User } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default function () {
    const nuxtApp = useNuxtApp();
    const $auth = nuxtApp.$auth as Auth;
    const db = getFirestore();

    let user = useState<User | null>('user', () => null);

    const verifyUser = (accessToken: string) => {
        
    }

    const login = async (email: string, password: string) => {
        try {
            const attempt = await signInWithEmailAndPassword($auth, email, password);
            user.value = attempt.user;
            
            return {
                status: true,
                accessToken: await (attempt.user.getIdToken())
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("Login error:", error.message);
            }
            return {
                status: false,
                message: error
            };
        }
    }

    const register = async (email: string, password: string, username: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword($auth, email, password);
            const createdUser = userCredential.user;

            if (createdUser) {
                await updateProfile(createdUser, {
                    displayName: username
                });

                await setDoc(doc(db, "users", createdUser.uid), {
                    username,
                    email,
                    createdAt: Date.now()
                });

                user.value = createdUser;
                return true;
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("Registration error:", error.message);
            }
            return false;
        }
    };

    return {
        user,
        register,
        login,
    };
}
