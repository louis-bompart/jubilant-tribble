import { context } from "@actions/github";
import { setOutput } from "@actions/core";

const issueDataExtractorRegexp = /###\sBranch\/Org name\s+(?<orgname>.*)\s+### Email\s+(?<email>.*)/gm;

const match = context.payload.issue.body.match(issueDataExtractorRegexp);

setOutput('email',match.groups.email);
setOutput('orgname',match.groups.orgname);