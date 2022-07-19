//###\sBranch\/Org name\\n\\n(?<orgname>.*)### Email\\n\\n(?<email>.*)
import { getOctokit, context } from "@actions/github";

(async () => {
  const octokit = getOctokit(process.env.GITHUB_TOKEN);
  // if not allowed will throw, yolo.s
  await octokit.rest.repos.checkCollaborator({
    owner: "louis-bompart",
    repo: "jubilant-tribble",
    username: context.actor,
  });
})();
