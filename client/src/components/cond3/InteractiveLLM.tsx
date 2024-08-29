import { useSearchParams } from "react-router-dom";
import { InitCond3 } from "./InitCond3";
import { FinalCond3 } from "./FinalCond3";
import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../../utils/Helper";

export const InteractiveLLM = () => {
    const [searchParams, _setSearchParams] = useSearchParams();
    const prolificID = searchParams.get("prolificID");

    const { isPending, error, data } = useQuery({
        queryKey: ['cond3task'],
        queryFn: async () => {
            try {
                const res = await fetch(`${baseUrl}/api/users/${prolificID}`)
                return await res.json();
            }
            catch (e) {
                throw Error("not defined.")
            }

        }
    })

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


    // They must have submitted the first summary.
    if(data.initialSummary){
        return <FinalCond3 />
    }

    // Still at the first stage.
    return <InitCond3 />;  


};
