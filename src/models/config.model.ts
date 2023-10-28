export interface Config {
    jira: ConfigJira;
}

export interface ConfigJira {
    filter_id: number;
    max_results: number;
    user: string;
    api_token: string;
    status_group: StatusGroup[];
}

export interface StatusGroup {
    name: string;
    statuses: Status[];
}

export interface Status {
    name: string;
    color: string;
}