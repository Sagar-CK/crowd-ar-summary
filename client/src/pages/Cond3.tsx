import PreTask from "./PreTask";
import { useNavigate, useSearchParams } from "react-router-dom";
import PostTask from "./PostTask";
import { InteractiveLLM } from "../components/cond3/InteractiveLLM";
import { useQuery } from "@tanstack/react-query";
import Completion from "./Completion";
import { baseUrl } from "../utils/Helper";

const Cond3 = () => {
    const navigate = useNavigate();
    const [searchParams, _setSearchParams] = useSearchParams();

    const prolificID = searchParams.get("prolificID");

    const { isPending, error, data, } = useQuery({
        queryKey: ['cond3', prolificID],
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
                Fetching your data!
            </div>
        );
    }

    if (error || !data) {
        return (
            <PreTask
                condition={3}
            />
        );
    }

    if (data.revokedConsent) {
        navigate("/revoked-consent")
    }

    if (data.postTask) {
        return <Completion/>
    }

    if (data.task) {
        return (
            <PostTask
                condition={3}
            />
        );
    }

    if (data.preTask) {
        return <InteractiveLLM />
    }

    return (
        <div className="flex h-full w-full items-center justify-center">
            Something went wrong!
        </div>
    );
}

export default Cond3;