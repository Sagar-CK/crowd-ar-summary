import { useState, useEffect, useRef } from "react";
import { sampleArticle } from "../../data/Mocked";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LLMUrl, baseUrl, calculateWordCount } from "../../utils/Helper";
import { useSearchParams } from "react-router-dom";
import { Query } from "../../types/User";
import { Avatar, Button } from "antd";
import { AuditOutlined, LoadingOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";
import Markdown from "react-markdown";

export const FinalCond3 = () => {
    const [summary, setSummary] = useState("");
    const [query, setQuery] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [searchParams, _setSearchParams] = useSearchParams();

    const prolificID = searchParams.get("prolificID");


    const queryClient = useQueryClient();
    const updateFinalSummary = useMutation({
        mutationFn: ({ prolificID, finalSummary }: { prolificID: string, finalSummary: string }) => {
            return axios.patch(`${baseUrl}/api/users/${prolificID}`, { finalSummary: finalSummary, task: true })
        },
    })

    const submitQueryToLLM = useMutation({
        mutationFn: ({ query }: { query: string }) => {
            // Define the system message separately for clarity
            const systemMessage = {
                role: "system",
                content: `You are an expert assistant helping the user understand and interact with the provided content. The user has access to an article, which you can reference to answer questions, provide explanations, or elaborate on topics. This is the article: ${sampleArticle}. Use your knowledge and the article to give accurate and detailed responses. If relevant, refer directly to sections of the article. If the information is not available in the article, use your general knowledge to help the user effectively. Below is the conversation history between the user and the assistant. Always focus your response to the latest user query.`,
            };

            // Map the query history into the message format expected by the LLM
            const historyMessages = data.queryHistory.flatMap((interaction: Query) => ([
                { role: "assistant", content: interaction.response },
                { role: "user", content: interaction.query }
            ]));

            // Append the latest user query
            const userMessage = { role: "user", content: query };

            // Combine all messages into a single array
            const messages = [systemMessage, ...historyMessages, userMessage];

            return axios.post(`${LLMUrl}`, {
                model: "llama3.1",
                messages,
                stream: false,
            });
        }
    });


    const { isPending, error, data } = useQuery({
        queryKey: ['finalSummary'],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/api/users/${prolificID}`)

            return await res.json();
        }
    })

    useEffect(() => {
        setWordCount(calculateWordCount(summary));
    }, [summary]);

    // Use useRef to keep a reference to the container you want to scroll
    const conversationEndRef = useRef<HTMLDivElement | null>(null);

    // Scroll to bottom when data changes (new interactions)
    useEffect(() => {
        if (!loading && conversationEndRef.current) {
            conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [data, loading]); // Dependencies include data and loading state

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

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
        queryClient.invalidateQueries({ queryKey: ['finalSummary'] });

        // Clear the query input field
        setQuery("");
        setLoading(false);
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

    if (error) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                Something went wrong.
            </div>
        );
    }


    return (
        <div className="flex h-full w-full justify-center items-start overflow-x-hidden text-sm">
            <div className="flex h-full w-full">
                <div id='article-container' className="flex flex-col justify-start items-center w-1/3 h-full text-wrap p-4">
                    <div className="flex flex-col items-center p-4 bg-gray-200 drop-shadow-md rounded-xl overflow-auto">
                        <h1 className="font-semibold text-xl">Article</h1>
                        <p>{sampleArticle}</p>
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

                                    {data.queryHistory.map((interaction: Query) => (
                                        <>
                                            <div className="flex flex-col justify-center w-full gap-y-1 items-end h-auto">
                                                {data.queryHistory.indexOf(interaction) === 0 ? <Avatar icon={<AuditOutlined /> } /> : <Avatar icon={<UserOutlined />} />}
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
                                    ))}
                                    {
                                        loading && (
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
                                    <div ref={conversationEndRef} />
                                </div>
                                <form className="flex flex-col items-center justify-center w-full gap-y-2">
                                    <textarea
                                        className="w-full h-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={1}
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Message CondenseCrew..."
                                        disabled={loading}
                                    />
                                    <Button
                                        type="primary"
                                        loading={loading}
                                        // className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                                        onClick={handleQuerySubmit}
                                        disabled={query.trim().length === 0 || loading}
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