export async function main(ns: NS) {
    const target = "joesguns";

    // Infinite loop that continously hacks/grows/weakens the target server
    while (true) {
        await ns.share();
    }
}
