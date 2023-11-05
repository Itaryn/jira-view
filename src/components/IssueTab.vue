<script setup lang="ts">
import type { IssueSummary } from '@/models/user.model';
import { getCurrentInstance, onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios'
import type { Config } from '@/models/config.model';
import { toIssueSummary } from '@/services/jira.service';
const toast = useToast();
const config: Config = getCurrentInstance()?.appContext.config.globalProperties.config;

const props = defineProps(['issues', 'statusGroup', 'selectedStatus', 'loading']);

const tasks = ref([] as IssueSummary[])

onMounted(() => formatIssues())

async function formatIssues(): Promise<void> {
    const loadingTasks: IssueSummary[] = [];
    for (let index = 0; index < props.issues.length; index++) {
        const issue: IssueSummary = props.issues[index];
        if (issue.issueType.hierarchyLevel == -1 && issue.parent != null) {
            if (loadingTasks.find(task => task.id === issue.parent?.id) === undefined) {
                try {
                    const result = await axios({
                        url: issue.parent?.self,
                        method: 'GET',
                        headers: { 'Authorization': 'Basic ' + btoa(config.jira.user + ":" + config.jira.api_token)}});
                    const parentIssue = toIssueSummary(result.data);
                    updateChildren(parentIssue, issue);
                    
                    loadingTasks.push(parentIssue)
                } catch(error) {
                    toast.add({ severity: 'error', summary: 'Error when getting tasks', detail: error});
                };
            } else {
                const parentIssue = loadingTasks.find(task => task.id === issue.parent?.id);
                if (parentIssue != undefined) {
                    updateChildren(parentIssue, issue);
                }
            }
        } else if (loadingTasks.find(task => task.id === issue.id) === undefined) {
            loadingTasks.push(issue);
        }
    }
    tasks.value = loadingTasks;

    function updateChildren(parentIssue: IssueSummary, issue: IssueSummary) {
        const indexChild = parentIssue.children?.findIndex(child => child.id === issue.id) ?? -1;
        if (indexChild != -1) {
            parentIssue.children?.splice(indexChild, 1);
            parentIssue.children?.push(issue);
        }
    }
}
</script>

<template>
</template>

<style scoped>
</style>