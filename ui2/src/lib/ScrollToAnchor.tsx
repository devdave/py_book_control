import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
//Sourced from https://dev.to/mindactuate/scroll-to-anchor-element-with-react-router-v6-38op
function ScrollToAnchor() {
    const yOffset = 290
    const location = useLocation();
    const lastHash = useRef('');

    // listen to location change using useEffect with location as dependency
    // https://jasonwatmore.com/react-router-v6-listen-to-location-route-change-without-history-listen
    useEffect(() => {
        if (location.hash) {
            lastHash.current = location.hash.slice(1); // safe hash for further use after navigation
        }

        if (lastHash.current && document.getElementById(lastHash.current)) {
            setTimeout(() => {

                const element = document.getElementById(lastHash.current)
                if(element){
                    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
                    console.log("Scrolled to", element.getBoundingClientRect().top, window.scrollY, yOffset, y)
                    // @ts-expect-error top is not recognized but it is correct
                    element.scrollIntoView({ top: y, behavior: 'smooth'});
                    lastHash.current = '';

                }

            }, 100);
        }
    }, [location]);

    return null;
}

export default ScrollToAnchor;
