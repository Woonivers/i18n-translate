# i18n-translate CLI

CLI tool that downloads every poeditor language translation form your project and save them in the indcated path.

## Usage

```
i18n-translate --project $PROJECT_ID --token $POEDITOR_TOKEN --path ./app/i18n
```

Project, Token and Path are required parameters

## Params

Because the environment variables doesn't work inside the package.json scripts, you can load the parametrs using config files.
These directories are

- `~/.woo/.i18n-translaterc`
- `~/.i18n-translate/.i18n-translaterc`
- `./.i18n-translaterc`

If you pass parameters through CLI, they will be overwritten.

### Example config

Valid names: `.i18n-translaterc`, `.i18n-translaterc.json`, `.i18n-translaterc.yaml`

```json
{
  "platform": "poeditor",
  "project": "103",
  "token": "013f3feba1c0b9dfbe03d0c74a7d0cc9",
  "path": "./app/i18n"
}
```

or

```yaml
---
platform: poeditor
project: '103'
token: 013f3feba1c0b9dfbe03d0c74a7d0cc9
path: './app/i18n'
```

# License

MIT - see LICENSE
