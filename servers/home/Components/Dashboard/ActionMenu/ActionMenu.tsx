import React from "react";
import Button from "react-bootstrap/Button";

export interface IActionMenuProps {
    ns: NS;
    onShowServer: () => void;
}

export const ActionMenu = ({ ns, onShowServer }: IActionMenuProps) => {
    return (
        <>
            <Button variant="primary" onClick={onShowServer}>
                Server Manager
            </Button>
        </>
    );
};
