export function printJson(data: unknown): void {
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`)
}

export function printMessage(message: string): void {
  process.stdout.write(`${message}\n`)
}
