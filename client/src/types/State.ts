export interface State{
    preTask: boolean;
    task: boolean;
    postTask: boolean;
    revokedConsent: boolean;
    completed: boolean;
}

export interface Cond2State{
    initalSummary: boolean;
    llmSummary: boolean;
    finalSummary: boolean;
}

export type GlobalStateProps = {
    globalState: State;
    setGlobalState: React.Dispatch<React.SetStateAction<State>>;
}