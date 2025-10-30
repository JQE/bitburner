import React, { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import { NS } from "NetscriptDefinitions";
import { HackType } from "../HackManager";

interface IHackControlProps {
    ns: NS;
    defaultType: HackType;
    defaultHacking: boolean;
    onHackType: (type: HackType) => HackType;
    onHack: () => boolean;
}

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export const HackControl = ({
    ns,
    defaultType,
    defaultHacking,
    onHack,
    onHackType,
}: IHackControlProps) => {
    const [hacking, setHacking] = useState<boolean>(
        defaultHacking ? defaultHacking : false
    );
    const [hackType, setHackType] = useState<HackType>(
        defaultType ? defaultType : HackType.Basic
    );

    const handleHacking = () => {
        setHacking(onHack());
    };

    const handleHackType = (selection: number) => {
        setHackType(onHackType(selection));
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            <button
                className={`text-white font-bold py-2 px-4 rounded w-full ${
                    hacking ? "bg-red-500" : "bg-green-500"
                }`}
                onClick={handleHacking}
            >
                Enable Hacking
            </button>
            <div>
                <div className="inline-flex">
                    <button
                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l w-full ${
                            hackType === HackType.Basic
                                ? "bg-blue-700"
                                : "bg-blue-500"
                        }`}
                        onClick={() => handleHackType(HackType.Basic)}
                    >
                        Basic
                    </button>
                    <button
                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 w-full ${
                            hackType === HackType.Share
                                ? "bg-blue-700"
                                : "bg-blue-500"
                        }`}
                        onClick={() => handleHackType(HackType.Share)}
                    >
                        Share
                    </button>
                    <button
                        className={`hover:bg-blue-700 text-white font-bold py-2 px-4 w-full ${
                            hackType === HackType.Batch
                                ? "bg-blue-700"
                                : "bg-blue-500"
                        }`}
                        onClick={() => handleHackType(HackType.Batch)}
                    >
                        Batch
                    </button>
                </div>
            </div>
        </div>
    );
};
