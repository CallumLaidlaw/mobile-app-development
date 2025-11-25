<script setup lang="ts">
const user = await getCurrentUser();

if(user) {
    const router = useRouter();
    router.push('/home');
}

</script>

<template>
    <UApp>
        <!-- <UHeader /> -->

        <UMain class="absolute top-1/3">
            <h1 class="text-4xl text-center mt-1">PortionPro</h1>
            <p class="text-xl text-center mt-4">Welcome to PortionPro, your personal portion control assistant! To begin, first login or create an account using the buttons above</p>
        </UMain>

        <UFooter class="w-full h-full bottom-0 absolute">
            <UButton class="w-full p-2 block mr-1" to="/login">Login</UButton>
            <UButton class="w-full p-2 ml-1 block" to="/register">Register</UButton>
        </UFooter>
    </UApp>
</template>