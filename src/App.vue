
<script setup lang="ts">
import Toast from 'primevue/toast';
import Button from 'primevue/button';
import UserTab from './components/UserTab.vue';
</script>

<template>
  <Toast />
  <header>
   <Button label="Refresh" @click="$refs.userTab.loadIssues()"></Button>
  </header>
  <UserTab ref="userTab"></UserTab> 
</template>

<style scoped>
</style>