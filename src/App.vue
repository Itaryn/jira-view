<script setup lang="ts">
import Toast from 'primevue/toast';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
import SelectButton from 'primevue/selectbutton';
import UserTab from './components/UserTab.vue';
import IssueTab from './components/IssueTab.vue';
import { type Issue, type IssueDetailed } from './models/issue.model';
import { type IssueSummary } from './models/user.model';
import axios from 'axios'
import { getCurrentInstance, onMounted, ref } from 'vue';
import { onlyUnique } from './helpers/array.helper';
import { toIssueSummary } from './services/jira.service';
import { useToast } from 'primevue/usetoast';
import type { Config } from './models/config.model';
const toast = useToast();

const config: Config = getCurrentInstance()?.appContext.config.globalProperties.config;

const statusGroup = config.jira.status_group;
const allIssuesStatus = statusGroup.flatMap(group => group.statuses.map(status => status.name));

const issues = ref([] as IssueSummary[]);
const selectedStatus = ref(statusGroup.flatMap(group => group.statuses));
const selectedMode = ref({ "name": "By user" });
const modes = ref([
    { "name": "By user" },
    { "name": "By issue" }
])
const loading = ref(true);

onMounted(() => {
    loadIssues();
})

function loadIssues(start: number = 0) {
    if (start == 0) {
        loading.value = true;
        issues.value = [];
    }

    axios({
        url: `/rest/api/latest/search/jql?jql=filter=${config.jira.filter_id}&maxResults=${config.jira.max_results}&startAt=${start}&expand=changelog`,
        method: 'GET',
        headers: { 'Authorization': 'Basic ' + btoa(config.jira.user + ":" + config.jira.api_token) }
    }).then(result => {
        Promise.all(result.data.issues.map((issue: Issue) => axios({
            url: `/rest/api/latest/issue/${issue.id}`,
            method: 'GET',
            headers: { 'Authorization': 'Basic ' + btoa(config.jira.user + ":" + config.jira.api_token) }
        }).then(result => toIssueSummary(result.data as IssueDetailed))
            .catch(error => {
                toast.add({ severity: 'error', summary: `Error when getting issue ${issue.key}`, detail: error });
            }))).then((detailedIssues: IssueSummary[]) => {
                issues.value = detailedIssues;
                if (result.data.total > result.data.startAt + result.data.maxResults) {
                    loadIssues(start + config.jira.max_results);
                } else {
                    loading.value = false;

                    toast.add({ severity: 'success', summary: 'Issues loaded', detail: issues.value.length + ' issues loaded inside board.', life: 3000 });

                    const missingTypes = issues.value
                        .filter((issue: IssueSummary) => allIssuesStatus.find((status: string) => issue.status.name === status) === undefined)
                        .map((issue: IssueSummary) => issue.status.name)
                        .filter(onlyUnique);

                    if (missingTypes.length > 0) {
                        toast.add({ severity: 'warn', summary: 'Issue type missing', detail: `The type${missingTypes.length > 1 ? 's' : ''} '${missingTypes.join("', '")}' ${missingTypes.length > 1 ? 'are' : 'is'} missing.` })
                    }
                }
            });
    }).catch(error => {
        loading.value = false;
        toast.add({ severity: 'error', summary: 'Error when getting tasks', detail: error });
    });
}
</script>

<template>
    <Toast />
    <header>
        <Button label="Refresh" @click="loadIssues()"></Button>
        <span class="p-float-label">
            <MultiSelect id="filter-status" v-model="selectedStatus" :options="statusGroup" optionLabel="name"
                optionGroupLabel="name" optionGroupChildren="statuses" placeholder="Select statuses">
                <template #optiongroup="slotProps">
                    {{ slotProps.option.name }}
                </template>
            </MultiSelect>
            <label for="filter-status">Filter status</label>
        </span>
    </header>
    <main>
        <UserTab v-if="selectedMode.name === 'By user' && !loading" :issues="issues" :statusGroup="statusGroup"
            :selectedStatus="selectedStatus" :loading="loading"></UserTab>
        <IssueTab v-if="selectedMode.name === 'By issue' && !loading" :issues="issues" :statusGroup="statusGroup"
            :selectedStatus="selectedStatus" :loading="loading"></IssueTab>
    </main>
</template>

<style scoped>
header {
    display: flex;
    gap: 10px;
}
</style>