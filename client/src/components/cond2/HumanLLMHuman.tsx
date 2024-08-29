import { useQuery } from "@tanstack/react-query";
import { InitCond2 } from "./InitCond2";
import { FinalCond2 } from "./FinalCond2";
import { useSearchParams } from "react-router-dom";
import { baseUrl } from "../../utils/Helper";
import { useState } from "react";

export const HumanLLMHumman = () => {
    const [searchParams, _setSearchParams] = useSearchParams();

    const prolificID = searchParams.get("prolificID");
    const [loading, setLoading] = useState(false);
    
    const { isPending, error, data } = useQuery({
        queryKey: ['cond2task'],
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
    // They must have submitted the first summary.
    if(data.initialSummary){
        return <FinalCond2 loading={loading} />
    }

    // Still at the first stage.
    return <InitCond2 loading={loading} setLoading={setLoading} />

}