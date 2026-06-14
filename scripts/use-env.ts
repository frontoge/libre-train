#!/usr/bin/env bun
/**
 * Swap the active `.env` in each workspace to a named profile.
 *
 *   bun run env:use <profile>      e.g. bun run env:use containers
 *
 * Each workspace keeps a set of `<ws>/.env.<profile>` files (e.g. `server/.env.containers`,
 * `server/.env.remote`). Running this points each `<ws>/.env` at the chosen profile via a
 * symlink, so a single command switches the whole stack between, say, the local Docker
 * containers and a remote/deployed database.
 *
 * Profile names must avoid `local`, `development`, `production`, and `test`: Bun and Vite
 * auto-load `.env.<those>` regardless of the active profile, which would silently override
 * your selection.
 */
import { existsSync, lstatSync, renameSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

const RESERVED = new Set(['local', 'development', 'production', 'test']);
const WORKSPACES = ['db', 'server', 'client'];

const profile = process.argv[2];
if (!profile) {
	console.error('Usage: bun run env:use <profile>   (e.g. containers)');
	process.exit(1);
}
if (RESERVED.has(profile)) {
	console.error(`Profile "${profile}" is reserved — Bun/Vite auto-load .env.${profile}. Pick another name.`);
	process.exit(1);
}

let failed = false;
for (const ws of WORKSPACES) {
	const profileFile = `.env.${profile}`;
	const profilePath = join(ws, profileFile);
	const envPath = join(ws, '.env');

	if (!existsSync(profilePath)) {
		console.warn(`! ${profilePath} not found — skipped`);
		failed = true;
		continue;
	}

	if (existsSync(envPath)) {
		if (lstatSync(envPath).isSymbolicLink()) {
			rmSync(envPath);
		} else {
			// Never delete a real .env — preserve it as a profile the user can switch back to.
			const savedPath = join(ws, '.env.saved');
			if (existsSync(savedPath)) {
				console.error(`! ${envPath} is a real file and ${savedPath} already exists — resolve manually, skipped`);
				failed = true;
				continue;
			}
			renameSync(envPath, savedPath);
			console.log(`  (saved existing ${ws}/.env -> ${ws}/.env.saved)`);
		}
	}

	symlinkSync(profileFile, envPath); // relative link, resolved within the workspace dir
	console.log(`✓ ${ws}/.env -> ${profileFile}`);
}

console.log(failed ? '\nDone with warnings (see above).' : `\nActive profile: ${profile}`);
process.exit(failed ? 1 : 0);
