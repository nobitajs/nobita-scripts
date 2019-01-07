#!/usr/bin/env node

const program = require('commander')

program.version('1.0.0')
	.command('local', '本地开发')
	.parse(process.argv)
