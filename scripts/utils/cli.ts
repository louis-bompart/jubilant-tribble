import type { ChildProcessWithoutNullStreams } from 'child_process';
import { resolve } from 'path';
import { homedir } from 'os';

export const isGenericYesNoPrompt = /\(y\/n\)[\s:]*$/i;

export function answerPrompt(answer: string) {
    return (proc: ChildProcessWithoutNullStreams) =>
        new Promise<void>((resolve) => {
            if (!proc.stdin.write(answer)) {
                proc.stdin.once('drain', () => resolve());
            } else {
                process.nextTick(() => resolve());
            }
        });
}

export function getConfigFilePath() {
    const configsDir = process.platform === 'win32' ? 'AppData/Local' : '.config';
    return resolve(homedir(), configsDir, '@coveo', 'cli', 'config.json');
}
