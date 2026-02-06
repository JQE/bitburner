const layout = [
    { id: 105, x: 3, y: 0, rot: 3 },
    { id: 16, x: 2, y: 0, rot: 1 },
    { id: 12, x: 0, y: 1, rot: 1 },
    { id: 105, x: 1, y: 1, rot: 1 },
    { id: 10, x: 5, y: 2, rot: 1 },
    { id: 106, x: 3, y: 2, rot: 3 },
    { id: 14, x: 0, y: 4, rot: 2 },
    { id: 30, x: 0, y: 5, rot: 0 },
    { id: 102, x: 2, y: 5, rot: 0 },
    { id: 28, x: 4, y: 5, rot: 0 },
];

export async function main(ns: NS) {
    ns.disableLog("ALL");
    ns.stanek.clearGift();
    for (let frag of layout) {
        const placed = ns.stanek.placeFragment(
            frag.x,
            frag.y,
            frag.rot,
            frag.id,
        );
        if (!placed) {
            ns.print(
                `Warning: Failed to place fragment ID ${frag.id} at (${frag.x},${frag.y})`,
            );
        }
    }
}
