export function isServer() {
  return process.argv[2] === 'start';
}
