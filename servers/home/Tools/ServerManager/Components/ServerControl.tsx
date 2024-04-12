import React, { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import { NS } from "NetscriptDefinitions";

interface IServerControlProps {
    ns: NS;
    defaultBuy: boolean;
    onBuy: () => boolean;
    sizeList: number[];
    defaultSize: number;
    onSize: (size: number) => number;
}

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export const ServerControl = ({
    ns,
    defaultBuy,
    onBuy,
    sizeList,
    defaultSize,
    onSize,
}: IServerControlProps) => {
    const [buy, setBuy] = useState<boolean>(defaultBuy ? defaultBuy : false);
    const [size, setSize] = useState<number>(defaultSize ? defaultSize : 8);

    const handleBuyServers = () => {
        setBuy(onBuy());
    };

    const handleSize = (event: ChangeEvent<HTMLSelectElement>) => {
        setSize(onSize(Number(event.currentTarget.value)));
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            <button
                className={`text-white font-bold py-2 px-4 rounded w-full ${
                    buy ? "bg-red-500" : "bg-green-500"
                }`}
                onClick={handleBuyServers}
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
                            return <option value={ramSize}>{ramSize}GB</option>;
                        })}
                    </select>
                </div>
            </div>
        </div>
    );
};
