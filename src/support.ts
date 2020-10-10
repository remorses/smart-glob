import globrex from 'globrex'

export const debug = (x) => {
    if (process.env.DEBUG) {
        console.log('[DEBUG smart-glob]', x)
    }
}

export const GLOBREX_OPTIONS: globrex.Options = {
    filepath: true,
    globstar: true,
    extended: true,
}