<script setup lang="ts">
import { getAuth, signOut } from "firebase/auth";

const auth = getAuth();
await signOut(auth);

useRouter().push("/")
</script>

<template>
<div></div>
</template>