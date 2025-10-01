import type { IssueDetailed } from '@/models/issue.model'
import type { IssueSummary } from '@/models/user.model'

export function toIssueSummary(issue: IssueDetailed): IssueSummary {
  return {
    displayName: issue.fields.assignee?.displayName,
    icon: issue.fields.assignee?.avatarUrls['32x32'],
    id: issue.key,
    link: `${issue.self.substring(0, issue.self.indexOf('.net/') + 5)}browse/${issue.key}`,
    issueType: {
      name: issue.fields.issuetype.name,
      icon: issue.fields.issuetype.iconUrl,
      hierarchyLevel: issue.fields.issuetype.hierarchyLevel
    },
    status: {
      name: issue.fields.status.name,
      lastUpdate: new Date(
        issue.changelog?.histories.find((change) =>
          change.items.some((item) => item.field === 'status')
        )?.created ?? new Date()
      )
    },
    title: issue.fields.summary,
    parent: {
      self: issue.fields.parent?.self.substring(issue.fields.parent?.self.indexOf('.net/') + 5),
      id: issue.fields.parent?.key
    },
    children: issue.fields.subtasks?.map((subtask) => toIssueSummary(subtask))
  } as IssueSummary
}
