
<script setup lang="ts">
    const userCookies = useCookie('accessToken', {
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
    });
    const openSignup = ref(false);
    const openLogin = ref(false);

    import * as v from "valibot";
    import type { FormSubmitEvent } from "@nuxt/ui";
    const { register, user, login } = useFirebaseAuth();

    const signInSchema = v.object({
        email: v.pipe(v.string(), v.email("Invalid email address")),
        username: v.pipe(v.string(), v.minLength(3, "Username must be at least 3 characters long")),
        password: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters long")),
    });

    type SignInSchema = v.InferOutput<typeof signInSchema>;

    const signInState = reactive<SignInSchema>({
        email: "",
        username: "",
        password: "",
    })

    const toast = useToast();
    async function onSignUpSubmit(event: FormSubmitEvent<SignInSchema>) {
        openSignup.value = false;
        const loadingToast = toast.add({
            title: "Loading...",
            color: "neutral",
            icon: "eos-icons:loading"
        })
        register(event.data.email, event.data.password, event.data.username)
            .then((returnVal) => {
                toast.update(loadingToast.id, {
                    title: "Success!",
                    color: "success",
                    icon: "eos-icons:check-circle"
                })
            })
            .catch((error: Error) => {
                toast.update(loadingToast.id, {
                    title: "Error",
                    description: error.message,
                    color: "error",
                    icon: "eos-icons:close-circle"
                })
            })
    }

    const loginInSchema = v.object({
        email: v.pipe(v.string(), v.email("Invalid email address")),
        password: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters long")),
    });

    type LoginSchema = v.InferOutput<typeof loginInSchema>;
    
    const loginState = reactive<LoginSchema>({
        email: "",
        password: "",
    }) 

    async function onLoginSubmit(event: FormSubmitEvent<LoginSchema>) {
        openLogin.value = false;
        const loadingToast = toast.add({
            title: "Loading...",
            color: "neutral",
            icon: "eos-icons:loading"
        })
        
        login(event.data.email, event.data.password)
            .then((returnVal: any) => {
                if(!returnVal.status) {
                    toast.update(loadingToast.id, {
                        title: "Error",
                        description: (returnVal.message as Error).message,
                        color: "error",
                        icon: "eos-icons:close-circle"
                    })

                    return;
                }

                console.log(returnVal)
                userCookies.value = returnVal.accessToken;

                toast.update(loadingToast.id, {
                    title: "Success!",
                    color: "success",
                    description: "You have successfully logged in. Redirecting soon..",
                    icon: "eos-icons:check-circle"
                })
                console.log(user);
            })
            .catch((error: Error) => {
                toast.update(loadingToast.id, {
                    title: "Error",
                    description: error.message,
                    color: "error",
                    icon: "eos-icons:close-circle"
                })
            })
    }
</script>

<template>
    <UModal v-model:open="openSignup">
        <template #header>
            <h2 class="text-2xl font-semibold">Sign Up</h2>
        </template>
        <template #body>
            <UForm :schema="signInSchema" :state="signInState" @submit="onSignUpSubmit">
                <UFormField name="email" label="Email">
                    <UInput v-model="signInState.email" type="email" placeholder="Enter your email" />
                </UFormField>
                <UFormField name="username" label="Username">
                    <UInput v-model="signInState.username" type="text" placeholder="Choose a username" />
                </UFormField>
                <UFormField name="password" label="Password">
                    <UInput v-model="signInState.password" type="password" placeholder="Create a password" />
                </UFormField>
                <div class="mt-4">
                    <UButton type="submit" color="primary" class="">Sign Up</UButton>
                </div>
            </UForm>
        </template>
        <template #footer>
            <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" @click="openSignup = false">Close</button>
        </template>
    </UModal>
    <UModal v-model:open="openLogin">
        <template #header>
            <h2 class="text-2xl font-semibold">Login</h2>
        </template>
        <template #body>
            <UForm :schema="loginInSchema" :state="loginState" @submit="onLoginSubmit">
                <UFormField name="email" label="Email">
                    <UInput v-model="loginState.email" type="email" placeholder="Enter your email" />
                </UFormField>
                <UFormField name="password" label="Password">
                    <UInput v-model="loginState.password" type="password" placeholder="Enter your password" />
                </UFormField>
                <div class="mt-4">
                    <UButton type="submit" color="primary" class="">Login</UButton>
                </div>
            </UForm>
        </template>
        <template #footer>
            <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" @click="openLogin = false">Close</button>
        </template>
    </UModal>
    <UContainer class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
        <h1 class="text-4xl font-bold mb-4">Welcome to Our Application</h1>
        <p class="text-lg text-gray-700">This is the home page of our awesome application built with Vue.js and UContainer.</p>
        
        <UButton size="xl" class="mt-6" color="primary" @click="openSignup = true">
            Sign Up
        </UButton>
        <UButton size="xl" class="mt-6 ml-4" color="secondary" @click="openLogin = true">
            Login
        </UButton>
    </UContainer>
</template>