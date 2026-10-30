import { test } from 'vitest';
import * as G from '../base44/shared/possessedEngine.ts';
import * as C from '../base44/shared/possessedConfig.ts';
import tests from './possessedEngine.test.js';

const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
for (const [name, fn] of tests(G, C, assert)) test(name, fn);