export interface User {
    displayName: string;
    icon: string;
    issues: IssueSummary[];
}

export interface IssueSummary {
    displayName?: string;
    icon: string;
    id: string;
    issueType: IssueTypeSummary;
    status: string;
    title: string;
}

export interface IssueTypeSummary {
    name: string,
    icon: string
}