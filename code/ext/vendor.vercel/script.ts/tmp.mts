#!/usr/bin/env ts-node

// console.info(`tmp 🐷`);

import { Filesystem } from 'sys.fs.node';
import { rx } from 'sys.util';
import { Vercel } from 'vendor.vercel';

const token = process.env.VERCEL_TEST_TOKEN || ''; // Secure API token (secret).
const bus = rx.bus();
const dir = process.cwd();
const { fs } = await Filesystem.client(dir, { bus });

const vercel = Vercel.client({ bus, fs, token });
const http = Vercel.Http({ fs, token });

const teams = await http.teams.list();
console.log('teams:', teams);
