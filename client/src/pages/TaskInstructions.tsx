const TaskInstructions = ({condition}: {condition: number}) => {
    return (
        <div className="flex flex-col h-full w-full justify-center items-start">
            <div className="flex flex-col w-full h-full items-center justify-center gap-y-4">
                <h1 className="font-semibold text-2xl">Task Instructions 🔎</h1>
                {condition === 1 && <p> Instructions for Condition 1 </p>}
                {condition === 2 && <p> Instructions for Condition 2 </p>}
                {condition === 3 && <p> Instructions for Condition 3 </p>}
            </div>
        </div>
    );
}

export default TaskInstructions;