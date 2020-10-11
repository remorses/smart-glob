import { exec } from 'promisify-child-process'
import difference from 'lodash/difference'
import { promises as fs, lstatSync, Stats } from 'fs'
import { GlobOptions, glob, globSync } from './glob'
import globalyzer from 'globalyzer'
import globrex from 'globrex'
import path from 'path'
// import fastGlob from 'fast-glob'
import toUnixPath from 'slash'
import { cachedDataVersionTag } from 'v8'
import { debug, GLOBREX_OPTIONS } from './support'
import { execSync } from 'child_process'

type GitGlobOptions = Pick<
    GlobOptions,
    'cwd' | 'absolute' | 'ignoreGlobs' | 'gitignore' | 'alwaysReturnUnixPaths'
> & {
    gitFlags?: string
}

function normalizeGlobStr(globStr: string) {
    globStr = path.normalize(globStr)
    globStr = toUnixPath(globStr)
    return globStr
}

function filterPathsByGlob(
    paths: string[],
    globStr: string,
    opts: GitGlobOptions,
) {
    const cwd = path.resolve(opts.cwd || '.')

    if (path.isAbsolute(globStr)) {
        paths = paths.map((p) => path.join(cwd, p))
    }

    globStr = toUnixPath(globStr)
    debug({ globStr })
    const {
        path: { regex: globRegex },
    } = globrex(globStr, GLOBREX_OPTIONS)

    debug(`using regex ${globRegex}`)
    debug(`starting filtering paths`)

    let filteredPaths = paths.filter((p) => globRegex.test(p))

    const { ignoreGlobs = [] } = opts

    debug(`removing ignored paths`)
    const ignoreRegexes = ignoreGlobs.map((x) => {
        x = toUnixPath(x)
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
    if (!opts.absolute && path.isAbsolute(globStr)) {
        debug(`making paths relative`)
        // filteredPaths = filteredPaths.map((p) => resolve(p))
        filteredPaths = filteredPaths.map((p) => path.relative(cwd, p))
    }
    if (opts.alwaysReturnUnixPaths) {
        return filteredPaths.map(toUnixPath)
    }

    return filteredPaths
}

export async function globWithGit(
    globStr: string,
    opts: GitGlobOptions = {},
): Promise<string[]> {
    try {
        if (!globStr) return []
        globStr = normalizeGlobStr(globStr)
        debug(`getting paths with git`)
        const cwd = path.resolve(opts.cwd || '.')
        let paths = await gitPaths({
            cwd,
            gitFlags: opts.gitFlags,
            gitignore: opts.gitignore,
        })
        return filterPathsByGlob(paths, globStr, opts)
    } catch (e) {
        console.error(
            e,
            'could not use git to get globbed files, traversing fs tree',
        )
        return glob(globStr, { ...opts })
    }
}

export function globWithGitSync(
    globStr: string,
    opts: GitGlobOptions = {},
): string[] {
    try {
        if (!globStr) return []
        globStr = normalizeGlobStr(globStr)
        debug(`getting paths with git`)
        const cwd = path.resolve(opts.cwd || '.')
        let paths = gitPathsSync({
            cwd,
            gitFlags: opts.gitFlags,
            gitignore: opts.gitignore,
        })
        return filterPathsByGlob(paths, globStr, opts)
    } catch (e) {
        console.error(
            e,
            `could not use git to search files with glob ${globStr}, traversing fs tree`,
        )
        return globSync(globStr, { ...opts })
    }
}

// get paths with git, paths are always relative to cwd
// in windows paths use the \\ path delimiter
export async function gitPaths({
    cwd = '.',
    gitFlags,
    gitignore = false,
}): Promise<string[]> {
    cwd = path.resolve(cwd)
    const maxBuffer = 1024 * 10000000
    const gitCommand = getGitCommand({ gitignore, gitFlags })
    let [{ stdout }, { stdout: toRemove }] = await Promise.all([
        exec(gitCommand, {
            cwd,
            maxBuffer,
        }),
        exec(`git ls-files --deleted`, {
            cwd,
            maxBuffer,
        }),
    ])
    // console.error(stderr.toString())
    const paths = makeList(stdout.toString())
    const pathsToRemove = makeList(toRemove.toString())
    const resultPaths = difference(paths, pathsToRemove).map(path.normalize)
    debug(resultPaths.slice(0, 5) + '...')
    return resultPaths
}
export function gitPathsSync({
    cwd = '.',
    gitFlags,
    gitignore = false,
}): string[] {
    cwd = path.resolve(cwd)
    const maxBuffer = 1024 * 10000000
    const gitCommand = getGitCommand({ gitignore, gitFlags })
    let [stdout, toRemove] = [
        execSync(gitCommand, {
            cwd,
            maxBuffer,
        }),
        execSync(`git ls-files --deleted`, {
            cwd,
            maxBuffer,
        }),
    ]
    // console.error(stderr.toString())
    const paths = makeList(stdout.toString())
    const pathsToRemove = makeList(toRemove.toString())
    const resultPaths = difference(paths, pathsToRemove).map(path.normalize)
    debug(resultPaths.slice(0, 5) + '...')
    return resultPaths
}

function getGitCommand({ gitFlags = '--cached --others', gitignore }) {
    if (gitignore) {
        gitFlags = gitFlags + ' --exclude-standard'
    }
    return `git ls-files ${gitFlags}`
}

function makeList(stdout: string) {
    const paths = stdout
        .toString()
        .split(/\r?\n/)
        .map((x) => x.trim())
        .filter(Boolean)
    return paths
}
