import { useState, useEffect } from "react";
import { GlobalStateProps } from "../types/State";
import { sampleArticle, sampleHumanSummary } from "../data/Mocked";

export const InteractiveLLM = ({ globalState, setGlobalState }: GlobalStateProps) => {
    const [summary, setSummary] = useState("");
    const [query, setQuery] = useState("");
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        setWordCount(summary.split(/\s+/).filter(word => word.length > 0).length);
    }, [summary]);

    const handleProceed = () => {
        setGlobalState({
            ...globalState,
            task: false,
            postTask: true
        })
    };


    return (
        <div className="flex h-full w-full justify-center items-start overflow-x-hidden text-sm">
            <div id='article-container' className="flex flex-col justify-center items-center w-1/3 h-full text-wrap p-4">
                <div className="flex flex-col items-center p-4 bg-gray-200 drop-shadow-md rounded-xl overflow-auto ">
                    <h1 className="font-semibold text-xl">Article</h1>
                    <p>
                        {sampleArticle}
                    </p>
                </div>
            </div>
            <div id="summary-submission-container" className="flex flex-col justify-center w-2/3 h-full">
                <div className="flex flex-col items-center justify-evenly gap-y-4 p-4 h-full rounded-xl overflow-auto ">
                    <div id="ai-container" className="flex items-center bg-gray-400 drop-shadow-md  rounded-xl justify-center w-full h-2/3">
                        <div id='ai-container' className="flex flex-col justify-start items-center w-full h-full text-wrap p-4 gap-y-2">
                            <h1 className="font-semibold text-xl">CondenseCrew AI 🤖</h1>
                            <div className="flex flex-col h-5/6 w-full overflow-auto gap-y-4 rounded-sm">
                                <div id="human-conversation" className="bg-gray-300 drop-shadow-xl text-prose self-end rounded-xl p-2 h-auto w-auto">
                                    🫵: Can you summarize the article in your own words?
                                </div>
                                <div id="ai-conversation" className="bg-green-400 drop-shadow-xl text-prose self-start rounded-xl p-2 h-auto w-auto">
                                    🤖: {sampleHumanSummary}
                                </div>
                                <div id="human-conversation" className="bg-gray-300 drop-shadow-xl text-prose self-end rounded-xl p-2 h-auto w-auto">
                                    🫵: Thanks!
                                </div>
                                <div id="ai-conversation" className="bg-green-400 drop-shadow-xl text-prose self-start rounded-xl p-2 h-auto w-auto">
                                    🤖: {sampleHumanSummary}
                                </div>
                            </div>

                            <form className="flex flex-col items-center justify-center w-full gap-y-2">
                                <textarea
                                    className="w-full h-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={1}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Message CondenseCrew..."
                                />
                            </form>

                        </div>
                    </div>
                    <div id="final-container" className="flex flex-col items-center justify-center  w-full h-1/3">

                        <div className="flex justify-center items-center w-5/6 h-full">
                            <div id="submission-container" className="flex w-full h-full gap-x-4">

                                <div className="w-full h-full flex flex-col items-center justify-center">

                                    <form className="flex flex-col items-center justify-center  h-full w-full gap-y-2">
                                        <textarea
                                            className="w-full h-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={5}
                                            value={summary}
                                            onChange={(e) => setSummary(e.target.value)}
                                            placeholder="Write your revised summary here within 100-150 words..."
                                        />
                                        <div className="text-gray-600  flex self-end">Word Count: {wordCount}</div>
                                    </form>

                                </div>

                            </div>
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                            onClick={handleProceed}
                            disabled={wordCount > 150 || wordCount < 100}
                        >
                            Submit Summary
                        </button>
                    </div>
                </div>
            </div>

        </div>

    );
}