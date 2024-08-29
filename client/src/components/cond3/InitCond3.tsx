import { useEffect, useState } from "react";
import { LLMUrl, baseUrl, calculateWordCount } from "../../utils/Helper";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Query } from "../../types/User";
import { Button } from "antd";

export const InitCond3 = () => {
    const [summary, setSummary] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [searchParams, _setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const prolificID = searchParams.get("prolificID");

    
    const { isPending, error, data } = useQuery({
        queryKey: ['initSummary', prolificID],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/api/users/${prolificID}`)
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            console.log("I have been called");
            return await res.json();
        }
    })



    const addInitialSummary = useMutation({
        mutationFn: ({ prolificID, initialSummary, llmSummary,  queryHistory}: { prolificID: string, initialSummary: string, llmSummary: string,  queryHistory: Query[] }) => {
            return axios.patch(`${baseUrl}/api/users/${prolificID}`, { initialSummary: initialSummary, llmSummary: llmSummary, queryHistory: queryHistory })
        },
    })

    const createLLMSummary = useMutation({
        mutationFn: () => {
            return axios.post(`${LLMUrl}`, { 
                model: "llama3.1",
                messages: [
                    {
                        role: "user",
                        content: `Summarize the following text in 100-150 words: ${data.article}  Ensure the summary captures the main points and key details. Return only the summary in the response.`
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

        setLoading(true);

        const llmSummary = await createLLMSummary.mutateAsync().then((res) => {
            return res.data.message.content
        })

        setLoading(false);

        addInitialSummary.mutate({ prolificID: prolificID!, initialSummary: summary, llmSummary: llmSummary, queryHistory: [{query: `Summarize the article in 100-150 words. Ensure the summary captures the main points and key details. Return only the summary in the response.`, response: llmSummary}]}, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['cond3task'] })
            }

        })
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


    return (
        <div className="flex flex-col h-full w-full justify-start items-center gap-y-4 overflow-x-hidden text-sm">
            <div id="summary-article-container" className="flex justify-center w-5/6 h-2/3 gap-x-4">
                <div id='article-container' className="flex flex-col justify-center items-center bg-gray-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                    <h1 className="font-semibold text-xl">Article</h1>
                    <p className="overflow-y-scroll">
                        {data.article}
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
                        loading={loading}
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