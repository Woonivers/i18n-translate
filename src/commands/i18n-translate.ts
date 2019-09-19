import { GluegunToolbox } from 'gluegun'
import * as qs from 'qs'
import Axios from 'axios'

// ERRORS
export const NO_PLATFORM = 'ERROR NO PARAMETER PLATFORM'
export const NO_PROJECT = 'ERROR NO PARAMETER PROJECT'
export const NO_TOKEN = 'ERROR NO PARAMETER TOKEN'
export const NO_PATH = 'ERROR NO PARAMETER PATH'

// INTERFACE
const tuple = <T extends string[]>(...args: T) => args
const platforms = tuple('poeditor')
interface Options {
  platform: typeof platforms[number]
  project: string
  token: string
  path: string
}

const poeditorApi = Axios.create({
  baseURL: 'https://api.poeditor.com/v2',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

/**
 *  add default params (project id and api token)
 * @param project
 * @param token
 * @returns poeditorApi.post.data if everything went ok
 */
const poeditorPostGenerator = (project: string, token: string) => async (
  url: string,
  data: object = {}
) => {
  const { data: responseData } = await poeditorApi.post(
    url,
    qs.stringify({
      id: `${project}`,
      api_token: `${token}`,
      ...data
    })
  )
  if ('fail' === responseData.response.status) {
    throw JSON.stringify(responseData)
  }
  return responseData
}

module.exports = {
  name: 'i18n-translate',
  run: async (toolbox: GluegunToolbox) => {
    const {
      filesystem,
      parameters,
      print,
      config: { loadConfig }
    } = toolbox

    // GET CONFIG PARAMS
    const homeDir = (finalFolder = '') =>
      filesystem.homedir() + filesystem.separator + finalFolder
    const name = 'i18n-translate'
    const myConfig = {
      // ~/.woo/.i18n-translaterc
      ...loadConfig(name, homeDir('.woo')),
      // ~/.i18n-translate/.i18n-translaterc
      ...loadConfig(name, homeDir('.' + name)),
      // ./.i18n-translaterc
      ...loadConfig(name, filesystem.cwd())
    }

    // GET CLI PARAMS
    const {
      platform = myConfig.platform || 'poeditor',
      project = myConfig.project,
      token = myConfig.token,
      path = myConfig.path
    } = parameters.options as Options

    if (!platforms.includes(platform)) return print.error(NO_PLATFORM)
    if (!project) return print.error(NO_PROJECT)
    if (!token) return print.error(NO_TOKEN)
    if (!path) return print.error(NO_PATH)

    const poeditorPost = poeditorPostGenerator(project, token)

    // GET LIST OF LANGUAGES

    const {
      result: { languages }
    } = await poeditorPost('/languages/list')

    for (const { code: language } of languages) {
      // FOR EACH LANG , GET THE EXPORT URL
      const {
        result: { url }
      } = await poeditorPost('/projects/export', {
        language,
        type: 'key_value_json'
      })
      print.info(`LANGUAGE: ${language} - ${url}`)

      // SAVE TRANSLATION FILE
      const { data } = await Axios.get(url)
      const fullPath = path + filesystem.separator + language + '.json'
      await filesystem.writeAsync(fullPath, data)
    }
    print.success('TRANSLATIONS UPDATED')
  }
}
