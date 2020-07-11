import { getGlobsFromGit } from '../src/glob'
import assert from 'assert'

it('getGlobsFromGit', async () => {
    const data = `
    file1/
    file2/xxx
    # file2/xxx
    file3

    xxx
    `
    const files = await getGlobsFromGit(data)
    console.log(files)
    assert(
        JSON.stringify(files) ===
            JSON.stringify(['file1', 'file2/xxx', 'file3', 'xxx']),
    )
})
