import retry from 'async-retry';
import type { Browser, Page, Target } from 'puppeteer';
import { answerPrompt, getConfigFilePath, isGenericYesNoPrompt } from './cli';
import LoginSelectors from './loginSelectors';
import { strictEqual } from 'assert';
import { readJSON, existsSync } from 'fs-extra';
import { Terminal } from './terminal/terminal';

const PLATFORM_HOST= () => `https://platform${process.env.COVEO_PLATFORM_ENV}.cloud.coveo.com`

function isLoginPage(page: Page) {
    const loginUrl = new URL('/login', PLATFORM_HOST());
    return page.url() === loginUrl.href;
}

export async function isLoggedin() {
    if (!existsSync(getConfigFilePath())) {
        return false;
    }
    const cfg = await readJSON(getConfigFilePath());
    return Boolean(cfg.accessToken);
}

async function getLoginPage(browser: Browser) {
    const page = (await browser.pages()).find(isLoginPage);
    if (page) {
        return page;
    }
    return new Promise<Page>((resolve) => {
        browser.on('targetchanged', async (target: Target) => {
            const page = await target.page();
            if (page && isLoginPage(page)) {
                resolve(page);
            }
        });
    });
}

async function staySignedIn(page: Page) {
    await page.waitForSelector(LoginSelectors.SubmitInput, {
        visible: true,
    });
    await Promise.all([
        page.click(LoginSelectors.SubmitInput),
        page.waitForNavigation(),
    ]);
}

async function possiblyAcceptCustomerAgreement(page: Page) {
    const customerAgreementUrl = new URL('/eula', PLATFORM_HOST());
    if (page.url().startsWith(customerAgreementUrl.href)) {
        await page.waitForSelector(LoginSelectors.coveoCheckboxButton, {
            visible: true,
        });
        await page.click(LoginSelectors.coveoCheckboxButton);
        await page.waitForTimeout(200); // wait for the button to be enabled
        await page.waitForSelector(LoginSelectors.submitButton, {
            visible: true,
        });
        await page.click(LoginSelectors.submitButton);
    }
}

export function runLoginCommand(env: string) {
    const args: string[] = [
        require.resolve('@coveo/cli/bin/run'),
        'auth:login',
        `-e=${env}`,
    ];
    const loginTerminal = new Terminal(
        'node',
        args,
        undefined,
        global.processManager!,
        'initial-login'
    );
    console.log('')
    loginTerminal
        .when(isGenericYesNoPrompt)
        .on('stderr')
        .do(answerPrompt('n'))
        .once();

    return loginTerminal;
}

async function startLoginFlow(browser: Browser) {
    const username = process.env.COVEO_MACHINE_USERNAME;
    const password = process.env.COVEO_MACHINE_PASSWORD;

    if (!username || !password) {
        throw new Error('Missing login credentials');
    }

    const page = await getLoginPage(browser);

    await page.waitForSelector(LoginSelectors.loginWithOfficeButton, {
        visible: true,
    });

    await Promise.all([
        page.click(LoginSelectors.loginWithOfficeButton),
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.waitForSelector(LoginSelectors.emailView),
    ]);

    await page.waitForSelector(LoginSelectors.emailInput, {
        visible: true,
    });
    await page.type(LoginSelectors.emailInput, username);
    await page.waitForSelector(LoginSelectors.SubmitInput, {
        visible: true,
    });
    await Promise.all([
        page.click(LoginSelectors.SubmitInput),
        page.waitForSelector(LoginSelectors.passwordView),
    ]);

    await page.waitForSelector(LoginSelectors.passwordInput, {
        visible: true,
    });
    await page.type(LoginSelectors.passwordInput, password);
    await page.waitForSelector(LoginSelectors.SubmitInput, {
        visible: true,
    });
    await Promise.all([
        page.click(`${LoginSelectors.passwordView} ${LoginSelectors.SubmitInput}`),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 2 * 60e3 }),
    ]);

    await staySignedIn(page);

    await possiblyAcceptCustomerAgreement(page);

    await retry(async () => strictEqual(await isLoggedin(), true));

    if ((await browser.pages()).length < 2) {
        await browser.newPage();
    }

    await page.close();
}

export async function loginWithOffice(browser: Browser) {
    const { COVEO_PLATFORM_ENV: env } = process.env;
    if (!env) {
        throw new Error('Missing platform environment');
    }
    if (await isLoggedin()) {
        console.log('Already logged in')
        return;
    }

    const loginProcess = runLoginCommand(env);

    await startLoginFlow(browser);
    return loginProcess;
}