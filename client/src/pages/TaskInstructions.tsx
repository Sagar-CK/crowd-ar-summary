import { AuditOutlined, LoadingOutlined, RobotOutlined } from "@ant-design/icons";
import { Avatar } from "antd";

const TaskInstructions = ({ condition }: { condition: number }) => {
    return (
        <div className="flex flex-col h-full w-full justify-center items-start text-sm">
            <div className="flex flex-col w-full h-full items-center justify-center gap-y-4">
                <h1 className="font-semibold text-2xl">Task Instructions 🔎</h1>
                {condition === 1 && (
                    <div className="flex flex-col justify-start w-full items-start gap-y-4">
                        <p> You will encounter a news article that you are tasked to summarize. This summary must be within <strong>100 - 150 words.</strong> </p>
                        <p> It is your task to summarize the
                            article and capture the main points and essential information of the text while maintaining clarity and
                            coherence.  </p>
                        <p>
                            Alongside the article, you will have access to an AI generated summary by CondenseCrew (an AI system) <RobotOutlined /> which you can use to develop your summary, if you wish.
                        </p>
                    </div>
                )}
                {condition === 2 && (
                    <div className="flex flex-col justify-start w-full items-start gap-y-4">
                        <p> You will encounter a news article that you are tasked to summarize. This summary must be within <strong>100 - 150 words.</strong> </p>
                        <p> It is your task to summarize the
                            article and capture the main points and essential information of the text while maintaining clarity and coherence.  </p>
                        <p>
                            Once you have completed your initial summary, you will have access to an AI generated summary by CondenseCrew (an AI system) <RobotOutlined /> which you can use to develop your summary, if you wish.
                        </p>
                        <p>
                            Note, there might be a delay in generating the AI summary by CondenseCrew, please be patient. This is denoted by <LoadingOutlined />.
                        </p>
                    </div>
                )}
                {condition === 3 && (
                    <div className="flex flex-col justify-start w-full items-start gap-y-4">
                        <p> You will encounter a news article that you are tasked to summarize. This summary must be within <strong>100 - 150 words.</strong> </p>
                        <p> It is your task to summarize the
                            article and capture the main points and essential information of the text while maintaining clarity and coherence.  </p>
                        <p>
                            Once you have completed your initial summary, you will have access to CondenseCrew (an AI system) <Avatar icon={<RobotOutlined />} /> which you can chat with in order to develop your summary.
                        </p>
                        <p>
                            Note, the first message to CondenseCrew is a prompt set by us to get you started with an initial summary and is denoted through <Avatar icon={<AuditOutlined />} />.
                        </p>
                        <p>
                            While using CondenseCrew there might be a delay in response, please be patient. This is denoted by <LoadingOutlined />.
                        </p>
                    </div>

                )}
            </div>
        </div>
    );
}

export default TaskInstructions;