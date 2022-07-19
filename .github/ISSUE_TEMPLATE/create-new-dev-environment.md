name: Create new dev environment
about: Use this form to create a new dev branch and new org
title: "[Dev Branch] <title>"
labels: org-request
assignees: ''
body:
- type: input
  attributes:
    label: Branch/Org name
    description: What name your dev organization & branch do you want?
    placeholder: Example: my dev branch
  validations:
    required: true
- type: input
  attributes:
    label: Email
    description: What's your email (we need it to invite you to the org) ?
    placeholder: Example: foo@acme.bar
  validations:
    required: true