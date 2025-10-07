import React, { ChangeEvent, useEffect, useState } from "react";
import { ServerInfo } from "../types";
import { SERVERPORT } from "../Constants";

interface IServerControlProps {
    ns: NS;
}

export const ServerControl = ({ ns }: IServerControlProps) => {
    const [showModal, setShowModal] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverPid, setServerPid] = useState(-1);
    const [sizeList, setSizeList] = useState([]);
    const [size, setSize] = useState(0);
    const maxRam = ns.getPurchasedServerMaxRam();
    useEffect(() => {
        const serverInfo: ServerInfo = JSON.parse(ns.peek(SERVERPORT));
        setSize(serverInfo.CurrentSize);
        let ramSizes = [];
        for (let i = serverInfo.CurrentSize; i <= maxRam; i *= 2) {
            ramSizes.push(i);
        }
        setSizeList(ramSizes);
    }, []);

    const handleEnabled = () => {
        setEnabled(!enabled);
    };

    const handleSize = (event: ChangeEvent<HTMLSelectElement>) => {
        setSize(Number(event.currentTarget.value));
    };

    const setShow = () => {
        try {
            const serverInfo: ServerInfo = JSON.parse(ns.peek(SERVERPORT));
            setSize(serverInfo.CurrentSize);
            let ramSizes = [];
            for (let i = serverInfo.CurrentSize; i <= maxRam; i *= 2) {
                ramSizes.push(i);
            }
            setSizeList(ramSizes);
            setShowModal(true);
        } catch (e) {
            ns.tprint(e);
        }
    };

    /*useEffect(() => {
        let serverInfo: ServerInfo = JSON.parse(ns.peek(SERVERPORT));
        let newServerPid = -1;
        let newEnabled = true;
        if (serverInfo.Enabled) {
            setEnabled(serverInfo.Enabled);
            setSize(serverInfo.CurrentSize);
            ns.scriptKill("Tools/ServerManager/ServerManager.js", "home");
            newServerPid = ns.exec(
                "Tools/ServerManager/ServerManager.js",
                "home"
            );
            if (newServerPid === 0) {
                ns.print("Failed to run Server script");
                console.log("Failed to run Server script");
                newServerPid = -1;
                newEnabled = false;
            }
            setServerPid(newServerPid);
            setEnabled(newEnabled);            
            setShowModal(false);
            setLoading(false);
        }
    }, []);*/

    const onSave = () => {
        setLoading(true);
        let newServerPid = serverPid;
        let newEnabled = enabled;
        if (newEnabled === true) {
            ns.scriptKill("Tools/ServerManager/ServerManager.js", "home");
            newServerPid = ns.exec(
                "Tools/ServerManager/ServerManager.js",
                "home"
            );
            if (newServerPid === 0) {
                ns.print("Failed to run Server script");
                console.log("Failed to run Server script");
                newServerPid = -1;
                newEnabled = false;
            }
        } else {
            if (serverPid !== 0) {
                ns.kill("Tools/ServerManager/ServerManager.js", "home");
                newServerPid = -1;
                newEnabled = false;
            }
        }
        setServerPid(newServerPid);
        setEnabled(newEnabled);
        const serverInfo: ServerInfo = JSON.parse(ns.peek(SERVERPORT));
        serverInfo.Enabled = newEnabled;
        serverInfo.MaxSize = size;
        ns.clearPort(SERVERPORT);
        ns.writePort(SERVERPORT, JSON.stringify(serverInfo));
        setShowModal(false);
        setLoading(false);
    };

    return (
        <>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fulll"
                type="button"
                onClick={setShow}
            >
                Servers
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
                                            Server Info
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
                                            Buy Servers
                                        </button>
                                        <div className="col-span-2">
                                            <div className="relative w-full lg:max-w-sm">
                                                <select
                                                    className="w-full p-1 text-gray-500 bg-white border rounded-md shadow-sm outline-none appearance-none focus:border-indigo-600"
                                                    value={size}
                                                    onChange={handleSize}
                                                    title="ServerSize"
                                                >
                                                    {sizeList.map((ramSize) => {
                                                        return (
                                                            <option
                                                                value={ramSize}
                                                            >
                                                                {ramSize}GB
                                                            </option>
                                                        );
                                                    })}
                                                </select>
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
