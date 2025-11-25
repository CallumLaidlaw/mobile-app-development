<script setup lang="ts">
const currentUser = await getCurrentUser();

if(currentUser) {
    const router = useRouter();
    router.push('/home');
}

import { signInWithEmailAndPassword } from 'firebase/auth';

import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const toast = useToast();

const user = await getCurrentUser();
const { public: {vuefireVersion, nuxtVuefireVersion }, } = useRuntimeConfig();

const router = useRouter();
const route = useRoute();

const auth = useFirebaseAuth()!;

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
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
  password: z.string('Password is required').min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  signInWithEmailAndPassword(auth, payload.data.email, payload.data.password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      toast.add({ title: 'Login Successful', description: `Welcome back, ${user.email}` });
      const redirectTo = (route.query.redirect as string) || '/home';
      router.push(redirectTo);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      toast.add({ title: 'Login Failed', description: errorMessage });
    });
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 translate-y-1/2 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Login"
        description="Enter your credentials to access your account."
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

