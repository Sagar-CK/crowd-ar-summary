import { useEffect, useState } from "react";
import { sampleArticle } from "../../data/Mocked";
import { baseUrl, calculateWordCount, LLMUrl } from "../../utils/Helper";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "antd";

type InitCond2Props = {
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const InitCond2 = ({ loading, setLoading }: InitCond2Props) => {
    const [summary, setSummary] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const queryClient = useQueryClient();
    const [searchParams, _setSearchParams] = useSearchParams();

    const prolificID = searchParams.get("prolificID");


    const addInitialSummary = useMutation({
        mutationFn: ({ prolificID, initialSummary, llmSummary }: { prolificID: string, initialSummary: string, llmSummary: string }) => {
            return axios.patch(`${baseUrl}/api/users/${prolificID}`, { initialSummary: initialSummary, llmSummary: llmSummary })
        },
    })

    const createLLMSummary = useMutation({
        mutationFn: () => {
            return axios.post(`${LLMUrl}`, {
                model: "llama3.1",
                messages: [
                    {
                        role: "user",
                        content: `Summarize the following text in 100-150 words: ${sampleArticle}  Ensure the summary captures the main points and key details. Return only the summary in the response.`
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
        setLoading(true);

        try {
            // Initial mutation without LLM summary
            await addInitialSummary.mutateAsync({ prolificID: prolificID!, initialSummary: summary, llmSummary: "" });
            queryClient.invalidateQueries({ queryKey: ['cond2task'] });

            // Fetch LLM summary
            const llmSummary = await createLLMSummary.mutateAsync();
            const summaryContent = llmSummary.data.message.content;

            // Update with LLM summary
            await addInitialSummary.mutateAsync({ prolificID: prolificID!, initialSummary: summary, llmSummary: summaryContent });

            // Invalidate the query used by FinalCond2 to fetch the updated data
            queryClient.invalidateQueries({ queryKey: ['initialSummary', prolificID] });
        } catch (error) {
            console.error("An error occurred:", error);
            // Handle error gracefully.
        } finally {
            // Ensure loading is set to false no matter the outcome.
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full justify-start items-center gap-y-4 overflow-x-hidden text-sm">
            <div id="summary-article-container" className="flex justify-center w-5/6 h-2/3 gap-x-4">
                <div id='article-container' className="flex flex-col justify-center items-center bg-gray-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                    <h1 className="font-semibold text-xl">Article</h1>
                    <p className="overflow-y-scroll">
                        {sampleArticle}
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