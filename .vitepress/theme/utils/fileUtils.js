import fs from 'fs'
import path from 'path'

/**
 * 扫描指定文件夹下的所有 markdown 文件
 * @param {string} folderName - pages目录下要扫描的文件夹名称
 * @returns {Array<{path: string, name: string}>} 文件信息数组
 */
export function scanMarkdownFiles(folderName) {
  // 获取 .vitepress 的父级目录路径
  const baseDir = path.resolve(__dirname, '../../../..')
  // 构建要扫描的目录路径
  const targetDir = path.join(baseDir,  folderName)
  const result = []

  try {
    // 检查目录是否存在
    if (!fs.existsSync(targetDir)) {
      console.warn(`目录 ${targetDir} 不存在`)
      return result
      
    }

    // 递归扫描函数
    function scanDir(currentPath, relativePath = '') {
      const files = fs.readdirSync(currentPath)

      for (const file of files) {
        const fullPath = path.join(currentPath, file)
        const stat = fs.statSync(fullPath)
        const relativeFilePath = path.join(relativePath, file)

        if (stat.isDirectory()) {
          // 如果是目录，递归扫描
          scanDir(fullPath, relativeFilePath)
        } else if (stat.isFile() && file.endsWith('.md')) {
          // 如果是 markdown 文件
          result.push({
            // 使用相对于 pages/folderName 的路径
            path: relativeFilePath.replace(/\\/g, '/'),
            // 文件名（不含扩展名）
            name: path.basename(file, '.md')
          })
        }
      }
    }

    // 开始扫描
    scanDir(targetDir)
    return result

  } catch (error) {
    console.error('扫描文件时出错:', error)
    return result
  }
}

/**
 * 获取文件的创建时间和最后修改时间
 * @param {string} folderName - pages目录下要扫描的文件夹名称
 * @param {string} filePath - 相对于 pages/folderName 的文件路径
 * @returns {{createTime: Date, updateTime: Date} | null}
 */
export function getFileTimestamp(folderName, filePath) {
  try {
    const baseDir = path.resolve(__dirname, '../../../..')
    const fullPath = path.join(baseDir, 'pages', folderName, filePath)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const stats = fs.statSync(fullPath)
    return {
      createTime: stats.birthtime,
      updateTime: stats.mtime
    }
  } catch (error) {
    console.error('获取文件时间戳失败:', error)
    return null
  }
}

/**
 * 读取markdown文件的前置元数据
 * @param {string} folderName - pages目录下要扫描的文件夹名称
 * @param {string} filePath - 相对于 pages/folderName 的文件路径
 * @returns {Object | null} 解析后的前置元数据
 */
export function getFileFrontMatter(folderName, filePath) {
  try {
    const baseDir = path.resolve(__dirname, '../../../..')
    const fullPath = path.join(baseDir, 'pages', folderName, filePath)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const content = fs.readFileSync(fullPath, 'utf-8')
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/
    const match = content.match(frontMatterRegex)

    if (!match) {
      return null
    }

    const frontMatter = match[1]
    const metadata = {}

    // 简单的YAML解析
    frontMatter.split('\n').forEach(line => {
      const [key, ...values] = line.split(':')
      if (key && values.length) {
        metadata[key.trim()] = values.join(':').trim()
      }
    })

    return metadata
  } catch (error) {
    console.error('读取文件前置元数据失败:', error)
    return null
  }
}