<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
const items = ref<DropdownMenuItem[]>([
  {
    label: 'Logout',
    icon: 'i-material-symbols-logout',
    onSelect() {
      useRouter().push("/logout")
    }
  }
])
</script>

<template>
  <div class="sticky bg-default border-b-[0.1px] border-b-accented w-full top-0 flex justify-between p-2">
    <h1 class="text-2xl">PortionPro</h1>
    <UDropdownMenu :modal="false" :items="items">


      <UAvatar icon="mdi:user" size="lg" />
    </UDropdownMenu>
  </div>
</template>