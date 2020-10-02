import {
    getGlobsFromGit as getGlobsFromGitignore,
    globWithGit,
    glob,
} from '../src'
import assert from 'assert'
import snapshot from 'snap-shot-it'
import path from 'path'

it('getGlobsFromGit', async () => {
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
        path.resolve('tests/**/*.txt'),
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
        it(`glob relative paths with '${
            path.isAbsolute(str)
                ? 'abs ' + path.relative(process.cwd(), str)
                : str
        }'`, async () => {
            const paths = await globWithGit(str, {
                absolute: false,
                ignoreGlobs: ['**/node_modules/**'],
            })
            snapshot(paths)
        })
    })
})

it('globFromGit with ignore', async () => {
    const paths = await globWithGit('./tests/**/*.txt', {
        absolute: false,
        ignoreGlobs: ['**/node_modules/**', '**/dir/**'],
    })
    assert.strictEqual(paths.length, 0)
    snapshot(paths)
})
