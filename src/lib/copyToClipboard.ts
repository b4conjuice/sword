export default function copyToClipboard(textToCopy: string) {
  let textArea: HTMLTextAreaElement

  function isOS() {
    // can use a better detection logic here
    return /ipad|iphone/i.exec(navigator.userAgent)
  }

  function createTextArea(text: string) {
    textArea = document.createElement('textArea') as HTMLTextAreaElement
    textArea.readOnly = true
    textArea.contentEditable = 'true'
    textArea.value = text
    document.body.appendChild(textArea)
  }

  function selectText() {
    let range
    let selection

    if (isOS()) {
      range = document.createRange()
      range.selectNodeContents(textArea)
      selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      textArea.setSelectionRange(0, 999999)
    } else {
      textArea.select()
    }
  }

  function copyTo() {
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }

  createTextArea(textToCopy)
  selectText()
  copyTo()
}
