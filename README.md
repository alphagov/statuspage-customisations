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
6. check the code for your changes and the page(s) once they update

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
echo "$(<custom-footer.html)\n<\!-- HEAD: $(git rev-parse HEAD) -->" | pbcopy
```
