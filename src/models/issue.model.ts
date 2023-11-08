export interface Issue {
    fields: Fields;
    key: string;
    self: string;
    changelog?: Changelog;
}

export interface Fields {
    assignee: Assignee;
    issuetype: IssueType;
    status: Status;
    summary: string;
    parent: Parent;
    subtasks?: Issue[];
}

export interface Changelog {
    histories: History[]
}

export interface History {
    items: HistoryItem[]
    created: string;
}

export interface HistoryItem {
    field: string;
}

export interface IssueType {
    name: string;
    iconUrl: string;
    hierarchyLevel: number;
}

export interface Status {
    name: string;
}

export interface Assignee {
    displayName: string;
    avatarUrls: JiraImages;
}

export interface JiraImages {
    "32x32": string;
}

export interface Parent {
    self: string;
    key: string;
    fields: Fields;
}