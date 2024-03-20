import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

interface IServerPanelProps {
    ns: NS;
    onShow: () => void;
    onClose: () => void;
}

export const ServerPanel = ({ ns }: IServerPanelProps) => {
    return (
        <div
            className="modal show"
            style={{ display: "block", position: "initial" }}
        >
            <Modal.Dialog>
                <Modal.Header closeButton>
                    <Modal.Title>Server Controls</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Button>Start something</Button>
                </Modal.Body>
            </Modal.Dialog>
        </div>
    );
};
