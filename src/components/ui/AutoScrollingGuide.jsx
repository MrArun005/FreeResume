import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Maximize2, Crosshair, Fingerprint } from 'lucide-react';

const AutoScrollingGuide = () => {
    // We will use the 3 sci-fi images generated, plus a couple of abstract concepts
    // Duplicating/re-using images to make the scroll longer and more cinematic
    const slides = [
        {
            id: 'sys-01',
            image: '/images/sci-fi-1.png',
            title: 'HUD TERMINAL OVERRIDE',
            metrics: 'SYS: ONLINE | SPD: 99%',
            tag: 'CORE MODULE'
        },
        {
            id: 'sys-02',
            image: '/images/sci-fi-2.png',
            title: 'NETWORK SYNTHESIS',
            metrics: 'NODE: ACTIVE | LNC: SECURE',
            tag: 'ROUTING'
        },
        {
            id: 'sys-03',
            image: '/images/sci-fi-3.png',
            title: 'HOLO-DATA PROJECTION',
            metrics: 'OPT: MAX | VSN: CLEAR',
            tag: 'ANALYTICS'
        },
        {
            id: 'sys-04',
            image: '/images/sci-fi-1.png',
            title: 'CAREER TRAJECTORY MAPPING',
            metrics: 'TRG: LOCK | EST: 5Y',
            tag: 'PREDICTION'
        },
        {
            id: 'sys-05',
            image: '/images/sci-fi-2.png',
            title: 'NEURAL NODE INJECTION',
            metrics: 'SYNC: 100% | BRK: NONE',
            tag: 'UPLINK'
        }
    ];

    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    // Translate horizontally based on scroll progress. 
    // -60% usually works well for around ~5 items depending on window width
    const x = useTransform(scrollYProgress, [0, 1], ["5%", "-65%"]);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-[#020617] border-y border-cyan-500/20 z-10 w-full">
            {/* Sticky Container locks the view for exactly 1 screen height while scrolling down the 300vh */}
            <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">

                {/* Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>

                <div className="absolute top-[5vh] left-0 w-full z-10 pointer-events-none">
                    <div className="max-w-[1400px] mx-auto px-6">
                        <div className="flex justify-end gap-6">
                            <div className="flex items-center gap-4 hidden sm:flex">
                                <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                                <p className="text-xs font-mono text-cyan-600 uppercase tracking-widest animate-pulse font-bold">
                                    SCROLL TO INSPECT
                                </p>
                                <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edge Fades for seamless looping appearance */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-20 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-20 pointer-events-none"></div>

                {/* The horizontally translating track powered by Framer Motion */}
                <motion.div style={{ x }} className="flex gap-10 relative z-10 pl-[5vw]">
                    {slides.map((slide, idx) => (
                        <div
                            key={`${slide.id}-${idx}`}
                            className="relative w-[300px] sm:w-[600px] aspect-[16/9] flex-shrink-0 group/slide overflow-hidden border border-cyan-500/30 bg-[#020617]/50 shadow-2xl hover:border-cyan-400 transition-colors duration-500"
                        >
                            {/* Four Corner Accents */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 z-20 group-hover/slide:scale-150 transition-transform duration-500"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 z-20 group-hover/slide:scale-150 transition-transform duration-500"></div>
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 z-20 group-hover/slide:scale-150 transition-transform duration-500"></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 z-20 group-hover/slide:scale-150 transition-transform duration-500"></div>

                            {/* Image Background */}
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 bg-cyan-950/40 mix-blend-color z-10 group-hover/slide:bg-transparent transition-colors duration-700"></div>
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="w-full h-full object-cover grayscale brightness-75 group-hover/slide:grayscale-0 group-hover/slide:brightness-100 group-hover/slide:scale-110 transition-all duration-700 pointer-events-none"
                                    draggable="false"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent z-10 opacity-80 group-hover/slide:opacity-40 transition-opacity"></div>
                            </div>

                            {/* UI Overlay */}
                            <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between pointer-events-none">
                                <div className="flex justify-between items-start w-full">
                                    <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/50 text-[10px] font-mono text-cyan-300 font-bold tracking-widest backdrop-blur-md shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                        [{slide.tag}]
                                    </span>
                                    <Maximize2 size={20} className="text-cyan-400/50 group-hover/slide:text-cyan-400 transition-colors drop-shadow-md" />
                                </div>

                                <div className="transform translate-y-4 group-hover/slide:translate-y-0 opacity-80 group-hover/slide:opacity-100 transition-all duration-300">
                                    <h3 className="text-xl md:text-2xl font-bold font-display tracking-widest text-[#e2e8f0] uppercase shadow-black drop-shadow-lg">
                                        {slide.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Fingerprint size={14} className="text-cyan-400" />
                                        <p className="text-xs font-mono tracking-widest text-cyan-300 font-bold drop-shadow-md">
                                            {slide.metrics}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Scanning Line overlay */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.8)] z-30 opacity-0 group-hover/slide:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
                                animation: 'scanline 2s linear infinite'
                            }}></div>
                        </div>
                    ))}
                </motion.div>
            </div>

            <style>{`
                @keyframes scanline {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
            `}</style>
        </section>
    );
};

export default AutoScrollingGuide;
