import ReactDOM from "react-dom";

export class TailModal {
    ns: NS;
    doc: Document;

    constructor(ns: NS, doc: Document) {
        this.ns = ns;
        this.doc = doc;
    }

    /**
     * Returns the full command line for the current process, which is also the title of the tail modal
     */
    getCommandLine = () => {
        return this.ns.getScriptName() + " " + this.ns.args.join(" ");
    };

    /**
     * Tries to find the tail modal for this process
     */
    getTailModal = () => {
        const commandLine = this.getCommandLine();
        this.ns.tprint(commandLine);
        const modals = this.doc.querySelectorAll(`.drag > h6`);
        const tailTitleEl = Array.from(modals).find((x) =>
            x.textContent!.includes(commandLine)
        );
        return tailTitleEl?.parentElement!.parentElement;
    };

    getCustomModalContainer = (): HTMLDivElement | undefined => {
        const id = this.getCommandLine().replace(/[^\w\.]/g, "_");
        let containerEl = this.doc.getElementById(id) as HTMLDivElement | null;
        if (!containerEl) {
            const modalEl = this.getTailModal();
            if (!modalEl) {
                return undefined;
            }
            containerEl = this.doc.createElement("div");
            containerEl.id = id;
            containerEl.style.fontFamily =
                '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"';
            containerEl.style.fontWeight = "400";
            containerEl.style.position = "absolute";
            containerEl.style.overflow = "auto";
            containerEl.style.left = "0";
            containerEl.style.right = "0";
            containerEl.style.top = "34px";
            containerEl.style.bottom = "0";
            containerEl.style.background = "black";
            containerEl.style.color = "rgb(0, 204, 0)";
            containerEl.style.overflowY = "scroll";
            containerEl.style.height = "250px";
            const contentEl = modalEl.firstElementChild
                .nextElementSibling as HTMLElement;
            contentEl.style.paddingTop = "288px";
            contentEl.style.height = "calc(100% - 33px)";
            modalEl.insertBefore(containerEl, modalEl.firstChild);
        }
        return containerEl;
    };

    renderCustomModal = (element: React.ReactElement) => {
        const container = this.getCustomModalContainer();
        if (!container) {
            this.ns.tprint("Failed to get container");
            return;
        }
        ReactDOM.render(element, container);
    };
}
