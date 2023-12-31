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
    status: Status;
    title: string;
    parent?: ParentSummary;
    children?: IssueSummary[];
}

export interface IssueTypeSummary {
    name: string;
    icon: string;
    hierarchyLevel: number;
}

export interface ParentSummary {
    self: string;
    id: string;
}

export interface Status {
    name: string;
    lastUpdate: Date;
}