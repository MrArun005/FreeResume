import React, { useEffect, useState } from 'react';

const PageOverflowIndicator = ({ pageId }) => {
    const [fillPercentage, setFillPercentage] = useState(0);

    useEffect(() => {
        const checkPageFill = () => {
            const pageElement = document.getElementById(pageId);
            if (!pageElement) return;

            const layoutContainer = pageElement.querySelector('[class*="h-[297mm]"]');
            if (!layoutContainer) return;

            const safeHeight = 770;

            let totalHeight = 0;
            const children = Array.from(layoutContainer.children);
            children.forEach((child) => {
                totalHeight += child.offsetHeight;
            });

            const percentage = Math.min((totalHeight / safeHeight) * 100, 100);
            setFillPercentage(percentage);
        };

        checkPageFill();
        const interval = setInterval(checkPageFill, 500);
        return () => clearInterval(interval);
    }, [pageId]);

    if (fillPercentage === 0) return null;

    return (
        <div className="absolute -right-16 top-4 flex flex-col items-center gap-2 no-print z-30">
            {/* Fill Gauge */}
            <div className="relative w-6 h-32 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                <div
                    className={`absolute bottom-0 w-full transition-all duration-300 ${
                        fillPercentage > 95
                            ? 'bg-red-500'
                            : fillPercentage > 90
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                    }`}
                    style={{ height: `${fillPercentage}%` }}
                />
            </div>

            {/* Percentage */}
            <div
                className={`text-xs font-bold ${
                    fillPercentage > 95
                        ? 'text-red-600 dark:text-red-400'
                        : fillPercentage > 90
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                }`}
            >
                {Math.round(fillPercentage)}%
            </div>
        </div>
    );
};

export default PageOverflowIndicator;
