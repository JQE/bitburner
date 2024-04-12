import React, { MouseEvent, useEffect, useState } from "react";
import { ActivityFocus } from "../Tools/Gangs/Gangs";
import { GangInfo, HackInfo, HackType } from "../types";
import { GANGPORT, HACKPORT } from "../Constants";

interface IHackControlProps {
    ns: NS;
}

export const HackControl = ({ ns }: IHackControlProps) => {
    const [showModal, setShowModal] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hackPid, setHackPid] = useState(-1);
    const [hackType, setHackType] = useState<HackType>(HackType.Basic);
    useEffect(() => {
        const hackInfo: HackInfo = JSON.parse(ns.peek(HACKPORT));
        setHackType(hackInfo.Type);
    }, []);

    const handleEnabled = () => {
        setEnabled(!enabled);
    };

    const handleHackType = (selection: HackType) => {
        setHackType(selection);
    };

    const onSave = () => {
        setLoading(true);
        let newHackPid = hackPid;
        let newEnabled = enabled;
        if (newEnabled === true) {
            ns.scriptKill("CD/Tools/HackManager/HackManager.js", "home");
            newHackPid = ns.exec("CD/Tools/HackManager/HackManager.js", "home");
            if (newHackPid === 0) {
                ns.print("Failed to run Hack script");
                console.log("Failed to run Hack script");
                newHackPid = -1;
                newEnabled = false;
            }
        } else {
            if (hackPid !== 0) {
                ns.kill("CD/Tools/HackManager/HackManager.js", "home");
                newHackPid = -1;
                newEnabled = false;
            }
        }
        setHackPid(newHackPid);
        setEnabled(newEnabled);
        const hackInfo: HackInfo = JSON.parse(ns.peek(HACKPORT));
        hackInfo.Enabled = newEnabled;
        hackInfo.Type = hackType;
        ns.clearPort(HACKPORT);
        ns.writePort(HACKPORT, JSON.stringify(hackInfo));
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
                Hacking
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
                                            Hack Info
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
                                                Enable Hacking
                                            </button>
                                            <div>
                                                <div className="inline-flex">
                                                    <button
                                                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l w-full ${
                                                            hackType ===
                                                            HackType.Basic
                                                                ? "bg-blue-700"
                                                                : "bg-blue-500"
                                                        }`}
                                                        onClick={() =>
                                                            handleHackType(
                                                                HackType.Basic
                                                            )
                                                        }
                                                    >
                                                        Basic
                                                    </button>
                                                    <button
                                                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 w-full ${
                                                            hackType ===
                                                            HackType.Share
                                                                ? "bg-blue-700"
                                                                : "bg-blue-500"
                                                        }`}
                                                        onClick={() =>
                                                            handleHackType(
                                                                HackType.Share
                                                            )
                                                        }
                                                    >
                                                        Share
                                                    </button>
                                                    <button
                                                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 w-full ${
                                                            hackType ===
                                                            HackType.Batch
                                                                ? "bg-blue-700"
                                                                : "bg-blue-500"
                                                        }`}
                                                        onClick={() =>
                                                            handleHackType(
                                                                HackType.Batch
                                                            )
                                                        }
                                                    >
                                                        Batch
                                                    </button>
                                                </div>
                                            </div>
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
