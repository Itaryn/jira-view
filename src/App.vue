
<script setup lang="ts">
import Toast from 'primevue/toast';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
import UserTab from './components/UserTab.vue';
import { type Issue } from './models/issue.model';
import { type IssueSummary, type User } from './models/user.model';
import axios from 'axios'
import { getCurrentInstance, onMounted, ref } from 'vue';
import { groupBy, onlyUnique } from './helpers/array.helper';
import { useToast } from 'primevue/usetoast';
import type { Config, Status, StatusGroup } from './models/config.model';
const toast = useToast();

const config: Config = getCurrentInstance()?.appContext.config.globalProperties.config;

const statusGroup = config.jira.status_group;
const allIssuesStatus = statusGroup.flatMap(group => group.statuses.map(status => status.name));

const users = ref([] as User[]);
const selectedStatus = ref(statusGroup.flatMap(group => group.statuses));

onMounted(() => {
    loadIssues();
})

function loadIssues(start: number = 0) {
    axios({
        url: `/rest/api/2/search?jql=filter=${config.jira.filter_id}&maxResults=${config.jira.max_results}&startAt=${start}`,
        method: 'GET',
        headers: { 'Authorization': 'Basic ' + btoa(config.jira.user + ":" + config.jira.api_token)}
    }).then(result => {
        const issues = result.data.issues.map((issue: Issue) => {
            return {
                displayName: issue.fields.assignee.displayName,
                icon: issue.fields.assignee.avatarUrls['32x32'],
                id: issue.key,
                link: `${issue.self.substring(0, issue.self.indexOf('.net/') + 5)}browse/${issue.key}`,
                issueType: {
                    name: issue.fields.issuetype.name,
                    icon: issue.fields.issuetype.iconUrl
                },
                status: issue.fields.status.name,
                title: issue.fields.summary
            } as IssueSummary;
        });

        const byUsers = Object.entries(groupBy(issues, (issue: IssueSummary) => issue.displayName ?? "")).map(entry => {return {
            displayName: entry[0],
            icon: entry[1][0].icon,
            issues: entry[1]
        }}).sort((a, b) => a.displayName.localeCompare(b.displayName));

        if (start === 0) {
            users.value = byUsers;
        } else {
            byUsers.forEach(user => {
                const userPresent = users.value.find(u => u.displayName === user.displayName);
                if (userPresent === undefined) {
                    users.value.push(user);
                } else {
                    userPresent.issues = userPresent.issues.concat(user.issues);
                };
            });
        }

        if (result.data.total > result.data.startAt + result.data.maxResults) {
            loadIssues(start + config.jira.max_results);
        } else {
            const allIssues = users.value.flatMap(user => user.issues);

            toast.add({ severity: 'success', summary: 'Issues loaded', detail: allIssues.length + ' issues loaded inside board.', life: 3000 });

            const missingTypes = allIssues
                .filter((issue: IssueSummary) => allIssuesStatus.find((status: string) => issue.status === status) === undefined)
                .map((issue: IssueSummary) => issue.status)
                .filter(onlyUnique);
            if (missingTypes.length > 0) {
                toast.add({ severity: 'warn', summary: 'Issue type missing', detail: `The type${missingTypes.length > 1 ? 's' : ''} '${missingTypes.join("', '")}' ${missingTypes.length > 1 ? 'are' : 'is'} missing.` })
            }
        }
    }).catch(error => {
        toast.add({ severity: 'error', summary: 'Error when getting tasks', detail: error});
    });
}
</script>

<template>
  <Toast />
  <header>
   <Button label="Refresh" @click="loadIssues()"></Button>
   <span class="p-float-label">
    <MultiSelect id="filter-status" v-model="selectedStatus" :options="statusGroup" optionLabel="name" optionGroupLabel="name" optionGroupChildren="statuses" placeholder="Select statuses">
      <template #optiongroup="slotProps">
          {{ slotProps.option.name }}
      </template>
    </MultiSelect>
      <label for="filter-status">Filter status</label>
  </span>
  </header>
  <UserTab :users="users" :statusGroup="statusGroup" :selectedStatus="selectedStatus"></UserTab> 
</template>

<style scoped>
header {
  display: flex;
  gap: 10px;
}
</style>