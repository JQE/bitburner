import React, { useEffect } from "react";
import { useAppSelector } from "servers/home/state/hooks";
import { RootState, store } from "servers/home/state/store";

export const AdditionalStats = () => {
    const doc = globalThis["document"];
    const hook0 = doc.getElementById("overview-extra-hook-0");
    const hook1 = doc.getElementById("overview-extra-hook-1");

    const serverInfo = useAppSelector(
        (state: RootState) => state.servermanager
    );

    useEffect(() => {
        const headers = [];
        const values = [];
        Object.entries(serverInfo).forEach((infoLine) => {
            headers.push(infoLine[0]);
            values.push(infoLine[1]);
        });
        hook0.innerText = headers.join(" \n");
        hook1.innerText = values.join(" \n");

        return () => {
            hook0.innerText = "";
            hook1.innerText = "";
        };
    }, [serverInfo]);

    return <div style={{ display: "none", visibility: "hidden" }}></div>;
};
