
<script setup lang="ts">
import type { StatusGroup } from '@/models/config.model';
import type { IssueSummary } from '@/models/user.model';
import Card from 'primevue/card';
import Button from 'primevue/button';

const props = defineProps(['issue', 'group'])

const issue: IssueSummary = props.issue;
const color: string = (props.group as StatusGroup).statuses.find((status) => status.name === issue.status.name)?.color ?? "#ffffff";

function numberOfHours(d: Date)
{
  var diff = (new Date().getTime() - d.getTime()) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff));
}
</script>

<template>
  <main>
    <Card>
      <template #title><img v-tooltip="issue.issueType.name" :src="issue.issueType.icon"> {{ issue.id }}</template>
      <template #subtitle>{{ issue.status.name }} since {{ numberOfHours(issue.status.lastUpdate) }} hours</template>
      <template #content>{{ issue.title }}</template>
      <template #footer>
        <a :href="issue.link" target="_blank">
          <Button label="Jira" icon="pi pi-external-link" aria-label="Jira issue link" />
        </a>
      </template>
    </Card>
  </main>
</template>

<style scoped>
  main {
    width: 100%;
    padding: 5px;
  }

  .p-card {
    background-color: v-bind(color);
  }
</style>