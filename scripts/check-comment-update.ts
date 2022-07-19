import { setOutput } from "@actions/core";
import { context } from "@actions/github";
import assert from "assert";

assert.equal(context.payload.actor, context.payload.issue.user.login);
assert.equal(context.payload.comment.user.login, "thetruebaguette[bot]");
const before = context.payload.changes.body.from.split("[ ]");
const after = context.payload.comment.body.split("[x]");
assert.equal(before[0], after[0]);
assert.equal(before[1], after[1]);
const branchname = /https\:\/\/github.com\/.*\/.*\/tree\/(?<branchname> .*)\s/.exec(context.payload.comment.body).groups.branchname
setOutput('branchname',branchname);

