import { useState, useEffect } from "react";
import { GlobalStateProps } from "../types/State";

export const LLMHuman = ({globalState, setGlobalState}: GlobalStateProps) => {
    const [summary, setSummary] = useState("");
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
        <div className="flex flex-col h-full w-full justify-start items-center gap-y-4 overflow-x-hidden text-sm">
            <div id="summary-article-container" className="flex w-5/6 h-2/3 gap-x-4">
                <div id='article-container' className="flex flex-col justify-center items-center bg-gray-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                    <h1 className="font-semibold text-2xl">Article</h1>
                    <p className="overflow-y-scroll">
                        LONDON, England (Reuters) -- Harry Potter star Daniel Radcliffe
                        gains access to a reported £20 million ($41.1 million) fortune as he
                        turns 18 on Monday, but he insists the money won't cast a spell on
                        him. Daniel Radcliffe as Harry Potter in "Harry Potter and the Order
                        of the Phoenix" To the disappointment of gossip columnists around
                        the world, the young actor says he has no plans to fritter his cash
                        away on fast cars, drink and celebrity parties. "I don't plan to be
                        one of those people who, as soon as they turn 18, suddenly buy
                        themselves a massive sports car collection or something similar," he
                        told an Australian interviewer earlier this month. "I don't think
                        I'll be particularly extravagant. "The things I like buying are
                        things that cost about 10 pounds -- books and CDs and DVDs." At 18,
                        Radcliffe will be able to gamble in a casino, buy a drink in a pub
                        or see the horror film "Hostel: Part II," currently six places below
                        his number one movie on the UK box office chart. Details of how
                        he'll mark his landmark birthday are under wraps. His agent and
                        publicist had no comment on his plans. "I'll definitely have some
                        sort of party," he said in an interview. "Hopefully none of you will
                        be reading about it." Radcliffe's earnings from the first five
                        Potter films have been held in a trust fund which he has not been
                        able to touch. Despite his growing fame and riches, the actor says
                        he is keeping his feet firmly on the ground. "People are always
                        looking to say 'kid star goes off the rails,'" he told reporters
                        last month. "But I try very hard not to go that way because it would
                        be too easy for them." His latest outing as the boy wizard in "Harry
                        Potter and the Order of the Phoenix" is breaking records on both
                        sides of the Atlantic and he will reprise the role in the last two
                        films. Watch I-Reporter give her review of Potter's latest » . There
                        is life beyond Potter, however. The Londoner has filmed a TV movie
                        called "My Boy Jack," about author Rudyard Kipling and his son, due
                        for release later this year. He will also appear in "December Boys,"
                        an Australian film about four boys who escape an orphanage. Earlier
                        this year, he made his stage debut playing a tortured teenager in
                        Peter Shaffer's "Equus." Meanwhile, he is braced for even closer
                        media scrutiny now that he's legally an adult: "I just think I'm
                        going to be more sort of fair game," he told Reuters. E-mail to a
                        friend . Copyright 2007 Reuters. All rights reserved.This material
                        may not be published, broadcast, rewritten, or redistributed.
                    </p>
                </div>
                <div id='summary-container' className="flex flex-col justify-start items-center bg-green-200 rounded-xl w-1/2 h-full text-wrap p-4 gap-y-2">
                    <h1 className="font-semibold text-2xl">LLM Summary</h1>
                    <p>
                        As Daniel Radcliffe turns 18, he gains access to a £20 million ($41.1 million) fortune but vows to avoid extravagant spending. Known for his role as Harry Potter, Radcliffe plans to keep his lifestyle modest, preferring to buy books, CDs, and DVDs. Despite newfound freedoms like gambling and drinking, he aims to stay grounded and avoid the pitfalls of fame. His earnings from the Harry Potter films have been held in a trust until now. Radcliffe's latest film, "Harry Potter and the Order of the Phoenix," is breaking records, and he will reprise his role in the final two films. Beyond Potter, he stars in "My Boy Jack," "December Boys," and made his stage debut in "Equus." Aware of increased media scrutiny, he remains focused on his career and personal values.
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
                        placeholder="Write your summary here..."
                    />
                    <div className="text-gray-600  flex self-end">Word Count: {wordCount}</div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-500 hover:cursor-pointer disabled:hover:cursor-default"
                        onClick={handleProceed}
                        disabled={wordCount > 150 || wordCount < 100}
                    >
                        Submit Summary
                    </button>
                </form>
            </div>

        </div>
    );
}