import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
export async function get(url) {
  const cli = process.env.BLOG_TEST_VERCEL_CLI;
  if (!cli) return fetch(url);
  const parsed = new URL(url);
  const { stdout } = await exec(process.execPath, [cli, 'curl', parsed.pathname + parsed.search,
    '--deployment', parsed.origin, '--scope', 'team_YVsvfN26v20KE8CYHGQscf7B',
    '--', '--silent', '--include'], { maxBuffer: 10 * 1024 * 1024 });
  const split = stdout.indexOf('\r\n\r\n');
  if (split < 0) throw Error('Missing HTTP headers');
  const header = stdout.slice(0, split).split('\r\n');
  const status = Number(header.shift().split(' ')[1]);
  const headers = new Headers(header.filter(line => line.includes(':')).map(line => {
    const i = line.indexOf(':'); return [line.slice(0, i), line.slice(i + 1).trim()];
  }));
  return new Response(stdout.slice(split + 4), { status, headers });
}
