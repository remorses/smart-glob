import { getGlobsFromGitignore, globWithGit, glob } from '../src'
import assert from 'assert'
import snapshot from 'snap-shot-it'
import path from 'path'
import toUnixPath from 'slash'

it('getGlobsFromGitignore', async () => {
    const data = `
    file1/
    file2/xxx
    # file2/xxx
    file3

    xxx
    `
    const files = await getGlobsFromGitignore(data)
    console.log(files)
    assert(
        JSON.stringify(files) ===
            JSON.stringify(['file1', 'file2/xxx', 'file3', 'xxx']),
    )
})

describe('globFromGit', () => {
    const globs = [
        './tests/**/*.txt',
        '**/*.txt',
        'tests/**/*.txt',
        toUnixPath(path.resolve('tests/**/*.txt')),
    ]
    // globs.forEach((str) => {
    //     it(`glob with '${str}'`, async () => {
    //         const paths = await globWithGit(str, {
    //             ignoreGlobs: ['**/node_modules/**'],
    //         })
    //         snapshot(paths)
    //     })
    // })
    globs.forEach((str) => {
        it(`glob relative paths with '${toUnixPath(
            path.isAbsolute(str)
                ? 'abs ' + path.relative(process.cwd(), str)
                : str,
        )}'`, async () => {
            const paths = await globWithGit(str, {
                absolute: false,
                alwaysReturnUnixPaths: true,
                ignoreGlobs: ['**/node_modules/**'],
            })
            snapshot(paths)
        })
    })
})

describe('glob normal', () => {
    const globs = [
        './tests/**/*.txt',
        '**/*.txt',
        'tests/**/*.txt',
        toUnixPath(path.resolve('tests/**/*.txt')),
    ]
    globs.forEach((str) => {
        it(`glob relative paths with '${toUnixPath(
            path.isAbsolute(str)
                ? 'abs ' + path.relative(process.cwd(), str)
                : str,
        )}'`, async () => {
            const paths = await glob(str, {
                absolute: false,
                alwaysReturnUnixPaths: true,
                ignoreGlobs: ['**/node_modules/**'],
            })
            snapshot(paths)
        })
    })
})

it('globFromGit with ignore', async () => {
    const paths = await globWithGit('./tests/**/*.txt', {
        absolute: false,
        alwaysReturnUnixPaths: true,
        ignoreGlobs: ['**/node_modules/**', '**/dir/**'],
    })
    assert.strictEqual(paths.length, 0)
    snapshot(paths)
})

it('globFromGit with gitignore', async () => {
    const paths = await globWithGit('**/node_modules/**', {
        absolute: false,
        gitignore: true,
        alwaysReturnUnixPaths: true,
    })
    assert.strictEqual(paths.length, 0)
    snapshot(paths)
})
