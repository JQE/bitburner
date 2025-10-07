import React, { MouseEvent, useEffect, useState } from "react";
import { ActivityFocus } from "../Tools/Gangs/Gangs";
import { LifeInfo } from "../types";
import { LIFEPORT } from "../Constants";

interface ILifeControlProps {
    ns: NS;
}

export const LifeControl = ({ ns }: ILifeControlProps) => {
    const [showModal, setShowModal] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lifePid, setLifePid] = useState(-1);
    const [joinGang, setJoinGang] = useState(false);
    const [manageWork, setMangeWork] = useState(true);
    const [buyAugs, setBuyAugs] = useState(false);

    const handleEnabled = () => {
        setEnabled(!enabled);
    };

    const handleJoinGang = () => {
        setJoinGang(!joinGang);
    };
    const handleManageWork = () => {
        setMangeWork(!manageWork);
    };
    const handleBuyAugs = () => {
        setBuyAugs(!buyAugs);
    };
    /*useEffect(() => {
        let lifeInfo: LifeInfo = JSON.parse(ns.peek(LIFEPORT));
        let newEnabled = true;
        if (lifeInfo.Enabled) {
            setEnabled(lifeInfo.Enabled);
            setBuyAugs(lifeInfo.BuyAugs);
            setJoinGang(lifeInfo.JoinGang);
            setMangeWork(lifeInfo.ManageWork);
            ns.scriptKill("Tools/LifeManager/LifeManager.js", "home");
            let newLifePid = ns.exec(
                "Tools/LifeManager/LifeManager.js",
                "home"
            );
            if (newLifePid === 0) {
                ns.print("Failed to run Life script");
                newLifePid = -1;
                newEnabled = false;
            }
            setLifePid(newLifePid);
            setEnabled(newEnabled);
            lifeInfo = JSON.parse(ns.peek(LIFEPORT));
            lifeInfo.Enabled = newEnabled;
            lifeInfo.JoinGang = joinGang;
            lifeInfo.ManageWork = manageWork;
            lifeInfo.BuyAugs = buyAugs;
            ns.clearPort(LIFEPORT);
            ns.writePort(LIFEPORT, JSON.stringify(lifeInfo));
        }
    }, []);*/

    const onSave = () => {
        setLoading(true);
        let newLifePid = lifePid;
        let newEnabled = enabled;
        if (newEnabled === true) {
            ns.scriptKill("Tools/LifeManager/LifeManager.js", "home");
            newLifePid = ns.exec("Tools/LifeManager/LifeManager.js", "home");
            if (newLifePid === 0) {
                ns.print("Failed to run Life script");
                newLifePid = -1;
                newEnabled = false;
            }
        } else {
            if (lifePid !== 0) {
                ns.kill("Tools/LifeManager/LifeManager.js", "home");
                newLifePid = -1;
                newEnabled = false;
            }
        }
        setLifePid(newLifePid);
        setEnabled(newEnabled);
        const lifeInfo: LifeInfo = JSON.parse(ns.peek(LIFEPORT));
        lifeInfo.Enabled = newEnabled;
        lifeInfo.JoinGang = joinGang;
        lifeInfo.ManageWork = manageWork;
        lifeInfo.BuyAugs = buyAugs;
        ns.clearPort(LIFEPORT);
        ns.writePort(LIFEPORT, JSON.stringify(lifeInfo));
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
                Life
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
                                            Life Info
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
                                                Enable Life
                                            </button>
                                            <button
                                                className={`text-white font-bold py-2 px-4 rounded w-full ${
                                                    joinGang
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                                onClick={handleJoinGang}
                                            >
                                                Join Gang
                                            </button>
                                            <button
                                                className={`text-white font-bold py-2 px-4 rounded w-full ${
                                                    manageWork
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                                onClick={handleManageWork}
                                            >
                                                Manage Work
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
