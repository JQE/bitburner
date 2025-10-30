import React, { MouseEvent, useEffect, useState } from "react";
import { ActivityFocus } from "../Tools/Gangs/Gangs";
import { BladeBurnerInfo } from "../types";
import { BBPORT } from "../Constants";

interface IBladeControlProps {
    ns: NS;
}

export const BladeControl = ({ ns }: IBladeControlProps) => {
    const [showModal, setShowModal] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bladePid, setBladePid] = useState(-1);

    const handleEnabled = () => {
        setEnabled(!enabled);
    };

    useEffect(() => {
        let bladeInfo: BladeBurnerInfo = JSON.parse(ns.peek(BBPORT));
        let newEnabled = true;
        if (bladeInfo.Enabled) {
            setEnabled(bladeInfo.Enabled);

            ns.scriptKill("Tools/BladeBurner/BladeBurner.js", "home");
            let newBladePid = ns.exec(
                "Tools/BladeBurner/BladeBurner.js",
                "home"
            );
            if (newBladePid <= 0) {
                ns.print("Failed to run Blade Burner script");
                console.log("Failed to run Blade Burner script");
                newBladePid = -1;
                newEnabled = false;
            }
            setEnabled(newEnabled);
            setBladePid(newBladePid);
            bladeInfo = JSON.parse(ns.peek(BBPORT));
            bladeInfo.Enabled = newEnabled;
            ns.clearPort(BBPORT);
            ns.writePort(BBPORT, JSON.stringify(bladeInfo));
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
        let newBladePid = bladePid;
        let newEnabled = enabled;
        if (newEnabled === true) {
            ns.scriptKill("Tools/BladeBurner/BladeBurner.js", "home");
            newBladePid = ns.exec("Tools/BladeBurner/BladeBurner.js", "home");
            if (newBladePid <= 0) {
                ns.print("Failed to run Gangs script");
                console.log("Failed to run gang script");
                newBladePid = -1;
                newEnabled = false;
            }
        } else {
            if (newBladePid !== 0) {
                ns.kill("Tools/BladeBurner/BladeBurner.js", "home");
                newBladePid = -1;
                newEnabled = false;
            }
        }
        setEnabled(newEnabled);
        setBladePid(newBladePid);
        const bladeInfo: BladeBurnerInfo = JSON.parse(ns.peek(BBPORT));
        bladeInfo.Enabled = newEnabled;
        ns.clearPort(BBPORT);
        ns.writePort(BBPORT, JSON.stringify(bladeInfo));
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
                Blade Burner
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
