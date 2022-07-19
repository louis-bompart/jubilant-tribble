import { createAppAuth } from "@octokit/auth-app";
import { context } from "@actions/github";
import { Octokit } from "octokit";

(async () => {
  const authSecrets = {
    appId: process.env.GHAPP_APP_ID,
    privateKey: process.env.GHAPP_PRIVATE_KEY,
    clientId: process.env.GHAPP_CLIENT_ID,
    clientSecret: process.env.GHAPP_CLIENT_SECRET,
    installationId: process.env.GHAPP_INSTALLATION_ID,
  };

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: authSecrets,
  });
  const commentBody = `
Your development branch is now available on
https://github.com/${context.repo.owner}/${context.repo.repo}/tree/dev/${process.env.NAME}

Also, an invitation to an organization 'linked' to this branch has been sent to your email.

----

- [ ] 👈Check that box to refresh your development branch with the content of the linked organization, and click on the button below to open a PR

 [![PRStart](https://raw.githubusercontent.com/louis-bompart/jubilant-tribble/main/.github/assets/PRButton.gif)](https://github.com/${context.repo.owner}/${context.repo.repo}/pull/new/dev/dev/${process.env.NAME})

`;

  await octokit.rest.issues.createComment({
    issue_number: context.payload.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    body: commentBody,
  });
})();
