import { createWriteStream, WriteStream } from 'fs';
import { join, resolve } from 'path';

import { mkdirSync } from 'fs-extra';

export class FileLogger {
  public stdout: WriteStream;
  public stderr: WriteStream;
  public constructor(name: string) {
    const dir = resolve(__dirname, '..', 'artifacts/logs', name);;
    mkdirSync(dir, { recursive: true });
    this.stdout = createWriteStream(join(dir, 'stdout'));
    this.stderr = createWriteStream(join(dir, 'stderr'));
  }
}
