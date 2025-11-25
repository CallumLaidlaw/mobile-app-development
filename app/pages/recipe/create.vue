<script setup lang="ts">
const currentUser = await getCurrentUser();

if(!currentUser) {
    const router = useRouter();
    router.push('/');
}

import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { ref } from 'vue'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useFirebaseStorage } from 'vuefire'
import { useFirestore } from 'vuefire'
import { doc, setDoc } from "firebase/firestore"
import { routerKey } from 'vue-router';

const storage = useFirebaseStorage()
const db = useFirestore()

// Upload constraints
const maxFileSize = 2 * 1024 * 1024;
const minDimensions = { width: 200, height: 200 };
const maxDimensions = { width: 4096, height: 4096 };
const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return ((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const ingredientRegex = /^\d+(\.\d+)?\s+[a-zA-Z]+\s+.+$/

const schema = z.object({
    title: z.string().min(3, "Must be at least 3 characters"),
    description: z.string().min(10, "Must be at least 10 characters"),
    ingredients: z.array(
        z.string().refine(value => ingredientRegex.test(value), {
            message: "Ingredients must follow the format: '100 g flour'"
        })
    ).min(1, "At least one ingredient required"),
    steps: z.string().min(10, "Must be at least 10 characters"),
    image: z.instanceof(File, { message: "Please select an image" })
        .refine((file) => file.size <= maxFileSize, {
            message: `Image must be < ${formatBytes(maxFileSize)}`
        })
        .refine((file) => acceptedImageTypes.includes(file.type), {
            message: "Image must be WEBP, PNG, or JPG"
        })
        .refine((file) =>
            new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const { width, height } = img;
                        resolve(
                            width >= minDimensions.width &&
                            height >= minDimensions.height &&
                            width <= maxDimensions.width &&
                            height <= maxDimensions.height
                        );
                    };
                    img.src = e.target?.result as string;
                };
                reader.readAsDataURL(file);
            }),
            { message: `Invalid image dimensions` }
        )
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    title: '',
    description: '',
    ingredients: [],
    steps: '',
    image: undefined
})

const toast = useToast()
const router = useRouter()

async function onSubmit({ data }: FormSubmitEvent<Schema>) {

    if (!data) {
        toast.add({ title: "Error", color: "error", description: "Invalid form data" })
        return
    }

    let uploadingToast = toast.add({
        title: "Uploading recipe...",
        description: `Processing ${data.title}`
    })

    // Create unique storage file path
    try {
        const fileName = `recipes/${Date.now()}-${data.image.name}`
    const fileRef = storageRef(storage, fileName)

    // Upload file
    await uploadBytes(fileRef, data.image)

    // Retrieve download URL
    const downloadUrl = await getDownloadURL(fileRef)

    // Create Firestore document
    const newId = crypto.randomUUID()

    await setDoc(doc(db, "recipes", newId), {
        title: data.title,
        description: data.description,
        ingredients: data.ingredients,
        steps: data.steps,
        imageUrl: downloadUrl,
        createdAt: Date.now()
    })

    toast.update(uploadingToast.id, {
        title: "Recipe Uploaded!",
        description: `${data.title} added successfully`
    })

    setTimeout(() => {
        router.push("/home")
    }, 2000)
    } catch (error) {
        toast.update(uploadingToast.id, {
            title: "Upload Failed",
            color: "error",
            description: `Error uploading recipe: ${(error as Error).message}`
        })
        console.log(error as Error)
    }
}
</script>

<template>
    <UApp>
        <div class="sticky bg-default border-b-[0.1px] border-b-accented w-full top-0 flex justify-between p-2">
            <h1 class="text-2xl">PortionPro</h1>
            <UAvatar icon="mdi:user" size="lg" />
        </div>
        <UForm :schema="schema" :state="state" @error="console.log('error', $event)" @submit="onSubmit"
            class="p-4 border rounded-lg top-1/2 left-1/2 absolute -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)]">
            <h1 class="text-3xl mb-4 text-center">Create a New Recipe</h1>

            <UFormField name="title" label="Recipe Title" class="mb-4">
                <UInput v-model="state.title" placeholder="Title..." class="w-full" />
            </UFormField>

            <UFormField name="description" label="Description" class="mb-4">
                <UTextarea v-model="state.description" placeholder="Enter description..." class="w-full" />
            </UFormField>

            <UFormField name="ingredients" label="Ingredients" hint="Press enter to add" class="mb-4">
                <template #default="{ error }">
                    <UInputTags v-model="state.ingredients" placeholder="Add ingredients..." class="w-full"
                        :error="error" />
                </template>
            </UFormField>

            <UFormField name="steps" label="Preparation Steps" class="mb-4">
                <UTextarea v-model="state.steps" placeholder="Describe the steps..." class="w-full" />
            </UFormField>

            <UFormField name="image" label="Recipe Image" class="mb-4">
                <UFileUpload v-model="state.image" accept="image/*" description="WEBP, PNG, JPG (max 2MB)" />
            </UFormField>

            <UButton type="submit" color="primary">Submit Recipe</UButton>
        </UForm>
    </UApp>
</template>
