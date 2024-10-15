import { useEffect, useState } from "react";
import { baseUrl, calculateWordCount, isValidArticle } from "../../utils/Helper";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "antd";
import { QueryState } from "../../types/QueryState";
import Markdown from "react-markdown";

type InitCond2Props = {
    queryState: QueryState;
    setQueryState: React.Dispatch<React.SetStateAction<QueryState>>;
};


export const InitCond2 = ({ queryState, setQueryState }: InitCond2Props) => {
    const [summary, setSummary] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const queryClient = useQueryClient();
    const [searchParams, _setSearchParams] = useSearchParams();

    const prolificID = searchParams.get("prolificID");

    const { isPending, error, data } = useQuery({
        queryKey: ['initSummary', prolificID],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/api/users/${prolificID}`)
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return await res.json();
        }
    })

    const updateUserForValidArticleMutation = useMutation({
        mutationFn: async ({ prolificID }: { prolificID: string }) => {
            return axios.patch(`${baseUrl}/api/users/article/${prolificID}`)
        },
    })

    const getValidArticle = async (e: React.FormEvent) => {
        e.preventDefault();

        updateUserForValidArticleMutation.mutate({ prolificID: prolificID! }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['cond1task'] });
            },
        });
    };

    const addInitialSummary = useMutation({
        mutationFn: ({ prolificID, initialSummary, llmSummary }: { prolificID: string, initialSummary: string, llmSummary: string }) => {
            return axios.patch(`${baseUrl}/api/users/${prolificID}`, { initialSummary: initialSummary, llmSummary: llmSummary })
        },
    })

    const createLLMSummary = useMutation({
        mutationFn: () => {
            return axios.post(`${baseUrl}/api/users/query`, {
                model: "llama3.1",
                messages: [
                    {
                        role: "system",
                        content: "Format your response as: SUMMARY: <your summary here>"
                    },
                    {
                        role: "user",
                        content: `Summarize the following text in 100-150 words: ${data.article}. This was my summary: ${data.initialSummary}. Ensure the summary captures the main points and key details.`
                    },
                    {
                        role: "user",
                        content: "Format your 100-150 word response as: SUMMARY: <your summary here>. Return only the summary in the response."
                    }
                ],
                stream: false,
            })
        }
    })

    useEffect(() => {
        setWordCount(calculateWordCount(summary));
    }, [summary]);

    const submitInitialSummary = async (e: React.FormEvent) => {
        e.preventDefault();
        // Set loading to true at the start.
        setQueryState({ loading: true, error: false });

        try {
            // Initial mutation without LLM summary
            await addInitialSummary.mutateAsync({ prolificID: prolificID!, initialSummary: summary, llmSummary: "" });
            queryClient.invalidateQueries({ queryKey: ['cond2task'] });

            // Fetch LLM summary
            const llmSummary = await createLLMSummary.mutateAsync();
            // Remove the "SUMMARY: " prefix from the LLM summary if it exists
            const summaryContent = llmSummary.data.message.content.replace("SUMMARY:", "");

            // Update with LLM summary
            await addInitialSummary.mutateAsync({ prolificID: prolificID!, initialSummary: summary, llmSummary: summaryContent });

            // Invalidate the query used by FinalCond2 to fetch the updated data
            queryClient.invalidateQueries({ queryKey: ['initialSummary', prolificID] });

            // Ensure loading is set to false no matter the outcome.
            setQueryState({ loading: false, error: false });
        } catch (error) {
            setQueryState({ loading: false, error: true });
        }
    };

    if (isPending || !data) {
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

    if (!isValidArticle(data.article)) {
        return (
            <div className="flex flex-col h-full w-full items-center justify-center gap-y-2">
                <p>We are still getting an available article for you. Please wait!</p>
                <p>If this is still an issue for more than a minute, please contact us through the Prolific platform!</p>

                <Button
                    type="primary"
                    onClick={getValidArticle}
                >
                    Refresh
                </Button>

            </div>
        );
    }


    return (
        <div className="flex flex-col h-full w-full justify-start items-center gap-y-4 overflow-x-hidden text-sm">
            <div id="summary-article-container" className="flex justify-center w-5/6 h-2/3 gap-x-4">
                <div id='article-container' className="flex flex-col justify-start items-center bg-[#38a3a5] rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                    <h1 className="font-semibold text-xl">Article</h1>
                    <p className="overflow-y-auto">
                        <Markdown>
                            {data.article.replaceAll('\n', '&nbsp; \n\n')}
                        </Markdown>
                    </p>
                </div>
            </div>
            <div className="h-1/3 w-full flex flex-col items-center justify-center">
                <form className="flex flex-col items-center w-2/3 gap-y-2">
                    <textarea
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={5}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Write your summary here within 100-150 words..."
                    />
                    <div className="text-gray-600  flex self-end">Word Count: {wordCount}</div>
                    <Button
                        type="primary"
                        loading={queryState.loading}
                        // className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                        onClick={submitInitialSummary}
                        disabled={wordCount > 150 || wordCount < 100}
                    >
                        Submit Summary
                    </Button>
                </form>
            </div>

        </div>
    );
}