import fs from 'fs'
import path from 'path'

import { warn } from '~/utils/logger'
import { AbstractLayer } from '../interfaces/interface.config'

export function find<E>(
  search_directory: string,
  config_name: string
): AbstractLayer<E>[] {
  const templates: AbstractLayer<E>[] = []
  const directories = fs.readdirSync(search_directory)

  for (const directory of directories) {
    const search_path = path.resolve(search_directory, directory)
    const search_path_config = path.resolve(search_path, config_name)
    if (!fs.existsSync(search_path_config)) {
      warn(
        `Директория '${directory}' не имеет конфигурации. Создайте конфигурацию, чтоб unit был активен`
      )
      continue
    }

    const unit_config: E = require(search_path_config)
    templates.push({ config: unit_config, path: search_path })
  }
  return templates
}
