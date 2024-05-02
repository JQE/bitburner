import React, { MouseEvent, useEffect, useState } from "react";
import { HacknetInfo } from "../types";
import { HACKNETPORT } from "../Constants";

interface IHacknetControlProps {
    ns: NS;
}

export const HacknetControl = ({ ns }: IHacknetControlProps) => {
    const [showModal, setShowModal] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [buy, setBuy] = useState(false);
    const [upgradeRam, setUpgradeRam] = useState(false);
    const [upgradeCores, setUpgradeCores] = useState(false);
    const [upgradeLevel, setUpgradeLevel] = useState(false);
    const [upgradeCache, setUpgradeCache] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hacknetPid, setHacknetPid] = useState(-1);

    const handleEnabled = () => {
        setEnabled(!enabled);
    };
    const handleBuy = () => {
        setBuy(!buy);
    };
    const handleUpgradeRam = () => {
        setUpgradeRam(!upgradeRam);
    };
    const handleUpgradeCores = () => {
        setUpgradeCores(!upgradeCores);
    };
    const handleUpgradeLevel = () => {
        setUpgradeLevel(!upgradeLevel);
    };
    const handleUpgradeCache = () => {
        setUpgradeCache(!upgradeCache);
    };

    const onSave = () => {
        setLoading(true);
        let newHacknetPid = hacknetPid;
        let newEnabled = enabled;
        if (newEnabled === true) {
            ns.scriptKill("Tools/Hacknet/HacknetManager.js", "home");
            newHacknetPid = ns.exec("Tools/Hacknet/HacknetManager.js", "home");
            if (newHacknetPid === 0) {
                ns.print("Failed to run Hack script");
                newHacknetPid = -1;
                newEnabled = false;
            }
        } else {
            if (hacknetPid !== 0) {
                ns.kill("Tools/Hacknet/HacknetManager.js", "home");
                newHacknetPid = -1;
                newEnabled = false;
            }
        }
        setHacknetPid(newHacknetPid);
        setEnabled(newEnabled);
        const hacknetInfo: HacknetInfo = JSON.parse(ns.peek(HACKNETPORT));
        hacknetInfo.Enabled = newEnabled;
        hacknetInfo.Buy = buy;
        hacknetInfo.UpgradeRam = upgradeRam;
        hacknetInfo.UpgradeLevel = upgradeLevel;
        hacknetInfo.UpgradeCores = upgradeCores;
        hacknetInfo.UpgradeCache = upgradeCache;
        ns.clearPort(HACKNETPORT);
        ns.writePort(HACKNETPORT, JSON.stringify(hacknetInfo));
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
                Hacknet
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
                                            Hacknet Info
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
                                                Enable hacknet
                                            </button>
                                            <button
                                                className={`text-white font-bold py-2 px-4 rounded w-full ${
                                                    buy
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                                onClick={handleBuy}
                                            >
                                                Buy Servers
                                            </button>
                                            <button
                                                className={`text-white font-bold py-2 px-4 rounded w-full ${
                                                    upgradeRam
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                                onClick={handleUpgradeRam}
                                            >
                                                Upgrade Ram
                                            </button>
                                            <button
                                                className={`text-white font-bold py-2 px-4 rounded w-full ${
                                                    upgradeLevel
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                                onClick={handleUpgradeLevel}
                                            >
                                                Upgrade Levels
                                            </button>
                                            <button
                                                className={`text-white font-bold py-2 px-4 rounded w-full ${
                                                    upgradeCores
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                                onClick={handleUpgradeCores}
                                            >
                                                Upgrade Cores
                                            </button>
                                            <button
                                                className={`text-white font-bold py-2 px-4 rounded w-full ${
                                                    upgradeCache
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                                onClick={handleUpgradeCache}
                                            >
                                                Upgrade Cache
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
