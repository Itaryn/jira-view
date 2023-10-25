
<script setup lang="ts">
import { type Issue } from './models/issue.model';
import { type User, type IssueSummary } from './models/user.model';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import IssueCard from './components/IssueCard.vue';
import axios from 'axios'
import { ref } from 'vue';

const openIssues = ["Ouvert", "Rouvert"]
const inProgressIssues = ["En cours", "Revue technique", "Assurance qualité"]
const resolvedIssues = ["Résolu", "Fermé"]

const FILTER_ID = "";
const USER = "";
const API_TOKEN = "";


const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  arr.reduce((groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);

const users = ref([] as User[]);
axios({
      url: "/rest/api/2/search?jql=filter=" + FILTER_ID,
      method: 'GET',
      headers: { 'Authorization': 'Basic ' + btoa(USER + ":" + API_TOKEN)}
   }).then(result => {
      const issues = result.data.issues.map((issue: Issue) => {
         return {
            displayName: issue.fields.assignee.displayName,
            id: issue.key,
            issueType: issue.fields.issuetype.name,
            status: issue.fields.status.name,
            title: issue.fields.summary
         } as IssueSummary;
      
      });
      users.value = Object.entries(groupBy(issues, (issue: IssueSummary) => issue.displayName ?? "")).map(entry => {return {
         displayName: entry[0],
         issues: entry[1]
      }});
   }).catch(error => {
      console.log(error);
      throw error;
   });
</script>

<template>
  <header>
   <Button label="Refresh"></Button>
  </header>

  <main>
   <TabView :scrollable="true">
    <TabPanel v-for="user in users" :key="user.displayName" :header="user.displayName">
      <div id="panel-content">
         <div class="column">
            <p>Ouvert</p>
            <IssueCard v-for="issue in user.issues.filter(issue => openIssues.find(a => a === issue.status) != null)" :key="issue.id" :issue="issue"></IssueCard>
         </div>
         <div class="column">
            <p>En cours</p>
            <IssueCard v-for="issue in user.issues.filter(issue => inProgressIssues.find(a => a === issue.status) != null)" :key="issue.id" :issue="issue"></IssueCard>
         </div>
         <div class="column">
            <p>Terminé</p>
            <IssueCard v-for="issue in user.issues.filter(issue => resolvedIssues.find(a => a === issue.status) != null)" :key="issue.id" :issue="issue"></IssueCard>
         </div>
      </div>
    </TabPanel>
   </TabView>
  </main>
</template>

<style scoped>
   #panel-content {
      display: flex;
   }

   .column {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 33%;
   }
</style>