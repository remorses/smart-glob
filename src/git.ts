import { exec } from 'promisify-child-process'
import { promises as fs, lstatSync, Stats } from 'fs'
import { GlobOptions, glob } from './glob'
import globalyzer from 'globalyzer'
import globrex from 'globrex'
import path from 'path'
import { cachedDataVersionTag } from 'v8'
import { debug } from './support'

const GLOBREX_OPTIONS: globrex.Options = {
    filepath: true,
    globstar: true,
    extended: true,
}

type GitGlobOptions = Pick<GlobOptions, 'cwd' | 'absolute' | 'ignoreGlobs'> & {
    gitFlags?: string
}

export async function globWithGit(
    globStr: string,
    opts: GitGlobOptions = {},
): Promise<string[]> {
    try {
        if (!globStr) return []
        opts.absolute = opts.absolute ?? true
        globStr = path.normalize(globStr)
        let glb = globalyzer(globStr)

        if (!glb.isGlob) {
            debug(`not a glob, using normal globber`)
            return await glob(globStr, opts)
        }

        debug(`getting paths with git`)
        const cwd = path.resolve(opts.cwd || '.')
        let paths = await gitPaths(cwd, opts.gitFlags)
        if (path.isAbsolute(globStr)) {
            paths = paths.map((p) => path.join(cwd, p))
        }

        const { path: globRegex } = globrex(globStr, GLOBREX_OPTIONS)

        debug(`using regex ${globRegex.regex}`)
        debug(`starting filtering paths`)

        let filteredPaths = paths.filter((p) => globRegex.regex.test(p))

        const { ignoreGlobs = [] } = opts

        debug(`removing ignored paths`)
        const ignoreRegexes = ignoreGlobs.map((x) => {
            return globrex(x, { ...GLOBREX_OPTIONS }).path.regex
        })

        if (ignoreRegexes?.length) {
            filteredPaths = filteredPaths.filter(
                (x) => !ignoreRegexes.some((toIgnore) => toIgnore.test(x)),
            )
        }
        if (opts.absolute && !path.isAbsolute(globStr)) {
            debug(`making paths absolute`)
            // filteredPaths = filteredPaths.map((p) => resolve(p))
            filteredPaths = filteredPaths.map((p) => path.join(cwd, p))
        }
        return filteredPaths
    } catch {
        console.error(
            'could not use git to get globbed files, traversing fs tree',
        )
        return glob(globStr, opts)
    }
}

export async function gitPaths(
    cwd = '.',
    gitFlags = '--cached --others',
): Promise<string[]> {
    let { stdout } = await exec(`git ls-files ${gitFlags}`, {
        cwd: path.resolve(cwd),
        maxBuffer: 1024 * 10000,
    })
    const paths = stdout
        .toString()
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)

    return paths
}
