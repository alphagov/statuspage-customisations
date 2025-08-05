# Statuspage customisations

Custom code for uses of statuspage.io on projects owned by the Government Digital Service.

## Deployment

Follow these steps to update the production code of your status page.

You should have the latest `main` checked out.

1. sign into statuspage.io
2. go to 'Customize page and emails'
3. click the 'Customize HTML & CSS' button
4. get the latest version of a file in your clipboard with the bash script below
5. paste it into the textbox for that file
6. repeat step 4 for the other file
7. check the commit SHA in the comment at the bottom with the HEAD of `main`
8. check your changes in the in-page iframe work as expected
9. if all ok, click the 'Publish changes' button

### Command to copy file to clipboard

Run this script to copy the file to your clipboard, with a SHA of the latest commit appended in a
CSS comment:

#### Custom CSS

```bash
echo "$(<custom.css)\n/* HEAD: $(git rev-parse HEAD) */" | pbcopy
```

#### Custom footer HTML

For example:

```bash
echo "$(<custom-footer.html)\n<script>\n$(<custom-footer.js)\n</script>\n<\!-- HEAD: $(git rev-parse HEAD) -->" | pbcopy
```

## To test the code

### Linting

JavaScript is linted against [Standard JS](https://standardjs.com).

```bash
npm run lint
```
