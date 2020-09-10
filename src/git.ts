import { exec } from 'promisify-child-process'
import { promises as fs, lstatSync, Stats } from 'fs'
import { GlobOptions, glob } from './glob'
import globalyzer from 'globalyzer'
import { resolve } from 'path'
import globrex from 'globrex'
import path from 'path'

export async function globWithGit(
    str: string,
    opts: Pick<GlobOptions, 'cwd' | 'absolute'> = {},
): Promise<string[]> {
    if (!str) return []
    str = path.normalize(str)
    let glb = globalyzer(str)

    if (!glb.isGlob) {
        return await glob(str, opts)
    }

    const paths = await gitPaths(resolve(opts.cwd || '.'))

    const { path: globRegex } = globrex(str, {
        filepath: true,
        globstar: true,
        extended: true,
    })

    
    let filteredPaths = paths.filter((p) => globRegex.regex.test(p))

    if (opts.absolute) {
        return filteredPaths.map((p) => resolve(p))
    }

    return filteredPaths
}

export async function gitPaths(cwd = '.'): Promise<string[]> {
    let { stdout } = await exec(`git ls-files ${cwd}`, {
        maxBuffer: 1024 * 10000,
    })
    const paths = stdout
        .toString()
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)

    return paths
}
