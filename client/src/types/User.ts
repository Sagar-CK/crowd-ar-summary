export type User = {
    prolificID: string;
    articleID?: string;
    article?: string;
    preTask?: boolean;
    task?: boolean;
    postTask?: boolean;
    completed?: boolean;
    timedOut?: boolean;
    revokedConsent?: boolean;
    initialSummary?: boolean;
    finalSummary?: string;
    llmSummary?: string;
    queryHistory?: Query[];
}

export type Query =  {
    query: string; 
    response: string;
}


export type CreateUser = {
    prolificID: string;
    condition: number;
    preTask: boolean;
}