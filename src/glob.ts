import fs, { lstatSync, Stats } from 'fs'
import toUnixPath from 'slash'
import globrex from 'globrex'
import globalyzer from 'globalyzer'
import memoize from 'memoizee'
import { join, resolve, relative, basename, normalize } from 'path'
import path from 'path'
import uniq from 'lodash/uniq'
import { GLOBREX_OPTIONS } from './support'
const isHidden = /(^|[\\\/])\.[^\\\/\.]/g

let CACHE = {}

async function walk(
    output,
    prefix,
    lexer,
    opts,
    dirname = '',
    level = 0,
    ignore = [],
    globsIgnore = [],
) {
    const rgx = lexer.segments[level]
    const dir = resolve(opts.cwd, prefix, dirname)
    const files = await fs.promises.readdir(dir)
    const { dot, includeDirs } = opts

    const filesOnly = !includeDirs

    let i = 0,
        len = files.length,
        file
    let fullpath, relpath, stats: Stats, isMatch

    for (; i < len; i++) {
        fullpath = join(dir, (file = files[i]))
        relpath = dirname ? join(dirname, file) : file
        if (!dot && isHidden.test(relpath)) continue
        isMatch = lexer.regex.test(relpath)

        if ((stats = CACHE[relpath]) === void 0) {
            CACHE[relpath] = stats = lstatSync(fullpath)
        }

        if (!stats.isDirectory()) {
            isMatch && output.push(relative(opts.cwd, fullpath))
            continue
        }
        // console.log(basename(relpath))
        if (ignore && ignore.includes(basename(relpath))) {
            continue
        }
        if (
            globsIgnore?.length &&
            globsIgnore.some((toIgnore) => toIgnore.test(relpath))
        ) {
            continue
        }

        if (rgx && !rgx.test(file)) continue
        !filesOnly && isMatch && output.push(join(prefix, relpath))

        await walk(
            output,
            prefix,
            lexer,
            opts,
            relpath,
            rgx && rgx.toString() !== lexer.globstar && level + 1,
            ignore,
            globsIgnore,
        )
    }
}

function walkSync(
    output,
    prefix,
    lexer,
    opts,
    dirname = '',
    level = 0,
    ignore = [],
    globsIgnore = [],
) {
    const rgx = lexer.segments[level]
    const dir = resolve(opts.cwd, prefix, dirname)
    const files = fs.readdirSync(dir)
    const { dot, includeDirs } = opts

    let i = 0,
        len = files.length,
        file
    let fullpath, relpath, stats: Stats, isMatch

    for (; i < len; i++) {
        fullpath = join(dir, (file = files[i]))
        relpath = dirname ? join(dirname, file) : file
        if (!dot && isHidden.test(relpath)) continue
        isMatch = lexer.regex.test(relpath)

        if ((stats = CACHE[relpath]) === void 0) {
            CACHE[relpath] = stats = lstatSync(fullpath)
        }

        if (!stats.isDirectory()) {
            isMatch && output.push(relative(opts.cwd, fullpath))
            continue
        }
        // console.log(basename(relpath))
        if (ignore && ignore.includes(basename(relpath))) {
            continue
        }
        if (
            globsIgnore?.length &&
            globsIgnore.some((toIgnore) => toIgnore.test(relpath))
        ) {
            continue
        }

        if (rgx && !rgx.test(file)) continue
        includeDirs && isMatch && output.push(join(prefix, relpath))

        walkSync(
            output,
            prefix,
            lexer,
            opts,
            relpath,
            rgx && rgx.toString() !== lexer.globstar && level + 1,
            ignore,
            globsIgnore,
        )
    }
}

export type GlobOptions = {
    cwd?: string
    dot?: boolean
    // convert output paths to absolute paths
    absolute?: boolean
    includeDirs?: boolean
    flush?: boolean
    // ignore patterns in .gitignore
    gitignore?: boolean
    alwaysReturnUnixPaths?: boolean
    ignore?: string[]
    // ignore additional patters
    ignoreGlobs?: string[]
}

/**
 * Find files using bash-like globbing.
 * All paths are normalized compared to node-glob.
 * @param {String} str Glob string
 * @param {String} [options.cwd='.'] Current working directory
 * @param {Boolean} [options.dot=false] Include dotfile matches
 * @param {Boolean} [options.absolute=false] Return absolute paths
 * @param {Boolean} [options.filesOnly=true] Do not include folders if true
 * @param {Boolean} [options.flush=false] Reset cache object
 * @returns {Array} array containing matching files
 */

export async function glob(
    str: string,
    opts: GlobOptions = {},
): Promise<string[]> {
    if (!str) return []

    str = normalize(str)
    str = toUnixPath(str)
    let glob = globalyzer(str)

    let { ignore = [], gitignore } = opts
    if (gitignore) {
        ignore = [...ignore, ...getGlobsFromGitignore()]
    }
    ignore = uniq(ignore)

    opts.cwd = opts.cwd || '.'

    if (!glob.isGlob) {
        try {
            let resolved = resolve(opts.cwd, str)
            let dirent = fs.statSync(resolved)
            if (!opts.includeDirs && !dirent.isFile()) return []

            return opts.absolute ? [resolved] : [str]
        } catch (err) {
            if (err.code != 'ENOENT') throw err

            return []
        }
    }

    if (opts.flush) CACHE = {}

    let matches = []
    const { path: globrexPath } = globrex(glob.glob, {
        ...GLOBREX_OPTIONS,
    })
    // @ts-ignore
    globrexPath.globstar = globrexPath.globstar.toString()

    const { ignoreGlobs = [] } = opts
    const globsIgnore = ignoreGlobs.map((x) => {
        return globrex(x, {
            ...GLOBREX_OPTIONS,
        }).path.regex
    })

    await walk(
        matches,
        glob.base,
        globrexPath,
        opts,
        '.',
        0,
        ignore,
        globsIgnore,
    )

    if (opts.absolute) {
        matches = matches.map((x) => path.join(opts.cwd, x))
    }
    if (opts.alwaysReturnUnixPaths) {
        matches = matches.map(toUnixPath)
    }
    return matches
}

export function globSync(str: string, opts: GlobOptions = {}): string[] {
    if (!str) return []

    str = normalize(str)
    str = toUnixPath(str)
    let glob = globalyzer(str)

    let { ignore = [], gitignore } = opts
    if (gitignore) {
        ignore = [...ignore, ...getGlobsFromGitignore()]
    }
    ignore = uniq(ignore)

    opts.cwd = opts.cwd || '.'

    if (!glob.isGlob) {
        try {
            let resolved = resolve(opts.cwd, str)
            let dirent = fs.statSync(resolved)
            if (!opts.includeDirs && !dirent.isFile()) return []

            return opts.absolute ? [resolved] : [str]
        } catch (err) {
            if (err.code != 'ENOENT') throw err

            return []
        }
    }

    if (opts.flush) CACHE = {}

    let matches = []
    const { path: globrexPath } = globrex(glob.glob, {
        ...GLOBREX_OPTIONS,
    })
    // @ts-ignore
    globrexPath.globstar = globrexPath.globstar.toString()

    const { ignoreGlobs = [] } = opts
    const globsIgnore = ignoreGlobs.map((x) => {
        return globrex(x, {
            ...GLOBREX_OPTIONS,
        }).path.regex
    })

    walkSync(matches, glob.base, globrexPath, opts, '.', 0, ignore, globsIgnore)

    if (opts.absolute) {
        matches = matches.map((x) => path.join(opts.cwd, x))
    }
    if (opts.alwaysReturnUnixPaths) {
        matches = matches.map(toUnixPath)
    }
    return matches
}

export const memoizedGlob = memoize(glob, {
    promise: true,
    normalizer: (args) => {
        // args is arguments object as accessible in memoized function
        return args[0] + JSON.stringify(args[1])
    },
})

export const getGlobsFromGitignore = (data = '') => {
    try {
        data = data || fs.readFileSync('.gitignore', { encoding: 'utf8' })
        return data
            .split(/\r?\n/)
            .filter((line) => !/^\s*$/.test(line) && !/^\s*#/.test(line))
            .map((line) => line.trim().replace(/^\/+|\/+$/g, ''))
    } catch (_a) {
        return []
    }
}
