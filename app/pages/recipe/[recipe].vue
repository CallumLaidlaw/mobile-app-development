<script setup lang="ts">
const currentUser = await getCurrentUser();

if (!currentUser) {
    const router = useRouter();
    router.push('/');
}

import { useRoute } from 'vue-router'
import { useFirestore, useDocument } from 'vuefire'
import { doc, collection, addDoc } from 'firebase/firestore'
import { computed, ref, watch } from 'vue'

const route = useRoute()
const db = useFirestore()

// Document ID from route
const recipeId = route.params.recipe as string
const recipeRef = doc(db, "recipes", recipeId)
const recipe = useDocument(recipeRef)

// --------------------------------------------------
// Portion size & ingredient scaling
// --------------------------------------------------

const portion = ref(1) // ✔ default portion size = 1
const baseIngredients = ref<string[]>([]) // unmodified original
const scaledIngredients = ref<string[]>([])

watch(recipe, (newVal) => {
  if (newVal?.ingredients) {
    baseIngredients.value = [...newVal.ingredients]
    scaledIngredients.value = [...newVal.ingredients]
    portion.value = 1 // always reset to 1 when recipe loads
  }
})

function parseIngredient(str: string) {
  const parts = str.trim().split(" ")
  const amount = parseFloat(parts[0]!)
  if (isNaN(amount)) return null

  const unit = parts[1]
  const item = parts.slice(2).join(" ")

  return { amount, unit, item }
}

function buildIngredient({ amount, unit, item }: any) {
  return `${amount} ${unit} ${item}`
}

function rescaleIngredients() {
  // Always scale from ORIGINAL values, not modified ones
  scaledIngredients.value = baseIngredients.value.map(ing => {
    const parsed = parseIngredient(ing)
    if (!parsed) return ing

    const newAmount = +(parsed.amount * portion.value).toFixed(2)

    return buildIngredient({
      amount: newAmount,
      unit: parsed.unit,
      item: parsed.item
    })
  })
}

function increase() {
  portion.value++
  rescaleIngredients()
}

function decrease() {
  if (portion.value > 1) {
    portion.value--
    rescaleIngredients()
  }
}

// --------------------------------------------------
// Add to shopping cart (unchanged except for scaled list)
// --------------------------------------------------

const toast = useToast()

async function addToShoppingCart() {
  if (!currentUser) return

  const userId = currentUser.uid
  const shoppingCartRef = collection(db, "users", userId, "shoppingCart")

  try {
    for (const ingredient of scaledIngredients.value) {
      const parsed = parseIngredient(ingredient)
      if (!parsed) continue

      await addDoc(shoppingCartRef, {
        amount: parsed.amount,
        unit: parsed.unit,
        item: parsed.item,
        recipeId,
        portion: portion.value,
        addedAt: Date.now()
      })
    }

    toast.add({
      title: "Added to Shopping Cart",
      description: "Ingredients successfully added!"
    })
  } catch (err) {
    toast.add({
      title: "Error",
      color: "error",
      description: "Could not add ingredients to cart"
    })
    console.error(err)
  }
}

// --------------------------------------------------
// Recipe output for display
// --------------------------------------------------

const recipeData = computed(() => {
  if (!recipe.value) return ""

  return `
${recipe.value.description}

Ingredients (Portions: ${portion.value}):
${scaledIngredients.value.join('\n')}

Steps:
${recipe.value.steps}
  `
})
</script>

<template>
  <div class="sticky bg-default border-b-[0.1px] border-b-accented w-full top-0 flex justify-between p-2">
      <h1 class="text-2xl">PortionPro</h1>
      <UAvatar icon="mdi:user" size="lg" />
  </div>
  <div v-if="recipe" class="p-4 h-full w-full">

    <UBlogPost
      :title="recipe.title"
      :description="recipeData"
      :image="recipe.imageUrl"
      class="whitespace-pre-wrap"
    />
  </div>

  <p v-else>Loading...</p>

  <!-- Bottom button area -->
  <div class="absolute bottom-4 right-4 flex items-center gap-3">

    <!-- Buttons -->
    <UButton to="/home" size="lg">Home</UButton>
    <UButton size="lg" @click="decrease">–</UButton>
    <UButton size="lg" @click="increase">+</UButton>

    <UButton size="lg" color="primary" @click="addToShoppingCart">
      Add to Shopping Cart
    </UButton>
  </div>
</template>
