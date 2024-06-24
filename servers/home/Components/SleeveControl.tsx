import React, { useState } from "react";
import { SLEEVEPORT } from "../Constants";
import { SleeveInfo } from "../types";

interface ISleeveControlProps {
    ns: NS;
}

export const SleeveControl = ({ ns }: ISleeveControlProps) => {
    const [showModal, setShowModal] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sleevePid, setSleevePid] = useState(-1);
    const [buyAugs, setBuyAugs] = useState(false);

    const handleEnabled = () => {
        setEnabled(!enabled);
    };
    const handleBuyAugs = () => {
        setBuyAugs(true);
    };

    const setShow = () => {
        setShowModal(true);
    };

    const onSave = () => {
        setLoading(true);
        let newSleevePid = sleevePid;
        let newEnabled = enabled;
        if (newEnabled === true) {
            ns.scriptKill("Tools/Sleeves/SleeveManager.js", "home");
            newSleevePid = ns.exec("Tools/Sleeves/SleeveManager.js", "home");
            if (newSleevePid === 0) {
                ns.print("Failed to run Sleeve script");
                console.log("Failed to run Sleeve script");
                newSleevePid = -1;
                newEnabled = false;
            }
        } else {
            if (newSleevePid !== 0) {
                ns.kill("Tools/Sleeves/SleeveManager.js", "home");
                newSleevePid = -1;
                newEnabled = false;
            }
        }
        setSleevePid(newSleevePid);
        setEnabled(newEnabled);
        const sleeveInfo: SleeveInfo = JSON.parse(ns.peek(SLEEVEPORT));
        sleeveInfo.Enabled = enabled;
        sleeveInfo.BuyAugs = buyAugs;
        ns.clearPort(SLEEVEPORT);
        ns.writePort(SLEEVEPORT, JSON.stringify(sleeveInfo));
        setLoading(false);
        setShowModal(false);
    };

    return (
        <>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fulll"
                type="button"
                onClick={setShow}
            >
                Sleeves
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
                                            Sleeve Info
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
                                        <button
                                            className={`text-white font-bold py-2 px-4 rounded w-full ${
                                                enabled
                                                    ? "bg-red-500"
                                                    : "bg-green-500"
                                            }`}
                                            onClick={handleEnabled}
                                        >
                                            Manage Sleeves
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
