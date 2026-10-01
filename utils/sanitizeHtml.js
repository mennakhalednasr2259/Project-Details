const ALLOWED_TAGS = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DIV', 'EM', 'H1', 'H2', 'H3',
  'I', 'LI', 'OL', 'P', 'PRE', 'S', 'SPAN', 'STRONG', 'U', 'UL',
])
const DROP_CONTENT_TAGS = new Set(['IFRAME', 'OBJECT', 'SCRIPT', 'STYLE', 'SVG', 'MATH', 'TEMPLATE'])

function safeLink(value) {
  const link = String(value || '').trim()
  if (!link || /^(?:javascript|data|vbscript):/i.test(link)) return ''

  try {
    const parsed = new URL(link, document.baseURI)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol) ? link : ''
  } catch (error) {
    return ''
  }
}

function copySafeNode(node, outputDocument) {
  if (node.nodeType === 3) return outputDocument.createTextNode(node.nodeValue || '')
  if (node.nodeType !== 1) return null

  const tagName = node.tagName.toUpperCase()
  if (DROP_CONTENT_TAGS.has(tagName)) return null
  if (!ALLOWED_TAGS.has(tagName)) {
    const fragment = outputDocument.createDocumentFragment()
    Array.from(node.childNodes).forEach((child) => {
      const safeChild = copySafeNode(child, outputDocument)
      if (safeChild) fragment.appendChild(safeChild)
    })
    return fragment
  }

  const cleanNode = outputDocument.createElement(tagName.toLowerCase())
  if (tagName === 'A') {
    const href = safeLink(node.getAttribute('href'))
    if (href) cleanNode.setAttribute('href', href)
    if (node.getAttribute('target') === '_blank') {
      cleanNode.setAttribute('target', '_blank')
      cleanNode.setAttribute('rel', 'noopener noreferrer')
    }
  }
  Array.from(node.childNodes).forEach((child) => {
    const safeChild = copySafeNode(child, outputDocument)
    if (safeChild) cleanNode.appendChild(safeChild)
  })
  return cleanNode
}

export function sanitizeHtml(value) {
  const html = String(value || '')
  if (typeof DOMParser === 'undefined' || typeof document === 'undefined') {
    return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  const parsedDocument = new DOMParser().parseFromString(html, 'text/html')
  const outputDocument = document.implementation.createHTMLDocument('')
  const container = outputDocument.createElement('div')
  Array.from(parsedDocument.body.childNodes).forEach((node) => {
    const safeNode = copySafeNode(node, outputDocument)
    if (safeNode) container.appendChild(safeNode)
  })
  return container.innerHTML
}
