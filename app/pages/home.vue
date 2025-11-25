<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { routerKey, useRouter } from 'vue-router'
import { getCurrentUser } from '#imports'

// Firestore imports
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore"
import Header from '~/components/Header.vue';

const user = await getCurrentUser();

const router = useRouter();
if (!user) {
  router.push('/login');
}

// --- Load Recipes ---
const recipes = ref<any[]>([]);

const db = getFirestore();

onMounted(async () => {
  const q = query(
    collection(db, "recipes"),
    orderBy("createdAt", "desc"), 
  );

  const snapshot = await getDocs(q);

  recipes.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
});

function redirect(id: string) {
    router.push(`/recipe/${id}`)
}
</script>

<template>
  <UApp>
    <Header />

    <UMain>
      <h1 class="text-4xl text-center mt-1">PortionPro</h1>

      <div class="m-2 mt-4 h-3/4 max-h-3/4 overflow-scroll">
        <UPageList>

          <!-- Loop through recipes -->
          <UPageCard
            v-for="recipe in recipes"
            :key="recipe.id"
            variant="soft"
            class="my-2 cursor-pointer"
            @click="redirect(recipe.id)"
          >
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-2xl mb-2">{{ recipe.title }}</h2>
                <p class="mb-4">{{ recipe.description }}</p>
              </div>

              <div class="max-h-24 max-w-24 w-full h-full">
                <img
                  :src="recipe.imageUrl || ''"
                  class="object-contain w-full h-full rounded-lg"
                />
              </div>
            </div>
          </UPageCard>

        </UPageList>
      </div>
    </UMain>

    <UFooter>
      <UButton class="w-full p-2 block mr-1" to="/shoppingcart">Shopping Cart</UButton>
      <UButton class="w-full p-2 ml-1 block" to="/recipe/create">Create Recipe</UButton>
    </UFooter>
  </UApp>
</template>
