<script setup lang="ts">
const currentUser = await getCurrentUser();

if(currentUser) {
    const router = useRouter();
    router.push('/home');
}

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';

import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const toast = useToast();

const user = await getCurrentUser();
const { public: {vuefireVersion, nuxtVuefireVersion }, } = useRuntimeConfig();

const router = useRouter();
const route = useRoute();
const db = getFirestore();

const auth = useFirebaseAuth()!;

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'username',
  label: 'Username',
  type: 'text',
  placeholder: 'Enter your username',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
}]

const schema = z.object({
  email: z.email('Invalid email'),
  username: z.string('Username is required').min(3, 'Must be at least 3 characters'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  createUserWithEmailAndPassword(auth, payload.data.email, payload.data.password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      await updateProfile(userCredential.user, {
        displayName: payload.data.username
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: payload.data.username,
        email: payload.data.email,
        createdAt: Date.now()
      })

      toast.add({ title: 'Registration Successful', description: `Welcome, ${user.email}` });
      const redirectTo = (route.query.redirect as string) || '/home';
      router.push(redirectTo);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      toast.add({ title: 'Registration Failed', description: errorMessage });
    });
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 translate-y-1/2 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Register"
        description="Enter your credentials to create your account."
        icon="i-lucide-user"
        :fields="fields"
        @submit="onSubmit"
      >
    
        <template #footer>
          <UButton class="w-full block" color="secondary" to="/">Back</UButton>
        </template>
    </UAuthForm>
    </UPageCard>
  </div>
</template>

