import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { parse, type Shape, type Element, type ChartItem} from 'pptxtojson'
import { nanoid } from 'nanoid'
import type { Slide, TableCellStyle, TableCell, ChartType, ChartOptions, SlideBackground, PPTShapeElement, PPTLineElement } from '@/types/slides'
import { useSlidesStore } from '@/store'
import { decrypt } from '@/utils/crypto'
import { type ShapePoolItem, SHAPE_LIST, SHAPE_PATH_FORMULAS } from '@/configs/shapes'
import { VIEWPORT_SIZE } from '@/configs/canvas'
import useAddSlidesOrElements from '@/hooks/useAddSlidesOrElements'
import message from '@/utils/message'
import { trim } from 'lodash'
import { type AST, toAST } from '@/utils/htmlParser'
import tinycolor from 'tinycolor2'

const formatColor = (_color: string) => {
  const c = tinycolor(_color)
  const alpha = c.getAlpha()
  const color = alpha === 0 ? '#ffffff' : c.setAlpha(1).toHexString()
  return { alpha, color }
}

const formatHTML = (html: string): string => {
  const ast = toAST(html)
  let result = ''
  
  const parse = (obj: AST[], baseStyleObj: { [key: string]: string } = {}) => {
    for (const item of obj) {
      const styleObj = { ...baseStyleObj }
      const styleAttr = 'attributes' in item
        ? item.attributes.find((attr) => attr.key === 'style')
        : null
        
      if (styleAttr && styleAttr.value) {
        const styleArr = styleAttr.value.split(';')
        for (const styleItem of styleArr) {
          const [_key, _value] = styleItem.split(': ')
          const [key, value] = [trim(_key), trim(_value)]
          if (key && value) styleObj[key] = value
        }
      }

      if ('tagName' in item) {
        // Start tag with styles
        result += `<${item.tagName}`
        if (Object.keys(styleObj).length > 0) {
          result += ` style="${Object.entries(styleObj)
            .map(([k, v]) => `${k}: ${v}`)
            .join(';')}"`
        }
        // Add other attributes
        if ('attributes' in item) {
          item.attributes.forEach(attr => {
            if (attr.key !== 'style') {
              result += ` ${attr.key}="${attr.value}"`
            }
          })
        }
        result += '>'
      }

      if ('content' in item) {
        result += item.content
          .replace(/&nbsp;/g, ' ')
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&amp;/g, '&')
          .replace(/\n/g, '')
          .replace(/&apos;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&copy;/g, '©')
          .replace(/&reg;/g, '®')
          .replace(/&trade;/g, 'TM')
          .replace(/&euro;/g, '€')
          .replace(/&ndash;/g, '–')
          .replace(/&mdash;/g, '—')
          .replace(/&lsquo;/g, "'")
          .replace(/&rsquo;/g, "'")
          .replace(/&ldquo;/g, '"')
          .replace(/&rdquo;/g, '"')
      }

      if ('children' in item) {
        parse(item.children, styleObj)
      }

      if ('tagName' in item) {
        result += `</${item.tagName}>`
      }
    }
  }
  
  parse(ast)
  return result
}
const formatLegendText = (text: string): string => {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;apos;/g, "'")
    .replace(/&amp;amp;amp;apos;/g, "'")
}

const convertFontSizePtToPx = (html: string, ratio: number) => {
  return html.replace(/font-size:\s*([\d.]+)pt/g, (match, p1) => {
    return `font-size: ${(parseFloat(p1)).toFixed(1)}px`
  })
}
const replaceHyphens = (html: string): string => {
  // Replace hyphens only in text content (avoid HTML tags and CSS properties)
  return html.replace(/(>|^)([^<]+)(<|$)/g, (match, p1, p2, p3) => {
    const replacedText = p2.replace(/-/g, '‑')
    return `${p1}${replacedText}${p3}`
  })
  
}

const extractColorFromHTML = (htmlContent: string): string | null => {
  // Look for color style attribute in the HTML content
  const colorMatch = htmlContent.match(/style=["'].*?color:\s*(#[0-9a-fA-F]{6}).*?["']/)
  return colorMatch ? colorMatch[1] : null
}


export default () => {
  const slidesStore = useSlidesStore()
  const { theme } = storeToRefs(useSlidesStore())

  const { addSlidesFromData, isEmptySlide } = useAddSlidesOrElements()

  const exporting = ref(false)

  // 导入ppt文件
  const importSpecificFile = (files: FileList, cover = false) => {
    const file = files[0]

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      try {
        const slides = JSON.parse(decrypt(reader.result as string))
        if (cover) slidesStore.setSlides(slides)
        else if (isEmptySlide.value) slidesStore.setSlides(slides)
        else addSlidesFromData(slides)
      }
      catch {
        message.error('The file could not be read/parsed correctly')
      }
    })
    reader.readAsText(file)
  }

  const parseLineElement = (el: Shape): PPTLineElement => {
    let start: [number, number] = [0, 0]
    let end: [number, number] = [0, 0]

    if (!el.isFlipV && !el.isFlipH) { // 右下
      start = [0, 0]
      end = [el.width, el.height]
    }
    else if (el.isFlipV && el.isFlipH) { // 左上
      start = [el.width, el.height]
      end = [0, 0]
    }
    else if (el.isFlipV && !el.isFlipH) { // 右上
      start = [0, el.height]
      end = [el.width, 0]
    }
    else { // 左下
      start = [el.width, 0]
      end = [0, el.height]
    }
    return {
      type: 'line',
      id: nanoid(10),
      width: el.borderWidth || 1,
      left: el.left,
      top: el.top,
      start,
      end,
      style: el.borderType === 'dotted' ? 'dashed' : el.borderType,
      color: el.borderColor,
      points: ['', el.shapType === 'straightConnector1' ? 'arrow' : '']
    }
  }
  const importPaper = (response:string) => {

    try {
      const slides = JSON.parse(decrypt(response as string))
      slidesStore.setSlides(slides)
      addSlidesFromData(slides)
    }
    catch {
      message.error('The file could not be read/parsed correctly')
    }
}

  // 导入PPTX文件
  const importPPTXFile = async (file: File) => {
    const shapeList: ShapePoolItem[] = []
    for (const item of SHAPE_LIST) {
      shapeList.push(...item.children)
    }

    try {
      message.info('Processing PowerPoint content...')
      
      // Convert FileReader to Promise
      const readFileContent = (file: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as ArrayBuffer)
          reader.onerror = () => reject(reader.error)
          reader.readAsArrayBuffer(file)
        })
      }

      const fileContent = await readFileContent(file)
      const json = await parse(fileContent)
      console.log(json)
      const width = json.size.width
      const scale = VIEWPORT_SIZE / width

      const slides: Slide[] = []
      
      // Process each slide
      for (const item of json.slides) {
        const { type, value } = item.fill
        let background: SlideBackground
        if (type === 'image') {
          background = {
            type: 'image',
            image: {
              src: value.picBase64,
              size: 'cover',
            },
          }
        }
        else if (type === 'gradient') {
          background = {
            type: 'gradient',
            gradient: {
              type: 'linear',
              colors: value.colors.map(item => ({
                ...item,
                pos: parseInt(item.pos),
              })),
              rotate: value.rot,
            },
          }
        }
        else {
          background = {
            type: 'solid',
            color: value,
          }
        }

        const slide: Slide = {
          id: nanoid(10),
          elements: [],
          background,
        }

        const parseElements = async (elements: Element[]) => {
          for (const el of elements) {
            el.width = el.width * scale
            el.height = el.height * scale
            el.left = el.left * scale
            el.top = el.top * scale

            if (el.type === 'text') {
              slide.elements.push({
                type: 'text',
                id: nanoid(10),
                width: el.width,
                height: el.height,
                left: el.left,
                top: el.top,
                rotate: el.rotate,
                defaultFontName: theme.value.fontName,
                defaultColor: theme.value.fontColor,
                content: convertFontSizePtToPx(formatHTML(el.content), 96 / 72),
                lineHeight: 1,
                outline: {
                  color: el.borderColor,
                  width: el.borderWidth,
                  style: el.borderType === 'dotted' ? 'dashed' : el.borderType,
                },
                fill: el.fillColor,
              })
            }
            else if (el.type === 'image') {
              slide.elements.push({
                type: 'image',
                id: nanoid(10),
                src: el.src,
                width: el.width,
                height: el.height,
                left: el.left,
                top: el.top,
                fixedRatio: true,
                rotate: el.rotate,
              })
            }
            else if (el.type === 'shape') {
              if (el.shapType === 'line' || el.shapType === 'straightConnector1') {
                const lineElement = parseLineElement(el)
                slide.elements.push(lineElement)
              }
              else {
                const shape = shapeList.find(item => item.pptxShapeType === el.shapType)
                
                const element: PPTShapeElement = {
                  type: 'shape',
                  id: nanoid(10),
                  width: el.width,
                  height: el.height,
                  left: el.left,
                  top: el.top,
                  viewBox: [200, 200],
                  path: 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
                  fill: el.fillColor || 'none',
                  fixedRatio: false,
                  rotate: el.rotate,
                  outline: {
                    color: el.borderColor,
                    width: el.borderWidth,
                    style: el.borderType === 'dotted' ? 'dashed' : el.borderType,
                  },
                  text: {
                    content: convertFontSizePtToPx(formatHTML(el.content), 96 / 72),
                    defaultFontName: theme.value.fontName,
                    defaultColor: theme.value.fontColor,
                    align: 'middle',
                  }
                }

                if (shape) {
                  element.path = shape.path
                  element.viewBox = shape.viewBox

                  if (shape.pathFormula) {
                    element.pathFormula = shape.pathFormula
                    element.viewBox = [el.width, el.height]

                    const pathFormula = SHAPE_PATH_FORMULAS[shape.pathFormula]
                    if ('editable' in pathFormula) {
                      element.path = pathFormula.formula(el.width, el.height, pathFormula.defaultValue)
                      element.keypoint = pathFormula.defaultValue
                    }
                    else element.path = pathFormula.formula(el.width, el.height)
                  }
                }

                slide.elements.push(element)
              }
            }
            else if (el.type === 'table') {
              const row = el.data.length
              const col = el.data[0].length

              const style: TableCellStyle = {
                fontname: theme.value.fontName,
                color: theme.value.fontColor,
              }
              const data: TableCell[][] = []
              for (let i = 0; i < row; i++) {
                const rowCells: TableCell[] = []
                for (let j = 0; j < col; j++) {
                  const cellData = el.data[i][j]
                  rowCells.push({
                    id: nanoid(10),
                    colspan: 1,
                    rowspan: cellData.rowSpan || 1,
                    text: cellData.text,
                    style,
                  })
                }
                data.push(rowCells)
              }

              const colWidths: number[] = new Array(col).fill(1 / col)

              slide.elements.push({
                type: 'table',
                id: nanoid(10),
                width: el.width,
                height: el.height,
                left: el.left,
                top: el.top,
                colWidths,
                rotate: 0,
                data,
                outline: {
                  width: 2,
                  style: 'solid',
                  color: '#eeece1',
                },
                theme: {
                  color: theme.value.themeColor,
                  rowHeader: true,
                  rowFooter: false,
                  colHeader: false,
                  colFooter: false,
                },
                cellMinHeight: 36,
              })
            }
            else if (el.type === 'chart') {
              let labels: string[]
              let legends: string[]
              let series: number[][]
  
              if (el.chartType === 'scatterChart') {
                labels = el.data[0].map((item, index) => `坐标${index + 1}`)
                legends = ['X', 'Y']
                series = el.data
              }
              else {
                const data = el.data as ChartItem[]
                labels = Object.values(data[0].xlabels)
                legends = data.map(item => formatLegendText(item.key))
                series = data.map(item => item.values.map(v => v.y))
              }

              const options: ChartOptions = {}
  
              let chartType: ChartType = 'bar'

              switch (el.chartType) {
                case 'barChart':
                case 'bar3DChart':
                  chartType = 'bar'
                  if (el.barDir === 'bar') chartType = 'bar'
                  if (el.grouping === 'stacked' || el.grouping === 'percentStacked') options.stack = true
                  break
                case 'lineChart':
                case 'line3DChart':
                  if (el.grouping === 'stacked' || el.grouping === 'percentStacked') options.stack = true
                  chartType = 'line'
                  break
                case 'areaChart':
                case 'area3DChart':
                  if (el.grouping === 'stacked' || el.grouping === 'percentStacked') options.stack = true
                  chartType = 'area'
                  break
                case 'scatterChart':
                case 'bubbleChart':
                  chartType = 'scatter'
                  break
                case 'pieChart':
                case 'pie3DChart':
                  chartType = 'pie'
                  break
                case 'doughnutChart':
                  chartType = 'ring'
                  break
                default:
              }

            let textColor = theme.value.fontColor // Default fallback

            for (const existingElement of slide.elements) {
              if (existingElement.type === 'text' && existingElement.content) {
                const extractedColor = extractColorFromHTML(existingElement.content)
                if (extractedColor) {
                  textColor = extractedColor
                  break
                }
              }
            }

            for (const slideElement of item.elements) {
              if ((slideElement.type === 'text' || slideElement.type === 'shape') && 
                  slideElement.content && typeof slideElement.content === 'string') {
                const extractedColor = extractColorFromHTML(slideElement.content)
                if (extractedColor) {
                  textColor = extractedColor
                  break
                }
              }
            }
                          
              slide.elements.push({
                type: 'chart',
                id: nanoid(10),
                chartType: chartType,
                width: el.width,
                height: el.height,
                left: el.left,
                top: el.top,
                rotate: 0,
                themeColor: [theme.value.themeColor],
                textColor: textColor,
                data: {
                  labels,
                  legends,
                  series,
                },
                options,
              })
            }
            else if (el.type === 'group') {
              const elements = el.elements.map(_el => ({
                ..._el,
                left: _el.left + el.left,
                top: _el.top + el.top,
              }))
              await parseElements(elements)
            }
          }
        }

        await parseElements(item.elements)
        slides.push(slide)
      }

      await slidesStore.setSlides(slides)

      return new Promise<Slide[]>((resolve) => {
        setTimeout(() => {
          // message.success('PowerPoint loaded successfully')
          resolve(slides)
        }, 1000)
      })

    } catch (error) {
      message.error('Error processing PowerPoint file')
      throw error
    }
  }  
  return {
    importSpecificFile,
    importPPTXFile,
    exporting,
    importPaper,
  }
}