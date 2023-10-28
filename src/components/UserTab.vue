
<script setup lang="ts">
import { type Issue } from '../models/issue.model';
import { type User, type IssueSummary } from '../models/user.model';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import IssueCard from './IssueCard.vue';
import axios from 'axios'
import { onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { groupBy, onlyUnique } from '../helpers/array.helper';
import { getCurrentInstance } from 'vue'
import type { Config } from '@/models/config.model';

const config: Config = getCurrentInstance()?.appContext.config.globalProperties.config;

const toast = useToast();

const statusGroup = config.jira.status_group;
const allIssuesStatus = statusGroup.flatMap(group => group.statuses.map(status => status.name));
const columnSize = 100 / statusGroup.length + '%'

const users = ref([] as User[]);

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

defineExpose({
  loadIssues
});
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
           <div v-for="group in statusGroup" :key="group.name" class="column">
              <h2>{{ group.name }}</h2>
              <IssueCard v-for="issue in user.issues.filter(issue => group.statuses.find(status => status.name === issue.status) != null).sort((a, b) => a.status.localeCompare(b.status))" :key="issue.id" :issue="issue" :group="group"></IssueCard>
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