import { launch as launchChrome } from 'chrome-launcher';
import { captureScreenshots, connectToChromeBrowser } from './utils/browser';
import { loginWithOffice } from './utils/login';
import waitOn from 'wait-on';

export const CLI_CONFIG_JSON_CI_KEY = 'cliConfigJson';
export async function authenticateCli() {
    let browser;
    let chrome;
    try {
        console.log('Starting Chrome');
        chrome = await launchChrome({
            port: 9222,
            userDataDir: false,
            connectionPollInterval: 1e3,
            maxConnectionRetries: 60,
            logLevel: 'verbose',
        });
        console.log('Chrome started');
        console.log('Checking port 9222');
        await waitOn({ resources: ['tcp:9222'] });
        console.log('Port 9222 is open');
        console.log('Connecting to Chrome');
        browser = await connectToChromeBrowser();
        console.log('Connected to Chrome');
        await loginWithOffice(browser);
    } catch (e) {
        if (browser) {
            await captureScreenshots(browser, 'jestSetup');
        }
        throw e;
    } finally {
        await chrome?.kill();
    }
}

authenticateCli();