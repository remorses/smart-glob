import fastGlob from 'fast-glob'
import globby from 'globby'
import globber from 'glob'
import tinyGlob from 'tiny-glob'
import { glob as myGlob, memoizedGlob } from '../src/glob'
import path from 'path'
import assert from 'assert'
import { globWithGit } from '../src'

const glob = './**'
console.log(path.resolve(glob))

const benchmark = (name: string, f) => async () => {
    console.time(name)
    const res = await f()
    console.timeEnd(name)
    return res
}

describe('benchmarks', () => {
    process.env.DEBUG = ''
    it(
        'tiny-glob',
        benchmark('tiny-glob', async () => {
            const files = await tinyGlob(glob, {
                filesOnly: true,
                // ignore: ['node_modules'],
            })
            // console.log(files)
            // console.log(files)
        }),
    )
    it(
        'fast-glob',
        benchmark('fast-glob', () => {
            const files = fastGlob.sync([glob], {
                onlyFiles: true,
                ignore: ['node_modules'],
            })
            // console.log(files)
        }),
    )
    it(
        'globby',
        benchmark('globby', () => {
            const files = globby.sync([glob], {
                onlyFiles: true,
                gitignore: true,
                ignore: ['node_modules'],
            })
            // console.log(files)
        }),
    )

    it(
        'glob',
        benchmark('glob', async () => {
            const files = globber.sync(glob, {
                nodir: true,
                ignore: ['node_modules'],
            })
            // console.log(files)
        }),
    )
    it(
        'smart-glob',
        benchmark('smart-glob', async () => {
            const files = await myGlob(glob, {
                filesOnly: true,
                gitignore: true,
                ignore: ['node_modules'],
            })
            // console.log(files)
        }),
    )
    it(
        'smart-glob using git',
        benchmark('smart-glob using git', async () => {
            const files = await globWithGit(glob, {
                ignoreGlobs: ['**/node_modules/**'],
            })
            // console.log(files)
        }),
    )
})

describe('smart-glob', () => {
    it('second run is faster', async () => {
        const files1 = await benchmark('1', () => memoizedGlob('**'))()
        const files2 = await benchmark('1', () => memoizedGlob('**'))()
        assert.equal(files1.length, files2.length)
    })
})
