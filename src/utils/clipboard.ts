import Clipboard from 'clipboard'
import { decrypt } from '@/utils/crypto'

/**
 * 复制文本到剪贴板
 * @param text 文本内容
 */
export const copyText = (text: string) => {
  return new Promise((resolve, reject) => {
    const fakeElement = document.createElement('button')
    const clipboard = new Clipboard(fakeElement, {
      text: () => text,
      action: () => 'copy',
      container: document.body,
    })
    clipboard.on('success', e => {
      clipboard.destroy()
      resolve(e)
    })
    clipboard.on('error', e => {
      clipboard.destroy()
      reject(e)
    })
    document.body.appendChild(fakeElement)
    fakeElement.click()
    document.body.removeChild(fakeElement)
  })
}

// 读取剪贴板
export const readClipboard = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard?.readText) {
      navigator.clipboard.readText().then(text => {
        if (!text) reject('Clipboard is empty or contains no text')
        return resolve(text)
      })
    }
    else reject('The browser does not support or prohibits access to the clipboard, please use the shortcut key Ctrl + V')
  })
}

// 解析加密后的剪贴板内容
export const pasteCustomClipboardString = (text: string) => {
  let clipboardData
  try {
    clipboardData = JSON.parse(decrypt(text))
  }
  catch {
    clipboardData = text
  }

  return clipboardData
}

// 尝试解析剪贴板内容是否为Excel表格（或类似的）数据格式
export const pasteExcelClipboardString = (text: string): string[][] | null => {
  const lines: string[] = text.split('\r\n')

  if (lines[lines.length - 1] === '') lines.pop()

  let colCount = -1
  const data: string[][] = []
  for (const index in lines) {
    data[index] = lines[index].split('\t')

    if (data[index].length === 1) return null
    if (colCount === -1) colCount = data[index].length
    else if (colCount !== data[index].length) return null
  }
  return data
}