import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { baseUrl, calculateWordCount } from "../../utils/Helper";
import { useSearchParams } from "react-router-dom";
import { Query } from "../../types/User";
import { Avatar, Button } from "antd";
import { AuditOutlined, LoadingOutlined, RobotOutlined, RollbackOutlined, UserOutlined } from "@ant-design/icons";
import Markdown from "react-markdown";
import { QueryState } from "../../types/QueryState";

type FinalCond3Props = {
    queryState: QueryState;
    setQueryState: React.Dispatch<React.SetStateAction<QueryState>>;
};

export const FinalCond3 = ({ queryState, setQueryState }: FinalCond3Props) => {
    const [summary, setSummary] = useState("");
    const [query, setQuery] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [userQueryState, setUserQueryState] = useState({ loading: false, error: false });

    const [searchParams, _setSearchParams] = useSearchParams();

    const prolificID = searchParams.get("prolificID");


    const queryClient = useQueryClient();
    const updateFinalSummary = useMutation({
        mutationFn: ({ prolificID, finalSummary }: { prolificID: string, finalSummary: string }) => {
            return axios.patch(`${baseUrl}/api/users/${prolificID}`, { finalSummary: finalSummary, task: true })
        },
    })


    const { isPending, error, data } = useQuery({
        queryKey: ['finalSummary', prolificID],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/api/users/${prolificID}`)

            return await res.json();
        }
    })


    const addInitialSummary = useMutation({
        mutationFn: ({ prolificID, llmSummary, queryHistory }: { prolificID: string, llmSummary: string, queryHistory: Query[] }) => {
            return axios.patch(`${baseUrl}/api/users/${prolificID}`, { llmSummary: llmSummary, queryHistory: queryHistory })
        },
    })

    const createLLMSummary = useMutation({
        mutationFn: () => {
            return axios.post(`${baseUrl}/api/users/query`, {
                model: "llama3.1",
                messages: [
                    {
                        role: "user",
                        content: `Summarize the following text in 100-150 words: ${data.article}.This was my summary: ${data.initialSummary}. Ensure the summary captures the main points and key details.  Format your response as: SUMMARY: <your summary here>`
                    }
                ],
                stream: false,
            })
        }
    })

    const submitInitialSummary = async () => {
        setQueryState({ loading: true, error: false });
        try {
            // Fetch LLM summary
            const llmSummary = await createLLMSummary.mutateAsync();
            // Remove the "SUMMARY: " prefix from the LLM summary if it exists
            const summaryContent = llmSummary.data.message.content.replace("SUMMARY:", "");

            // Update with LLM summary
            await addInitialSummary.mutateAsync({ prolificID: prolificID!, llmSummary: summaryContent, queryHistory: [{ query: `Summarize the article in 100-150 words. Ensure the summary captures the main points and key details. Return only the summary in the response.`, response: summaryContent }] });

            // Invalidate the query used by FinalCond2 to fetch the updated data
            queryClient.invalidateQueries({ queryKey: ['finalSummary', prolificID] });

            setQueryState({ loading: false, error: false });
        } catch (error) {
            setQueryState({ loading: false, error: true });
        }
    };

    const submitQueryToLLM = useMutation({
        mutationFn: ({ query }: { query: string }) => {
            // Define the system message separately for clarity
            const systemMessage = {
                role: "system",
                content: `You are an expert assistant helping the user understand and interact with the provided content. The user has access to an article, which you can reference to answer questions, provide explanations, or elaborate on topics. This is the article: ${data.article}.`
            };

            // Map the query history into the message format expected by the LLM
            const historyMessages = data.queryHistory.flatMap((interaction: Query) => ([
                { role: "assistant", content: interaction.response },
                { role: "user", content: interaction.query }
            ]));

            // Append the latest user query
            const userMessage = { role: "user", content: query };

            const latestSystemMessage = {
                role: "system",
                content: "This was the conversation history so far. You are tasked to respond to the user's query based on the conversation history and the article provided. Please provide a detailed and accurate response to the user's query. If relevant, refer directly to sections of the article. If the information is not available in the article, use your general knowledge to help the user effectively."
            };

            // Combine all messages into a single array
            const messages = [systemMessage, ...historyMessages, latestSystemMessage, userMessage];

            return axios.post(`${baseUrl}/api/users/query`, {
                model: "llama3.1",
                messages,
                stream: false,
            });
        }
    });


    useEffect(() => {
        setWordCount(calculateWordCount(summary));
    }, [summary]);

    // Use useRef to keep a reference to the container you want to scroll
    const conversationEndRef = useRef<HTMLDivElement | null>(null);

    // Scroll to bottom when data changes (new interactions)
    useEffect(() => {
        if (!userQueryState.loading && conversationEndRef.current) {
            conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [data, userQueryState]); // Dependencies include data and loading state

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserQueryState({ loading: true, error: false });
        try {

            const res = await submitQueryToLLM.mutateAsync({ query: query });

            // Assuming sampleLLMSummary is the LLM's response
            const newInteraction = {
                query: query,
                response: res.data.message.content, // Replace with actual LLM response
            };

            // Update the queryHistory with the new interaction
            const updatedQueryHistory = [...data.queryHistory, newInteraction];

            // Send the updated queryHistory to the backend
            await axios.patch(`${baseUrl}/api/users/${prolificID}`, {
                queryHistory: updatedQueryHistory
            });

            // Invalidate the query to refetch the updated data
            queryClient.invalidateQueries({ queryKey: ['finalSummary', prolificID] });

            // Clear the query input field
            setQuery("");
            setUserQueryState({ loading: false, error: false });
        } catch (error) {
            console.log(error);
            setUserQueryState({ loading: false, error: true });
        }
    };

    const handleProceed = async (e: React.FormEvent) => {
        e.preventDefault();
        updateFinalSummary.mutate({ prolificID: prolificID!, finalSummary: summary }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [`cond3`, prolificID] })
            },
        });
    };

    if (isPending) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                Fetching your response!
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                Something went wrong. Contact the researcher on Prolific!
            </div>
        );
    }


    return (
        <div className="flex h-full w-full justify-center items-start overflow-x-hidden text-sm">
            <div className="flex h-full w-full">
                <div id="data-container" className="h-full w-1/3 flex-row items-center justify-center gap-x-4">
                    <div id='human-summary-container' className="flex flex-col justify-start items-center  w-full h-1/3 text-wrap p-4">
                        <div className="flex flex-col items-center p-4 bg-amber-200 drop-shadow-md rounded-xl overflow-auto">
                            <h1 className="font-semibold text-xl">Original Summary</h1>
                            <p className="overflow-y-auto">
                                {data.initialSummary}
                            </p>
                        </div>
                    </div>
                    <div id='article-container' className="flex flex-col justify-start items-center w-full h-2/3 text-wrap p-4">
                        <div className="flex flex-col items-center p-4 bg-gray-200 drop-shadow-md rounded-xl overflow-auto">
                            <h1 className="font-semibold text-xl">Article</h1>
                            <p className="overflow-y-auto">{data.article}</p>
                        </div>
                    </div>
                </div>
                <div id="summary-submission-container" className="flex flex-col justify-center w-2/3 h-full">
                    <div className="flex flex-col items-center justify-start gap-y-4 p-4 h-full rounded-xl overflow-auto">
                        <div id="ai-container" className="flex items-center bg-gray-400 drop-shadow-md rounded-xl justify-center w-full h-2/3">
                            <div id='ai-conversation' className="flex flex-col justify-start items-center w-full h-full text-wrap p-4 gap-y-2">
                                <div className="flex flex-row justify-center w-full gap-x-2 items-center text-center">
                                    <h1 className="font-semibold text-xl">CondenseCrew {<RobotOutlined />}</h1>

                                </div>

                                <div className="flex flex-col h-5/6 w-full overflow-auto gap-y-4 rounded-sm  pb-2">

                                    {queryState.loading ?
                                        <div className="flex flex-col justify-center w-full gap-y-1 items-start h-auto">
                                            <Avatar icon={<RobotOutlined />} />
                                            <div className="bg-green-400 bg-opacity-40 drop-shadow-xl text-prose self-start rounded-xl p-2 h-auto w-auto">

                                                Getting my first summary... <LoadingOutlined className="h-auto w-auto self-center" />
                                            </div>
                                        </div>
                                        : data.queryHistory.length <= 0 || !queryState.loading && queryState.error ? (<>
                                            <div className="flex flex-col justify-center w-full gap-y-1 items-end h-auto">
                                                <Avatar icon={<AuditOutlined />} />
                                                <div className="bg-red-300 bg-opacity-90 drop-shadow-xl text-prose self-end rounded-xl p-2 h-auto w-auto gap-x-2 flex items-center">
                                                    Error occured while retrieving the first summary by CondenseCrew! Please try again.
                                                    If the error persists, contact the researcher on Prolific.

                                                    <Button
                                                        type="primary"
                                                        onClick={submitInitialSummary}
                                                        disabled={queryState.loading}
                                                    >
                                                        Retry <RollbackOutlined />
                                                    </Button>

                                                </div>
                                            </div>

                                        </>) : (data.queryHistory.map((interaction: Query) => (
                                            <>
                                                <div className="flex flex-col justify-center w-full gap-y-1 items-end h-auto">
                                                    {data.queryHistory.indexOf(interaction) === 0 ? <Avatar icon={<AuditOutlined />} /> : <Avatar icon={<UserOutlined />} />}
                                                    <div className="bg-gray-200 bg-opacity-90 drop-shadow-xl text-prose self-end rounded-xl p-2 h-auto w-auto gap-x-2 flex items-center">
                                                        {/* If it's the first query mentiong that  */}
                                                        {interaction.query}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center w-full gap-y-1 items-start h-auto">
                                                    <Avatar icon={<RobotOutlined />} />
                                                    <div className="bg-green-400 bg-opacity-40 drop-shadow-xl text-prose self-start rounded-xl p-2 h-auto w-auto">
                                                        {/* Markdown of response */}
                                                        <div className="flex flex-col items-start gap-x-2">
                                                            {interaction.response
                                                                .split("\n")
                                                                .map((line, index) => (
                                                                    <Markdown key={index}>{line}</Markdown>
                                                                ))}
                                                        </div>
                                                    </div >
                                                </div>

                                            </>
                                        )))}
                                    {
                                        userQueryState.loading && (
                                            <>
                                                <div className="flex flex-col justify-center w-full gap-y-1 items-end h-auto">
                                                    <Avatar icon={<UserOutlined />} />
                                                    <div className="bg-gray-200 bg-opacity-90 drop-shadow-xl text-prose self-end rounded-xl p-2 h-auto w-auto gap-x-2 flex items-center">
                                                        {query}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center w-full gap-y-1 items-start h-auto">
                                                    <Avatar icon={<RobotOutlined />} />
                                                    <div className="bg-green-400 bg-opacity-40 drop-shadow-xl text-prose self-start rounded-xl p-2 h-auto w-auto flex items-center gap-x-2">
                                                        <LoadingOutlined />
                                                    </div>
                                                </div>
                                            </>
                                        )

                                    }
                                    {
                                        userQueryState.error && (
                                            <>
                                                <div className="flex flex-col justify-center w-full gap-y-1 items-end h-auto">
                                                    <Avatar icon={<UserOutlined />} />
                                                    <div className="bg-gray-200 bg-opacity-90 drop-shadow-xl text-prose self-end rounded-xl p-2 h-auto w-auto gap-x-2 flex items-center">
                                                        {query}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center w-full gap-y-1 items-start h-auto">
                                                    <Avatar icon={<RobotOutlined />} />
                                                    <div className="bg-red-300 bg-opacity-90 drop-shadow-xl text-prose self-start rounded-xl p-2 h-auto w-auto gap-x-2 flex items-center">
                                                        Error occured while processing your query! Please try again.
                                                        If the error persists, contact the researcher on Prolific.
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    }
                                    <div ref={conversationEndRef} />
                                </div>
                                <form className="flex flex-col items-center justify-center w-full gap-y-2">
                                    <textarea
                                        className="w-full h-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={1}
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Message CondenseCrew..."
                                        disabled={userQueryState.loading}
                                    />
                                    <Button
                                        type="primary"
                                        loading={userQueryState.loading}
                                        // className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                                        onClick={handleQuerySubmit}
                                        disabled={query.trim().length === 0 || userQueryState.loading}
                                    >
                                        Send Query
                                    </Button>
                                </form>
                            </div>
                        </div>
                        <div id="final-container" className="flex flex-col items-center justify-center w-full h-1/3">
                            <div className="flex justify-center items-center w-full h-full">
                                <div id="submission-container" className="flex w-full h-full gap-x-4">
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                        <form className="flex flex-col items-center justify-center h-full w-full gap-y-2">
                                            <textarea
                                                className="w-full h-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows={5}
                                                value={summary}
                                                onChange={(e) => setSummary(e.target.value)}
                                                placeholder="Write your revised summary here within 100-150 words..."
                                            />
                                            <div className="text-gray-600 flex self-end">Word Count: {wordCount}</div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="primary"
                                // className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                                onClick={handleProceed}
                                disabled={wordCount > 150 || wordCount < 100}
                            >
                                Submit Summary
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}