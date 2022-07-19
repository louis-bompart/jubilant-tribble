import { context } from "@actions/github";
import { setOutput } from "@actions/core";

const issueDataExtractorRegexp = /###\sBranch\/Org name\s+(?<orgname>.*)### Email\s+(?<email>.*)/gm;
console.log(Buffer.from(context.payload.issue.body, 'utf-8').toString('base64'))
const match = context.payload.issue.body.match(issueDataExtractorRegexp);

setOutput('email',match.groups.email);
setOutput('orgname',match.groups.orgname);