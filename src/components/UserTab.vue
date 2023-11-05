
<script setup lang="ts">
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import IssueCard from './IssueCard.vue';
import { type IssueSummary, type User } from '../models/user.model';
import type { Status, StatusGroup } from '@/models/config.model';
import { onMounted, onUpdated, ref } from 'vue';
import { groupBy } from '@/helpers/array.helper';

function getStatusGroupFiltered(statusGroup: StatusGroup[], selectedStatus: Status[]) {
    return (statusGroup as StatusGroup[]).map(group => {
            return {
                name: group.name,
                statuses: group.statuses.filter(status => selectedStatus?.find((selectedStatus: Status) => selectedStatus.name === status.name) !== undefined)
            } as StatusGroup
        }).filter(group => group.statuses.length > 0)
}

const props = defineProps(['issues', 'statusGroup', 'selectedStatus', 'loading']);
const statusGroupFiltered = ref(getStatusGroupFiltered(props.statusGroup, props.selectedStatus));
const columnSize = ref(100 / statusGroupFiltered.value.length + '%');
const users = ref([] as User[])

onMounted(() => {
    users.value = Object.entries(groupBy(props.issues, (issue: IssueSummary) => issue.displayName ?? "")).map(entry => {return {
        displayName: entry[0],
        icon: entry[1][0].icon,
        issues: entry[1]
    }}).sort((a, b) => a.displayName.localeCompare(b.displayName));

    statusGroupFiltered.value = getStatusGroupFiltered(props.statusGroup, props.selectedStatus);
    columnSize.value = 100 / statusGroupFiltered.value.length + '%';
})
</script>

<template>
    <main>
     <TabView :scrollable="true">
      <TabPanel v-for="user in users" :key="user.displayName">
        <template #header>
            <img class="avatar" :src="user.icon" alt="Avatar" width="32" />
            <span class="p-tabview-title">{{ user.displayName }}</span>
        </template>
        <div id="panel-content">
           <div v-for="group in statusGroupFiltered" :key="group.name" class="column">
              <h2>{{ group.name }}</h2>
              <IssueCard v-for="issue in user.issues.filter((issue: IssueSummary) => group.statuses.find((status: Status) => status.name === issue.status) != null).sort((a: IssueSummary, b: IssueSummary) => a.status.localeCompare(b.status))" :key="issue.id" :issue="issue" :group="group"></IssueCard>
           </div>
        </div>
      </TabPanel>
     </TabView>
    </main>
</template>

<style scoped>
#panel-content {
   display: flex;
   justify-content: space-between;
   gap: 10px;
}

.column {
   display: flex;
   flex-direction: column;
   align-items: center;
   width: v-bind(columnSize);
}

.avatar {
    margin-right: 5px;
}

:deep(.p-tabview-nav-container) {
    position: sticky;
    top: 0;
}
</style>