import { useState, useEffect } from "react";
import { baseUrl, calculateWordCount, isValidArticle } from "../../utils/Helper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Button } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import Markdown from "react-markdown";

export const LLMHuman = () => {
    const [summary, setSummary] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [searchParams, _setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const prolificID = searchParams.get("prolificID");
    const addFinalSummary = useMutation({
        mutationFn: ({ prolificID, finalSummary }: { prolificID: string, finalSummary: string }) => {
            return axios.patch(`${baseUrl}/api/users/${prolificID}`, { finalSummary: finalSummary, task: true })
        },
    })

    const { isPending, error, data } = useQuery({
        queryKey: ['cond1task'],
        queryFn: async () => {
            try {
                const res = await fetch(`${baseUrl}/api/users/${prolificID}`);
                return await res.json();
            }
            catch (e) {
                throw Error("not defined.")
            }

        }
    })

    useEffect(() => {
        setWordCount(calculateWordCount(summary))
    }, [summary]);


    const updateUserForValidArticleMutation = useMutation({
        mutationFn: async ({ prolificID }: { prolificID: string }) => {
            return axios.patch(`${baseUrl}/api/users/article/${prolificID}`)
        },
    })


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

    const getValidArticle = async (e: React.FormEvent) => {
        e.preventDefault();

        updateUserForValidArticleMutation.mutate({ prolificID: prolificID! }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['cond1task'] });
            },
        });
    };



    
    const handleProceed = async (e: React.FormEvent) => {
        e.preventDefault();

        addFinalSummary.mutate({ prolificID: prolificID!, finalSummary: summary }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['cond1', prolificID] });
            }
        })
    };

    
    if (!isValidArticle(data.article)) {
        return (
            <div className="flex flex-col h-full w-full items-center justify-center gap-y-2">
                <p>We are still get an available article for you. Please wait!</p>
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
            <div id="summary-article-container" className="flex w-5/6 h-2/3 gap-x-4">
                <div id='article-container' className="flex flex-col justify-start items-center bg-[#38a3a5] rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                    <h1 className="font-semibold text-2xl">Article</h1>
                    <p className="overflow-y-auto">
                        <Markdown>
                            {data.article.replaceAll('\n', '&nbsp; \n\n')}
                        </Markdown>
                    </p>
                </div>
                <div id='summary-container' className="flex flex-col justify-start items-center bg-[#57cc99] rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                    <h1 className="font-semibold text-2xl">CondenseCrew Summary {<RobotOutlined />}</h1>
                    <p className="overflow-y-auto">
                        {data.llmSummary}
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
                        onClick={handleProceed}
                        disabled={wordCount > 150 || wordCount < 100}
                    >
                        Submit Summary
                    </Button>
                </form>
            </div>

        </div>
    );
}