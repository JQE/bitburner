import React, { useState } from "react";

interface IControlPanelProps {
    ns: NS;
    onQuit: () => void;
}

export const ControlPanel = ({ ns, onQuit }: IControlPanelProps) => {
    return (
        <div>
            <main className="grid grid-cols-2 gap-2">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fulll"
                    onClick={onQuit}
                >
                    Quit
                </button>
            </main>
            <br />
            <h6>Info Screen</h6>
        </div>
    );
};
