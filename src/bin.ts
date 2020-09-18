#!/usr/bin/env node

import yargs, { parserConfiguration } from 'yargs'
import { globWithGit } from '.'

yargs.command(
    '* <glob>',
    '',
    (yargs) => {},
    async (argv) => {
        const glb = argv.glob as string
        if (!glb) {
            throw new Error('pass a glob as positional argument')
        }
        const paths = await globWithGit(glb)
        console.info(paths.join('\n'))
        console.info(paths.length + ' files')
    },
).argv
