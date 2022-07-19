//###\sBranch\/Org name\\n\\n(?<orgname>.*)### Email\\n\\n(?<email>.*)
import { context } from "@actions/github";


(async () => {
  console.log(JSON.stringify(context))
})();
