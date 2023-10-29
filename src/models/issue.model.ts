export interface Issue {
    fields: Fields;
    key: string;
    self: string;
}

export interface Fields {
    assignee: Assignee;
    issuetype: IssueType;
    status: Status;
    summary: string;
}

export interface IssueType {
    name: string;
    iconUrl: string;
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