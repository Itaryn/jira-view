export interface Issue {
    fields: Fields;
    key: string;
}

export interface Fields {
    assignee: Assignee;
    issuetype: IssueType;
    status: Status;
    summary: string;
}

export interface IssueType {
    name: string;
}

export interface Status {
    name: string;
}

export interface Assignee {
    displayName: string;
}