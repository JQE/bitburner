import React, { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import { NS } from "NetscriptDefinitions";
import { ActivityFocus } from "../Gangs";

interface IGangControlProps {
    ns: NS;
    defaultBuy: boolean;
    defaultBuyAugs: boolean;
    defaultActivity: ActivityFocus;
    defaultJob: string;
    onBuy: () => boolean;
    onBuyAugs: () => boolean;
    onActivity: (activity: number) => ActivityFocus;
    onJob: (job: string) => string;
}

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export const GangControl = ({
    ns,
    defaultBuy,
    onBuy,
    defaultBuyAugs,
    onBuyAugs,
    defaultActivity,
    onActivity,
    defaultJob,
    onJob,
}: IGangControlProps) => {
    const [jobList, setJobList] = useState<string[]>([]);
    const [buy, setBuy] = useState<boolean>(defaultBuy ? defaultBuy : false);
    const [buyAugs, setBuyAugs] = useState<boolean>(
        defaultBuyAugs ? defaultBuyAugs : false
    );
    const [activity, setActivity] = useState<ActivityFocus>(
        defaultActivity ? defaultActivity : ActivityFocus.Money
    );
    const [job, setJob] = useState<string>(
        defaultJob ? defaultJob : "Mug People"
    );

    useEffect(() => {
        setJobList(ns.gang.getTaskNames());
    }, []);

    const handleBuyEquipment = () => {
        setBuy(onBuy());
    };

    const handleBuyAugs = () => {
        setBuyAugs(onBuyAugs());
    };

    const handleActivityFocus = (selection: number) => {
        setActivity(onActivity(selection));
    };

    const handleJob = (event: MouseEvent<HTMLSelectElement>) => {
        setJob(onJob(event.currentTarget.value));
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            <button
                className={`text-white font-bold py-2 px-4 rounded w-full ${
                    buy ? "bg-red-500" : "bg-green-500"
                }`}
                onClick={handleBuyEquipment}
            >
                Buy Equipment
            </button>
            <button
                className={`text-white font-bold py-2 px-4 rounded w-full ${
                    buyAugs ? "bg-red-500" : "bg-green-500"
                }`}
                onClick={handleBuyAugs}
            >
                Buy Augs
            </button>
            <div>
                <div className="inline-flex">
                    <button
                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l w-full ${
                            activity === ActivityFocus.Money
                                ? "bg-blue-700"
                                : "bg-blue-500"
                        }`}
                        onClick={() => handleActivityFocus(ActivityFocus.Money)}
                    >
                        Money
                    </button>
                    <button
                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 w-full ${
                            activity === ActivityFocus.Respect
                                ? "bg-blue-700"
                                : "bg-blue-500"
                        }`}
                        onClick={() =>
                            handleActivityFocus(ActivityFocus.Respect)
                        }
                    >
                        Respect
                    </button>
                    <button
                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 w-full ${
                            activity === ActivityFocus.Warfare
                                ? "bg-blue-700"
                                : "bg-blue-500"
                        }`}
                        onClick={() =>
                            handleActivityFocus(ActivityFocus.Warfare)
                        }
                    >
                        Warfare
                    </button>
                    <button
                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 w-full ${
                            activity === ActivityFocus.Balance
                                ? "bg-blue-700"
                                : "bg-blue-500"
                        }`}
                        onClick={() =>
                            handleActivityFocus(ActivityFocus.Balance)
                        }
                    >
                        Balance
                    </button>
                </div>
            </div>
            <div className="col-span-2">
                <div className="relative w-full lg:max-w-sm">
                    <select
                        className="w-full p-1 text-gray-500 bg-white border rounded-md shadow-sm outline-none appearance-none focus:border-indigo-600"
                        value={job}
                        onClick={handleJob}
                    >
                        {jobList.map((task) => {
                            return <option value={task}>{task}</option>;
                        })}
                    </select>
                </div>
            </div>
        </div>
    );
};
