export async function main(ns: NS) {
    const fragmentRoots = [];
    const maxX = ns.stanek.giftWidth();
    const maxY = ns.stanek.giftHeight();

    for (let x = 0; x < maxX; x++) {
        for (let y = 0; y < maxY; y++) {
            let isFragment = ns.stanek.getFragment(x, y);
            if (isFragment !== undefined) {
                fragmentRoots.push(isFragment);
            }
        }
    }
    fragmentRoots.forEach((fragment) => {
        ns.tprint(`Fragment found at ${fragment.x} ${fragment.y}`);
    });
}
