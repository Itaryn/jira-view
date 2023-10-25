
<script setup lang="ts">
import Card from 'primevue/card';
const issue = defineProps(['issue'])
</script>

<template>
  <main>
    <Card>
      <template #title>{{ issue.issue.id }} - {{ issue.issue.issueType }}</template>
      <template #subtitle>{{ issue.issue.status }}</template>
      <template #content>{{ issue.issue.title }}</template>
    </Card>
  </main>
</template>

<style scoped>
  main {
    width: 100%;
    padding: 5px;
  }
</style>