export const debug = (x) => {
    if (process.env.DEBUG) {
        console.log('[DEBUG smart-glob]', x)
    }
}
