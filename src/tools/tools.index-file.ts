const { info, angry, warn, successfully } = require('../../utils/logger')
import * as _fs from 'fs'
import * as _path from 'path'
import { File } from './utils/file'

const pascalCaseReg = /([A-Z][a-z0-9]+)+/

/**
 * @returns {string}
 */
const toPascalCase = (str) => {
  const words = str.match(/[a-z]+/gi)
  if (!words) {
    return ''
  }
  return words
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    })
    .join('')
}

/**
 * @property {string} process_directory
 */
export class IndexFileGenerator extends File {
  process_directory = ''
  isNode = false

  /**
   * @param {string} process_directory
   */
  constructor(process_directory, isNode) {
    super()
    this.process_directory = process_directory
    this.isNode = isNode
  }

  /**
   * Препроцесс имени файла
   * @returns {string}
   */
  #preprocess(filePath) {
    const name = _path.parse(filePath).name
    return pascalCaseReg.test(name) ? name : toPascalCase(name)
  }

  #indexJSExists(filePath) {
    const indexjs = _path.resolve(filePath, 'index.js')
    return _fs.existsSync(indexjs)
  }

  #exportES6(name, filePath, isDirectory) {
    return isDirectory
      ? `export * from './${filePath}'`
      : `export { default as ${name} } from './${filePath}'`
  }

  #exportNode(name, filePath, isDirectory) {
    return isDirectory
      ? `// directory not supported: ${filePath}`
      : `${name}: require('./${filePath}')`
  }

  /**
   * Сгенерировать export 'линию'
   * @returns {string}
   */
  #export(name, filePath) {
    const isDirectory = _fs.statSync(filePath).isDirectory()
    if (!this.#indexJSExists(filePath) && isDirectory)
      return `// : Directory './${filePath}' have not index.js :`
    return this.isNode
      ? this.#exportNode(name, filePath, isDirectory)
      : this.#exportES6(name, filePath, isDirectory)
  }

  #readdir() {
    let files = _fs.readdirSync(this.process_directory)
    if (files.length === 0) return angry('Директория пустая')
    if (files.includes('index.js')) {
      files = files.filter((file) => file !== 'index.js')
      warn('Файл index.js будет перезаписан')
    }
    return files
  }

  generate() {
    info(`Тип export: ${this.isNode ? 'NodeJS' : 'ES6'}`)

    this.add('// : Generated by xaf-crate :').skip()
    const files = this.#readdir()

    if (this.isNode) this.add('module.exports = {')
    for (const file of files) {
      const preprocessedName = this.#preprocess(file)
      const exportRow = this.#export(preprocessedName, file)
      this.add(exportRow)
    }
    if (this.isNode) this.add('}')

    _fs.writeFileSync(
      _path.resolve(this.process_directory, 'index.js'),
      this.get(),
      { encoding: 'utf-8' }
    )

    successfully('Генерация index-file успешно завершена!')
    warn(
      'Если вы используете NodeJS, то после `tools index` добавьте параметр -node'
    )
  }
}
