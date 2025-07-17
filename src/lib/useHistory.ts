import useLocalStorage from '@/lib/useLocalStorage'
import type { HistoryEntry, Scripture } from '@/lib/types'
import { getBookLink, transformScripturetoText } from './books'

export default function useHistory() {
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    's4-history',
    []
  )
  function addHistory(scripture: Scripture) {
    const text = scripture.text ?? transformScripturetoText(scripture)
    const url = getBookLink(text)
    const entry = {
      scripture: {
        ...scripture,
        text,
        asString: `${scripture.bookName} ${scripture.chapter}${scripture.verse ? `:${scripture.verse}` : ''}`,
      },
      date: new Date(),
      url,
    }
    setHistory([entry, ...history])
  }
  function clearHistory() {
    setHistory([])
  }
  return { history, clearHistory, addHistory }
}
