import React, { useEffect, useState } from "react";
import { StanekInfo } from "../types";
import { STANEKPORT } from "../Constants";

interface IStanekControlProps {
    ns: NS;
}

export const StanekControl = ({ ns }: IStanekControlProps) => {
    const [showModal, setShowModal] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stanekPid, setStanekPid] = useState(-1);

    const handleEnabled = () => {
        setEnabled(!enabled);
    };

    useEffect(() => {
        let stanekInfo: StanekInfo = JSON.parse(ns.peek(STANEKPORT));
        let newEnabled = true;
        if (stanekInfo.Enabled) {
            setEnabled(stanekInfo.Enabled);

            ns.scriptKill("Tools/Stanek/StanekManager.js", "home");
            let newBladePid = ns.exec("Tools/Stanek/StanekManager.js", "home");
            if (newBladePid <= 0) {
                ns.print("Failed to run Stanek script");
                console.log("Failed to run Stanek script");
                newBladePid = -1;
                newEnabled = false;
            }
            setEnabled(newEnabled);
            setStanekPid(newBladePid);
            stanekInfo = JSON.parse(ns.peek(STANEKPORT));
            stanekInfo.Enabled = newEnabled;
            ns.clearPort(STANEKPORT);
            ns.writePort(STANEKPORT, JSON.stringify(stanekInfo));
        }
    }, []);

    /*useEffect(() => {
        const gangInfo: GangInfo = JSON.parse(ns.peek(GANGPORT));
        if (gangInfo.Enabled) {
            setEnabled(gangInfo.Enabled);
            setBuyAugs(gangInfo.BuyAugs);
            setAscend(gangInfo.Ascend);
            setBuy(gangInfo.BuyGear);
            onSave();
        }
    }, []);*/

    const onSave = () => {
        setLoading(true);
        let newStanekPid = stanekPid;
        let newEnabled = enabled;
        if (newEnabled === true) {
            ns.scriptKill("Tools/Stanek/StanekManager.js", "home");
            newStanekPid = ns.exec("Tools/Stanek/StanekManager.js", "home");
            if (newStanekPid <= 0) {
                ns.print("Failed to run Stanek script");
                console.log("Failed to run Stanek script");
                newStanekPid = -1;
                newEnabled = false;
            }
        } else {
            if (newStanekPid !== 0) {
                ns.scriptKill("Tools/Stanek/StanekManager.js", "home");
                newStanekPid = -1;
                newEnabled = false;
            }
        }
        setEnabled(newEnabled);
        setStanekPid(newStanekPid);
        const stanekInfo: StanekInfo = JSON.parse(ns.peek(STANEKPORT));
        stanekInfo.Enabled = newEnabled;
        ns.clearPort(STANEKPORT);
        ns.writePort(STANEKPORT, JSON.stringify(stanekInfo));
        setShowModal(false);
        setLoading(false);
    };

    return (
        <>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fulll"
                type="button"
                onClick={() => setShowModal(true)}
            >
                Stanek
            </button>
            {showModal ? (
                <>
                    {loading ? (
                        <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                            <div className="relative w-auto my-6 mx-auto max-w-3xl">
                                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                    <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
                                        <h3 className="text-3xl font=semibold">
                                            Loading
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                            <div className="relative w-auto my-6 mx-auto max-w-3xl">
                                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                    <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
                                        <h3 className="text-3xl font=semibold">
                                            Gang Info
                                        </h3>
                                        <button
                                            className="bg-transparent border-0 text-black float-right"
                                            onClick={() => setShowModal(false)}
                                        >
                                            <span className="text-black opacity-7 h-6 w-6 text-xl block bg-gray-400 py-0 rounded-full">
                                                x
                                            </span>
                                        </button>
                                    </div>
                                    <div className="relative p-6 flex-auto">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                className={`text-white font-bold py-2 px-4 rounded w-full ${
                                                    enabled
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                                onClick={handleEnabled}
                                            >
                                                {enabled ? "Disable" : "Enable"}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                                        <button
                                            className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Close
                                        </button>
                                        <button
                                            className="text-white bg-yellow-500 active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                                            type="button"
                                            onClick={onSave}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : null}
        </>
    );
};
