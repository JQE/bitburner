export async function main(ns: NS) {
    const num_nfg = ns.singularity
        .getOwnedAugmentations(true)
        .reduce((acc, aug) => acc + (aug == "NeuroFlux Governor" ? 1 : 0), 0);
    ns.tprint(num_nfg);
}
