import React from "react";

interface IControlPanelProps {
    onGangs: () => void;
    onQuit: () => void;
    onBatcher: () => void;
    onServer: () => void;
    onHack: () => void;
}

export const ControlPanel = ({
    onGangs,
    onQuit,
    onBatcher,
    onServer,
    onHack,
}: IControlPanelProps) => {
    return (
        <div className="grid grid-cols-2 gap-2">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                onClick={onGangs}
            >
                Gangs
            </button>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fulll"
                onClick={onBatcher}
            >
                Batcher
            </button>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                onClick={onServer}
            >
                Server Manager
            </button>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fulll"
                onClick={onHack}
            >
                Hacking Manager
            </button>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fulll"
                onClick={onQuit}
            >
                Quit
            </button>
        </div>
    );
};
