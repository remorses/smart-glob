import { exec } from 'promisify-child-process'
import difference from 'lodash/difference'
import { promises as fs, lstatSync, Stats } from 'fs'
import { GlobOptions, glob } from './glob'
import globalyzer from 'globalyzer'
import globrex from 'globrex'
import path from 'path'
import fastGlob from 'fast-glob'
import toUnixPath from 'slash'
import { cachedDataVersionTag } from 'v8'
import { debug, GLOBREX_OPTIONS } from './support'

type GitGlobOptions = Pick<
    GlobOptions,
    'cwd' | 'absolute' | 'ignoreGlobs' | 'gitignore' | 'alwaysReturnUnixPaths'
> & {
    gitFlags?: string
}

export async function globWithGit(
    globStr: string,
    opts: GitGlobOptions = {},
): Promise<string[]> {
    try {
        if (!globStr) return []
        // opts.absolute = opts.absolute ?? true
        globStr = path.normalize(globStr)
        globStr = toUnixPath(globStr)
        let glb = globalyzer(globStr)

        if (!glb.isGlob) {
            debug(`not a glob, using normal globber`)
            return await glob(globStr, opts)
        }

        debug(`getting paths with git`)
        const cwd = path.resolve(opts.cwd || '.')
        // TODO replace slashes in windows
        let paths = await gitPaths({
            cwd,
            gitFlags: opts.gitFlags,
            gitignore: opts.gitignore,
        })
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
    } catch (e) {
        console.error(
            e,
            'could not use git to get globbed files, traversing fs tree',
        )
        return glob(globStr, { ...opts, filesOnly: true })
        const paths = await fastGlob(globStr, {
            absolute: opts.absolute,
            cwd: opts.cwd,
            globstar: true,
            onlyFiles: true,
            ignore: opts.ignoreGlobs,
            ...opts,
        })
        if (opts.alwaysReturnUnixPaths) {
            return paths.map(toUnixPath)
        }
        return paths
    }
}

// get paths with git, paths are always relative to cwd
// in windows paths use the \\ path delimiter
export async function gitPaths({
    cwd = '.',
    gitFlags = '--cached --others',
    gitignore = false,
}): Promise<string[]> {
    if (gitignore) {
        gitFlags = gitFlags + ' --exclude-standard'
    }
    cwd = path.resolve(cwd)
    const maxBuffer = 1024 * 10000000
    let { stdout, stderr } = await exec(`git ls-files ${gitFlags}`, {
        cwd,
        maxBuffer,
    })
    // console.error(stderr.toString())
    const paths = makeList(stdout.toString())
    let { stdout: toRemove } = await exec(`git ls-files --deleted`, {
        cwd,
        maxBuffer,
    })
    const pathsToRemove = makeList(toRemove.toString())

    const resultPaths = difference(paths, pathsToRemove).map(path.normalize)
    debug(resultPaths.slice(0, 5) + '...')
    return resultPaths
}

function makeList(stdout: string) {
    const paths = stdout
        .toString()
        .split(/\r?\n/)
        .map((x) => x.trim())
        .filter(Boolean)
    return paths
}
