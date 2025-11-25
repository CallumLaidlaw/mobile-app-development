<script setup lang="ts">
import { useRouter } from "vue-router"
import { useFirestore, useCollection } from "vuefire"
import { collection, deleteDoc, doc } from "firebase/firestore"
import { ref, computed, onMounted } from "vue"
import { ClientOnly } from "#components"

const router = useRouter()
const db = useFirestore()
const toast = useToast()

// Reactive shopping list & checked items
const shoppingList = ref<any[]>([])
const checked = ref<string[]>([])

// Only fetch data on client
onMounted(async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    router.push("/login")
    return
  }

  // Firestore reference
  const shoppingListRef = collection(db, "users", currentUser.uid, "shoppingCart")
  const collectionData = useCollection(shoppingListRef)

  // Watch Firestore changes
  collectionData.value && (shoppingList.value = collectionData.value)
})

// Computed items wrapper
const items = computed(() => shoppingList.value ?? [])

// Remove selected items
async function removeSelected() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return

  if (!checked.value.length) {
    toast.add({ title: "Nothing selected", description: "Select items to remove" })
    return
  }

  try {
    const deletes = checked.value.map(id =>
      deleteDoc(doc(db, "users", currentUser.uid, "shoppingCart", id))
    )
    await Promise.all(deletes)
    checked.value = []
    toast.add({ title: "Removed", description: "Selected items removed" })
  } catch (err) {
    console.error(err)
    toast.add({ title: "Error", color: "error", description: "Could not remove items" })
  }
}

// Checkbox selection toggle
function selectedItem(itemId: string) {
  if (checked.value.includes(itemId)) {
    checked.value = checked.value.filter(id => id !== itemId)
  } else {
    checked.value.push(itemId)
  }
}
</script>

<template>
  <ClientOnly>
    <UApp>
      <!-- Top bar -->
      <div class="sticky bg-default border-b-[0.1px] border-b-accented w-full top-0 flex justify-between p-2">
        <h1 class="text-2xl font-bold">PortionPro</h1>
        <UAvatar icon="mdi:user" size="lg" />
      </div>

      <div class="p-4 max-w-3xl mx-auto">
        <h1 class="text-3xl mb-4 text-center">Shopping List</h1>

        <!-- Shopping items -->
        <div v-if="items.length > 0" class="space-y-4">
          <div v-for="item in items" :key="item.id">
            <UCard class="flex justify-between items-center p-4">
              <div>
                <h1 class="text-2xl font-semibold">{{ item.item }}</h1>
                <h2 class="text-gray-600">{{ item.amount }} {{ item.unit }}</h2>
              </div>
              <UCheckbox
                :model-value="checked.includes(item.id)"
                @click="selectedItem(item.id)"
              />
            </UCard>
          </div>

          <!-- Remove selected button -->
          <div class="flex justify-end pt-4">
            <UButton color="error" variant="outline" size="sm" @click="removeSelected">
              Remove selected
            </UButton>
          </div>
        </div>

        <!-- Empty state -->
        <p v-else class="text-center text-gray-500 mt-6">
          Your shopping list is empty.
        </p>
      </div>

      <div class="sticky bottom-4 left-4 p-4">
        <UButton to="/home">Home</UButton>
      </div>
    </UApp>
  </ClientOnly>
</template>
