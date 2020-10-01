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
it('globFromGit with ./tests/**.txt', async () => {
    const paths = await globWithGit('./tests/**.txt', {
        absolute: true,
        ignoreGlobs: ['**/node_modules/**'],
    })
    snapshot(paths)
})
it('globFromGit with ignore', async () => {
    const paths = await globWithGit('./tests/**.txt', {
        absolute: true,
        ignoreGlobs: ['**/node_modules/**', '**/dir/**'],
    })
    assert.strictEqual(paths.length, 0)
    snapshot(paths)
})

it('globFromGit using **.txt', async () => {
    const paths = await globWithGit('**.txt', {
        ignoreGlobs: ['**/node_modules/**'],
    })
    snapshot(paths)
})

it('globFromGit using ./**.txt', async () => {
    const paths = await globWithGit('./**.txt', {
        ignoreGlobs: ['**/node_modules/**'],
    })
    snapshot(paths)
})

it('globFromGit absolute base in glob', async () => {
    const paths = await globWithGit(path.resolve('./tests/**.ts'), {
        absolute: true,
        ignoreGlobs: ['**/node_modules/**', '**/dir/**'],
    })
    assert.ok(paths.length)
    snapshot(paths)
})

it('normal glob', async () => {
    const paths = await glob('./tests/**.ts', {
        absolute: true,
        ignoreGlobs: ['**/node_modules/**'],
    })
    snapshot(paths)
})
