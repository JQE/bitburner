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

    getCustomModalContainer = (
        title: string,
        height: number
    ): HTMLDivElement | undefined => {
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
            containerEl.style.background = "black";
            containerEl.style.color = "rgb(0, 204, 0)";
            containerEl.style.border = "1px solid rgb(68,68,68)";
            const contentEl = modalEl.firstElementChild
                .nextElementSibling as HTMLElement;
            modalEl.firstElementChild.querySelector("h6").title = title;
            modalEl.firstElementChild.querySelector("h6").innerText = title;
            modalEl.querySelectorAll("span").forEach((span) => {
                span.remove();
            });
            modalEl.style.height = `100vh`;
            modalEl.style.width = "350px";
            modalEl.className = "";
            const index =
                modalEl.parentElement.className.indexOf("react-draggable");
            modalEl.parentElement.className =
                modalEl.parentElement.className.substring(index + 15);
            modalEl.parentElement.style.transform = "";
            modalEl.parentElement.style.display = "contents";
            modalEl.parentElement.style.right = "0";
            const terminal = modalEl.lastChild.firstChild.parentElement;
            terminal.style.height = `calc(100% - 216px)`;
            terminal.style.display = "";

            contentEl.parentElement.insertBefore(containerEl, contentEl);
        }
        return containerEl;
    };

    renderCustomModal = (
        element: React.ReactElement,
        title: string,
        height: number
    ) => {
        const container = this.getCustomModalContainer(title, height);
        if (!container) {
            this.ns.tprint("Failed to get container");
            return;
        }
        ReactDOM.render(element, container);
    };
}
