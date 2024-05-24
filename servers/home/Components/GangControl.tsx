import React, { MouseEvent, useEffect, useState } from "react";
import { ActivityFocus } from "../Tools/Gangs/Gangs";
import { GangInfo } from "../types";
import { GANGPORT } from "../Constants";

interface IGangControlProps {
    ns: NS;
}

export const GangControl = ({ ns }: IGangControlProps) => {
    const [showModal, setShowModal] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [gangPid, setGangPid] = useState(-1);
    const [buy, setBuy] = useState<boolean>(false);
    const [buyAugs, setBuyAugs] = useState<boolean>(false);
    const [ascend, setAscend] = useState<boolean>(false);
    const [activity, setActivity] = useState<ActivityFocus>(
        ActivityFocus.Money
    );

    const handleAscend = () => {
        setAscend(!ascend);
    };

    const handleBuyEquipment = () => {
        setBuy(!buy);
    };

    const handleBuyAugs = () => {
        setBuyAugs(!buyAugs);
    };

    const handleEnabled = () => {
        setEnabled(!enabled);
    };

    const handleActivityFocus = (selection: number) => {
        setActivity(selection);
    };

    const onSave = () => {
        setLoading(true);
        let newGangPid = gangPid;
        let newEnabled = enabled;
        if (newEnabled === true) {
            ns.scriptKill("Tools/Gangs/Gangs.js", "home");
            newGangPid = ns.exec("Tools/Gangs/Gangs.js", "home");
            if (newGangPid <= 0) {
                ns.print("Failed to run Gangs script");
                console.log("Failed to run gang script");
                newGangPid = -1;
                newEnabled = false;
            }
        } else {
            if (gangPid !== 0) {
                ns.kill("Tools/Gangs/Gangs.js", "home");
                newGangPid = -1;
                newEnabled = false;
            }
        }
        setEnabled(newEnabled);
        setGangPid(newGangPid);
        const gangInfo: GangInfo = JSON.parse(ns.peek(GANGPORT));
        gangInfo.Enabled = newEnabled;
        gangInfo.BuyAugs = buyAugs;
        gangInfo.BuyGear = buy;
        gangInfo.Activity = activity;
        gangInfo.Ascend = ascend;
        ns.clearPort(GANGPORT);
        ns.writePort(GANGPORT, JSON.stringify(gangInfo));
        setShowModal(false);
        setLoading(false);
    };
    const heart = ns.heart.break();

    return (
        <>
            <button
                className={`${
                    heart > -54000 ? "bg-slate-500" : "bg-blue-500"
                } hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fulll`}
                type="button"
                onClick={() => setShowModal(true)}
                disabled={heart > -54000}
            >
                Gangs
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
                                            <button
                                                className={`text-white font-bold py-2 px-4 rounded w-full ${
                                                    buy
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                                onClick={handleBuyEquipment}
                                            >
                                                Buy Equipment
                                            </button>
                                            <button
                                                className={`text-white font-bold py-2 px-4 rounded w-full ${
                                                    buyAugs
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                                onClick={handleBuyAugs}
                                            >
                                                Buy Augs
                                            </button>
                                            <button
                                                className={`text-white font-bold py-2 px-4 rounded w-full ${
                                                    ascend
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                                onClick={handleAscend}
                                            >
                                                Enable Ascension
                                            </button>
                                            <div className={"col-span-2"}>
                                                <div className="inline-flex">
                                                    <button
                                                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l w-full ${
                                                            activity ===
                                                            ActivityFocus.Money
                                                                ? "bg-blue-700"
                                                                : "bg-blue-500"
                                                        }`}
                                                        onClick={() =>
                                                            handleActivityFocus(
                                                                ActivityFocus.Money
                                                            )
                                                        }
                                                    >
                                                        Money
                                                    </button>
                                                    <button
                                                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 w-full ${
                                                            activity ===
                                                            ActivityFocus.Respect
                                                                ? "bg-blue-700"
                                                                : "bg-blue-500"
                                                        }`}
                                                        onClick={() =>
                                                            handleActivityFocus(
                                                                ActivityFocus.Respect
                                                            )
                                                        }
                                                    >
                                                        Respect
                                                    </button>
                                                    <button
                                                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 w-full ${
                                                            activity ===
                                                            ActivityFocus.Warfare
                                                                ? "bg-blue-700"
                                                                : "bg-blue-500"
                                                        }`}
                                                        onClick={() =>
                                                            handleActivityFocus(
                                                                ActivityFocus.Warfare
                                                            )
                                                        }
                                                    >
                                                        Warfare
                                                    </button>
                                                    <button
                                                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 w-full ${
                                                            activity ===
                                                            ActivityFocus.Balance
                                                                ? "bg-blue-700"
                                                                : "bg-blue-500"
                                                        }`}
                                                        onClick={() =>
                                                            handleActivityFocus(
                                                                ActivityFocus.Balance
                                                            )
                                                        }
                                                    >
                                                        Balance
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
