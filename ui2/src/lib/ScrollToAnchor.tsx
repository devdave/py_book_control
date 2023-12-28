import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
//Sourced from https://dev.to/mindactuate/scroll-to-anchor-element-with-react-router-v6-38op
function ScrollToAnchor() {
    const yOffset = -140
    const location = useLocation();
    const lastHash = useRef('');

    const getScrollparent = (node:Element|null): Element|null => {
        if(node == null) {
            return null;
        }

        if(node.scrollHeight > node.clientHeight) {
            return node;
        } else {
            return getScrollparent(node.parentNode as Element)
        }
    }

    // listen to location change using useEffect with location as dependency
    // https://jasonwatmore.com/react-router-v6-listen-to-location-route-change-without-history-listen
    useEffect(() => {
        if (location.hash) {
            lastHash.current = location.hash.slice(1); // save hash for further use after navigation
        }

        if (lastHash.current && document.getElementById(lastHash.current)) {
            setTimeout(() => {

                const element = document.getElementById(lastHash.current)
                if(element){
                    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
                    const parent = getScrollparent(element)

                    if(parent){
                        console.log("Scrolled to", element.getBoundingClientRect().top, window.scrollY, yOffset, y)
                        window.scrollTo({top:y, behavior:"smooth"})
                        // element.scrollIntoView({ top: y, behavior: 'smooth'});
                        parent.scrollTo({top:y, behavior:"smooth"})
                    } else {
                        console.log("Failed to find scroll parent!")
                    }

                    lastHash.current = '';

                }

            }, 100);
        }
    }, [location]);

    return null;
}

export default ScrollToAnchor;
