export interface User {
    displayName: string;
    issues: IssueSummary[];
}

export interface IssueSummary {
    displayName?: string;
    id: string;
    issueType: string;
    status: string;
    title: string;
}