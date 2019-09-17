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

const poeditor_api = Axios.create({
  baseURL: 'https://api.poeditor.com/v2',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

/**
 *
 * @param project
 * @param token
 * @returns poeditor_api.post with default params (project id and api token)
 */
const poeditor_post_generator = (project: string, token: string) => (
  url: string,
  data: object = {}
) =>
  poeditor_api.post(
    url,
    qs.stringify({
      id: `${project}`,
      api_token: `${token}`,
      ...data
    })
  )

module.exports = {
  name: 'i18n-translate',
  run: async (toolbox: GluegunToolbox) => {
    const { filesystem, parameters, print } = toolbox

    // GET CLI PARAMS
    const {
      platform = 'poeditor',
      project,
      token,
      path
    } = parameters.options as Options

    if (!platforms.includes(platform)) return print.error(NO_PLATFORM)
    if (!project) return print.error(NO_PROJECT)
    if (!token) return print.error(NO_TOKEN)
    if (!path) return print.error(NO_PATH)

    const poeditor_post = poeditor_post_generator(project, token)

    // GET LIST OF LANGUAGES
    const {
      data: {
        result: { languages }
      }
    } = await poeditor_post('/languages/list')

    for (const { code: language } of languages) {
      // FOR EACH LANG , GET THE EXPORT URL
      const {
        data: {
          result: { url }
        }
      } = await poeditor_post('/projects/export', {
        language,
        type: 'key_value_json'
      })
      print.info(`LANGUAGE: ${language} - ${url}`)

      // SAVE TRANSLATION FILE
      const { data } = await Axios.get(url)
      const fullPath = path + filesystem.separator + language + '.json'
      filesystem.writeAsync(fullPath, data)
    }
    print.success('TRANSLATIONS UPDATED')
  }
}
