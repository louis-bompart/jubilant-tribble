import 'isomorphic-fetch';
import 'abortcontroller-polyfill';

import { readJSONSync } from "fs-extra";
import PlatformClient from "@coveord/platform-client";
import { getConfigFilePath } from "./utils/cli";
(async () => {
    const { environment, accessToken, organization: organizationId } = readJSONSync(getConfigFilePath())

    const platformClient = new PlatformClient({
        environment,
        organizationId,
        accessToken,
    });
    const adminGroup = (await platformClient.group.list()).find(group => group.displayName = "Administrators")
    await platformClient.group.invite.add(adminGroup.id, { email: process.env.EMAIL })
})()
