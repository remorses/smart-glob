import { getGlobsFromGit as getGlobsFromGitignore, globWithGit, glob } from '../src'
import assert from 'assert'

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
it('globFromGit', async () => {
    const paths = await globWithGit('./tests/**.ts', {
        absolute: true,
        ignoreGlobs: ['**/dir'],
    })
    console.log(paths)
})
it('normal glob', async () => {
    const paths = await glob('./tests/**.ts', {
        absolute: true,
        ignoreGlobs: ['**/dir'],
    })
    console.log(paths)
})
