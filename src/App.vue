
<script setup lang="ts">
import Toast from 'primevue/toast';
import Button from 'primevue/button';

import UserTab from './components/UserTab.vue';
</script>

<template>
  <Toast />
  <header>
   <Button label="Refresh"></Button>
  </header>
  <UserTab></UserTab> 
</template>

<style scoped>
</style>