import { useState, useEffect, RefObject } from 'react'

/**
 * This hook is pretty self explanitory. It returns true if the window scrollbar is visible and false if it's 
 * not. It also adds an event listener to the window resize event to update the value if the state if the scrollbar
 * state changes (causing rerender). 
 * 
 * @param key - a key to force the hook to rerun if the key changes. Everytime we add a new element (HttpResponseCard in
 * case of HttpResponses component) we want to rerun this hook to see if the scrollbar is visible or not.
 * 
 * 
 */
export const useScrollbarVisibleForWindow = (key: number): boolean => {
    const [isScrollbarVisible, setIsScrollbarVisible] = useState(false)

    useEffect(() => {
        function checkScrollbar() {
            setIsScrollbarVisible(window.innerWidth > document.documentElement.clientWidth)
        }

        checkScrollbar()

        window.addEventListener('resize', checkScrollbar)
        return () =>  {
            window.removeEventListener('resize', checkScrollbar)
        }
    }, [key])

    return isScrollbarVisible
}


/**
 * I'm not actually using this hook but may need to soon. You give it some html element to know if it's scrollbar
 * is visible or not. Here's a sample usage:
 * 
 * const MyComponent: React.FC = () => {
 * const ref = useRef<HTMLDivElement>(null)
 * const isScrollbarVisible = useScrollbarVisible(ref)
 *
 * return (
 *   <div ref={ref} style={{ height: '100px', overflow: 'auto' }}>
 *     {isScrollbarVisible ? 'Scrollbar is visible' : 'Scrollbar is not visible'}
 *     ...more content here...
 *     </div>d
 *     )
 *   }
 */
export const useScrollbarVisibleForElement = (ref: RefObject<HTMLElement>): boolean => {
    const [isScrollbarVisible, setIsScrollbarVisible] = useState(false)

    useEffect(() => {
        function checkScrollbar() {
            setIsScrollbarVisible(ref.current ? ref.current.scrollHeight > ref.current.clientHeight : false)
        }

        checkScrollbar()

        window.addEventListener('resize', checkScrollbar)
        return () => window.removeEventListener('resize', checkScrollbar)
    }, [ref])

    return isScrollbarVisible
}