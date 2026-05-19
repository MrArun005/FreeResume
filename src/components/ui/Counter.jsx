import { useEffect, useRef, useState } from 'react';

// Counter that animates from 0 → target once it scrolls into view, then stops.
// Uses requestAnimationFrame directly (no framer-motion) so it costs ~16ms of
// JS work spread over `duration` seconds and zero work after that.
const Counter = ({ to, duration = 1.4 }) => {
    const ref = useRef(null);
    const [value, setValue] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let raf = 0;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                observer.disconnect();
                const start = performance.now();
                const tick = (now) => {
                    const t = Math.min((now - start) / (duration * 1000), 1);
                    // ease-out cubic — fast start, soft landing
                    const eased = 1 - Math.pow(1 - t, 3);
                    setValue(Math.round(to * eased));
                    if (t < 1) raf = requestAnimationFrame(tick);
                };
                raf = requestAnimationFrame(tick);
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [to, duration]);

    return <span ref={ref}>{value}</span>;
};

export default Counter;
