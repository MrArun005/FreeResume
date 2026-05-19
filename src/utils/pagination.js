// Per-layout top-padding values in px. Each strategy reserves PADDING off
// the top of every page; if the layout actually paints more padding than the
// engine reserved, page 1 "feels full" too early and content moves to page 2
// while the bottom of page 1 is still empty. Keep these numbers honest with
// the actual CSS in each LayoutXxx.jsx (Tailwind p-10=40, p-12=48; mm values
// at 96dpi: 14mm≈53, 15mm≈57, 18mm≈68, 20mm≈76).
const LAYOUT_PADDING = {
    classic: 40,
    ats: 48,
    jakes: 40,
    freeform: 40,
    minimal: 76,
    'minimal-mono': 53,
    'navy-modern': 53,
    google: 53,
    'bold-recruit': 53,
    'executive-serif': 68,
    gold: 40,
    executive: 48,
    'sidebar-left': 57,
    'sidebar-right': 32,
    creative: 32,
};

// Per-layout vertical gap between items inside a section. Engine adds this
// on top of each item's measured offsetHeight to model the CSS gap. Mismatch
// between this and the real layout CSS is the main cause of "page 1 has space
// but section moved to page 2" — too high here = engine reserves room that
// the real render doesn't actually paint, so it cuts to a new page too early.
// Lower than the raw CSS gap on purpose. The engine adds ITEM_MARGIN to
// every item's offsetHeight, but offsetHeight on a `space-y-X` child already
// reflects the natural box height — and the parent flex/grid container
// often absorbs some of the visual gap. Under-counting by 4-8px per item
// leaves the engine optimistic about fit, which (combined with the
// post-pagination compaction pass and the overflow slack below) finally
// lets short tail sections (education, skills) ride alongside experience
// instead of getting routed to a near-empty page 2.
const LAYOUT_ITEM_MARGIN = {
    classic: 12,
    ats: 12,
    jakes: 4,
    freeform: 12,
    minimal: 16,
    'minimal-mono': 3,
    'navy-modern': 6,
    google: 8,
    'bold-recruit': 8,
    'executive-serif': 4,
    gold: 16,
    executive: 16,
    'sidebar-left': 10,
    'sidebar-right': 10,
    // Creative uses mb-8 (32px) between experience items — engine had 12,
    // under-counting by 20px per item and packing too much onto page 1.
    creative: 28,
};

// Per-layout vertical gap between sections (after a section title block ends
// and before the next section's title). Same principle: keep this close to
// what the layout actually paints. Section titles often have mt-5 or similar
// top-margin handled by the title itself, so this value is "the rest" of the
// breathing room between sections.
const LAYOUT_SECTION_MARGIN = {
    classic: 14,
    ats: 14,
    jakes: 10,
    freeform: 14,
    minimal: 16,
    'minimal-mono': 10,
    'navy-modern': 10,
    google: 10,
    'bold-recruit': 10,
    'executive-serif': 10,
    gold: 18,
    executive: 16,
    'sidebar-left': 10,
    'sidebar-right': 10,
    // Creative uses gap-6 (24px) between sections — bumped from 14 so the
    // engine stops thinking 5 sections of content fit when actual rendering
    // overflows by ~50px from cumulative gap.
    creative: 24,
};

// Allow this many pixels of overhang past maxPageHeight before the engine
// forces a new page. Items render at slightly different heights than the
// hidden mirror reports (font hinting, line-height rounding, parent flex
// containers absorbing gaps). overflow:hidden on the page wrapper clips a
// few px of trailing whitespace anyway, so granting some slack to fit a
// section that's just barely "over" the budget keeps short tail sections
// on the right page instead of breaking with 200-500px of empty space.
const OVERFLOW_SLACK = 28;

// Sidebar/two-column layouts have separate per-column budgets and chip-wrap
// height uncertainty. A moderate slack lets short sections (Education /
// Skills) ride alongside experience instead of going to a half-empty page 2,
// while staying tight enough not to over-pack Creative (which had been
// cramming everything into page 1 even though it actually overflowed).
const SIDEBAR_OVERFLOW_SLACK = 50;
const isSidebarLayout = (id) => id === 'sidebar-left' || id === 'sidebar-right' || id === 'creative';

const paddingFor = (layoutId, fallback) =>
    LAYOUT_PADDING[layoutId] != null ? LAYOUT_PADDING[layoutId] : fallback;
const itemMarginFor = (layoutId, fallback) =>
    LAYOUT_ITEM_MARGIN[layoutId] != null ? LAYOUT_ITEM_MARGIN[layoutId] : fallback;
const sectionMarginFor = (layoutId, fallback) =>
    LAYOUT_SECTION_MARGIN[layoutId] != null ? LAYOUT_SECTION_MARGIN[layoutId] : fallback;

/**
 * Helper to create a fresh page structure
 */
const createPage = (data) => ({
    personal: data.personal,
    sectionOrder: [],
    customSections: [],
    experience: [],
    education: [],
    skills: [],
});

/**
 * Pagination Strategy for GOLD Layout
 * Features: Single column, Serif fonts, Large headers, Strict 40px margins
 */
const paginateGold = (data, heights, maxPageHeight, layoutId = 'gold') => {
    const pages = [];
    let currentPage = createPage(data);

    // STRICT DISCIPLINE CONSTANTS
    // PADDING reflects the *top* padding of the layout — it is added to
    // currentHeight once and never released, so the effective fill budget
    // for content on each page is (maxPageHeight - PADDING).
    const PADDING = paddingFor(layoutId, 40);
    const ITEM_MARGIN = itemMarginFor(layoutId, 24);
    const SECTION_MARGIN = sectionMarginFor(layoutId, 28);
    const TITLE_HEIGHT = 40;

    let currentHeight = 0;

    // Add Header (Personal) - Only on Page 1
    const personalHeight = heights['section-personal'] || 0;
    currentHeight += personalHeight + PADDING;

    const startNewPage = () => {
        pages.push(currentPage);
        currentPage = createPage(data);
        currentHeight = PADDING; // Reset to top padding
    };

    data.sectionOrder.forEach((sectionId) => {
        // Manual Page Break Check
        if (data.pageBreaks?.[sectionId] === true && currentPage.sectionOrder.length > 0) {
            startNewPage();
        }

        const sectionHeight = heights[`section-${sectionId}`] || 0;
        const titleHeight = heights[`section-title-${sectionId}`] || TITLE_HEIGHT;

        // Check if list-based section
        const isListSection =
            ['experience', 'education'].includes(sectionId) ||
            data.customSections.some((cs) => cs.id === sectionId);

        if (isListSection) {
            let items = [];
            if (sectionId === 'experience') items = data.experience;
            else if (sectionId === 'education') items = data.education;
            else {
                const cs = data.customSections.find((s) => s.id === sectionId);
                if (cs) items = cs.items;
            }

            if (!items || items.length === 0) return;

            const pageItems = [];

            items.forEach((item) => {
                // Manual Item Break
                if (data.pageBreaks?.[item.id] === true) {
                    addItemsToPage(currentPage, sectionId, pageItems, data);
                    pageItems.length = 0;
                    startNewPage();
                }

                const measuredHeight = heights[`item-${item.id}`] || 0;
                const itemHeight = (measuredHeight > 0 ? measuredHeight : 50) + ITEM_MARGIN;

                const isFirstItemOnPage = !currentPage.sectionOrder.includes(sectionId);

                if (isFirstItemOnPage) {
                    // First item of section on this page
                    // Add Section Margin (if not at top) + Title + Item
                    const marginToAdd = currentHeight > PADDING + 10 ? SECTION_MARGIN : 0;
                    const totalToAdd = marginToAdd + titleHeight + itemHeight;

                    if (
                        currentHeight + totalToAdd > maxPageHeight + OVERFLOW_SLACK &&
                        currentHeight > PADDING + 100
                    ) {
                        // Too big, start new page
                        startNewPage();
                        currentPage.sectionOrder.push(sectionId);
                        currentHeight += titleHeight + itemHeight;
                        pageItems.push(item);
                    } else {
                        // Fits
                        currentHeight += marginToAdd;
                        currentPage.sectionOrder.push(sectionId);
                        currentHeight += titleHeight;
                        currentHeight += itemHeight;
                        pageItems.push(item);
                    }
                } else {
                    // Subsequent item
                    if (currentHeight + itemHeight > maxPageHeight + OVERFLOW_SLACK) {
                        // Push current items
                        addItemsToPage(currentPage, sectionId, pageItems, data);
                        pageItems.length = 0; // Clear

                        startNewPage();

                        // New Page: Title + Item
                        currentPage.sectionOrder.push(sectionId);
                        currentHeight += titleHeight + itemHeight;
                        pageItems.push(item);
                    } else {
                        currentHeight += itemHeight;
                        pageItems.push(item);
                    }
                }
            });

            // Add remaining items
            addItemsToPage(currentPage, sectionId, pageItems, data);
        } else {
            // Block Section (Summary, Skills)
            // Treat as atomic block
            const totalHeight = sectionHeight + SECTION_MARGIN;

            if (
                currentHeight + totalHeight > maxPageHeight + OVERFLOW_SLACK &&
                currentHeight > PADDING + 100
            ) {
                startNewPage();
                currentPage.sectionOrder.push(sectionId);
                currentHeight += sectionHeight;
            } else {
                const marginToAdd = currentHeight > PADDING + 10 ? SECTION_MARGIN : 0;
                currentHeight += marginToAdd + sectionHeight;
                currentPage.sectionOrder.push(sectionId);
            }

            if (sectionId === 'skills') currentPage.skills = data.skills;
        }
    });

    pages.push(currentPage);
    return addPageMetadata(pages);
};

/**
 * Pagination Strategy for EXECUTIVE Layout
 * Features: Single column, similar to Gold but tighter spacing
 */
const paginateExecutive = (data, heights, maxPageHeight, layoutId = 'executive') => {
    const pages = [];
    let currentPage = createPage(data);

    // EXECUTIVE CONSTANTS — tightened to reduce trailing whitespace on page 1
    const PADDING = paddingFor(layoutId, 48);
    const ITEM_MARGIN = itemMarginFor(layoutId, 24);
    const SECTION_MARGIN = sectionMarginFor(layoutId, 24);
    const TITLE_HEIGHT = 36;

    let currentHeight = 0;

    // Add Header (Personal) - Only on Page 1
    const personalHeight = heights['section-personal'] || 0;
    currentHeight += personalHeight + PADDING;

    const startNewPage = () => {
        pages.push(currentPage);
        currentPage = createPage(data);
        currentHeight = PADDING;
    };

    // ... Logic is identical to Gold, just constants differ ...
    // To respect user request for separate functions, I'm duplicating the logic structure
    // This allows future divergence without breaking Gold.

    data.sectionOrder.forEach((sectionId) => {
        if (data.pageBreaks?.[sectionId] === true && currentPage.sectionOrder.length > 0) {
            startNewPage();
        }

        const sectionHeight = heights[`section-${sectionId}`] || 0;
        const titleHeight = heights[`section-title-${sectionId}`] || TITLE_HEIGHT;
        const isListSection =
            ['experience', 'education'].includes(sectionId) ||
            data.customSections.some((cs) => cs.id === sectionId);

        if (isListSection) {
            let items = getItems(data, sectionId);
            if (!items || items.length === 0) return;

            const pageItems = [];
            items.forEach((item) => {
                // Manual Item Break
                if (data.pageBreaks?.[item.id] === true) {
                    addItemsToPage(currentPage, sectionId, pageItems, data);
                    pageItems.length = 0;
                    startNewPage();
                }

                const measuredHeight = heights[`item-${item.id}`] || 0;
                const itemHeight = (measuredHeight > 0 ? measuredHeight : 50) + ITEM_MARGIN;
                const isFirstItemOnPage = !currentPage.sectionOrder.includes(sectionId);

                if (isFirstItemOnPage) {
                    const marginToAdd = currentHeight > PADDING + 10 ? SECTION_MARGIN : 0;
                    if (
                        currentHeight + marginToAdd + titleHeight + itemHeight >
                            maxPageHeight + OVERFLOW_SLACK &&
                        currentHeight > PADDING + 100
                    ) {
                        startNewPage();
                        currentPage.sectionOrder.push(sectionId);
                        currentHeight += titleHeight + itemHeight;
                        pageItems.push(item);
                    } else {
                        currentHeight += marginToAdd + titleHeight + itemHeight;
                        currentPage.sectionOrder.push(sectionId);
                        pageItems.push(item);
                    }
                } else {
                    if (currentHeight + itemHeight > maxPageHeight + OVERFLOW_SLACK) {
                        addItemsToPage(currentPage, sectionId, pageItems, data);
                        pageItems.length = 0;
                        startNewPage();
                        currentPage.sectionOrder.push(sectionId);
                        currentHeight += titleHeight + itemHeight;
                        pageItems.push(item);
                    } else {
                        currentHeight += itemHeight;
                        pageItems.push(item);
                    }
                }
            });
            addItemsToPage(currentPage, sectionId, pageItems, data);
        } else {
            const totalHeight = sectionHeight + SECTION_MARGIN;
            if (
                currentHeight + totalHeight > maxPageHeight + OVERFLOW_SLACK &&
                currentHeight > PADDING + 100
            ) {
                startNewPage();
                currentPage.sectionOrder.push(sectionId);
                currentHeight += sectionHeight;
            } else {
                const marginToAdd = currentHeight > PADDING + 10 ? SECTION_MARGIN : 0;
                currentHeight += marginToAdd + sectionHeight;
                currentPage.sectionOrder.push(sectionId);
            }
            if (sectionId === 'skills') currentPage.skills = data.skills;
        }
    });

    pages.push(currentPage);
    return addPageMetadata(pages);
};

/**
 * Pagination Strategy for SIDEBAR Layouts (Creative, Left, Right)
 * Features: Two columns processed INDEPENDENTLY to ensure Page 1 is filled.
 */
const paginateSidebar = (data, heights, maxPageHeight, layoutId) => {
    // 1. Setup Pages Array
    const pages = [createPage(data)];

    // CONFIG — was over-conservative (PADDING 80 wasted ~80px per page).
    // Per-layout override so each sidebar variant reflects its real CSS.
    const PADDING = paddingFor(layoutId, 48);
    const ITEM_MARGIN = itemMarginFor(layoutId, 20);
    const SECTION_MARGIN = sectionMarginFor(layoutId, 16);
    const TITLE_HEIGHT = 28;
    // Sidebar columns have chip-wrap uncertainty — be more permissive about
    // fit so trailing short sections (Education, Skills) don't get bumped
    // to a near-empty page 2 when there's clearly room on page 1.
    const SLACK = isSidebarLayout(layoutId) ? SIDEBAR_OVERFLOW_SLACK : OVERFLOW_SLACK;

    // Define Columns
    let mainCol = 1;
    let sidebarCol = 0;

    if (layoutId === 'sidebar-right') {
        mainCol = 0;
        sidebarCol = 1;
    }

    // Initial Heights
    const personalHeight = heights['section-personal'] || 0;
    const contactHeight = heights['section-contact'] || 0;

    // Track heights for each page
    // pageHeights[pageIndex] = [col0Height, col1Height]
    const pageHeights = [];

    // Initialize Page 0
    pageHeights[0] = [PADDING, PADDING];
    if (layoutId === 'sidebar-left') {
        pageHeights[0][0] += personalHeight;
    } else if (layoutId === 'sidebar-right') {
        pageHeights[0][0] += personalHeight;
        pageHeights[0][1] += contactHeight;
    } else if (layoutId === 'creative') {
        // Creative: Sidebar (Col 0) has Contact info (approx 150px?)
        pageHeights[0][0] += 200; // Buffer for Contact Info
    }

    // --- IDENTIFY SIDEBAR SECTIONS ---
    // Heuristic: Education, Skills, and Custom Sections with specific names
    const sidebarKeywords = ['language', 'interest', 'award', 'certification', 'skill', 'education'];
    const isSidebarSection = (sectionId) => {
        if (sectionId === 'education' || sectionId === 'skills') return true;
        const cs = data.customSections.find((s) => s.id === sectionId);
        if (cs) {
            const title = cs.title.toLowerCase();
            return sidebarKeywords.some((kw) => title.includes(kw));
        }
        return false;
    };

    const sidebarSections = data.sectionOrder.filter((id) => isSidebarSection(id));
    const mainSections = data.sectionOrder.filter((id) => !isSidebarSection(id));

    // --- PASS 1: SIDEBAR CONTENT ---
    let currentPageIndex = 0;

    sidebarSections.forEach((sectionId) => {
        // Manual Page Break Check
        if (data.pageBreaks?.[sectionId] === true && currentPageIndex === 0) {
            currentPageIndex++;
            if (!pages[currentPageIndex]) {
                pages[currentPageIndex] = createPage(data);
                pageHeights[currentPageIndex] = [PADDING, PADDING];
            }
        }

        const colIndex = sidebarCol;
        const titleHeight = heights[`section-title-${sectionId}`] || TITLE_HEIGHT;

        if (sectionId === 'skills') {
            // Atomic Block
            const sectionHeight = heights[`section-${sectionId}`] || 100;
            const totalHeight = sectionHeight + SECTION_MARGIN;

            if (!pages[currentPageIndex]) {
                pages[currentPageIndex] = createPage(data);
                pageHeights[currentPageIndex] = [PADDING, PADDING];
            }

            if (pageHeights[currentPageIndex][colIndex] + totalHeight > maxPageHeight + SLACK) {
                currentPageIndex++;
                if (!pages[currentPageIndex]) {
                    pages[currentPageIndex] = createPage(data);
                    pageHeights[currentPageIndex] = [PADDING, PADDING];
                }
                pages[currentPageIndex].skills = data.skills;
                pages[currentPageIndex].sectionOrder.push('skills');
                pageHeights[currentPageIndex][colIndex] += totalHeight;
            } else {
                pages[currentPageIndex].skills = data.skills;
                pages[currentPageIndex].sectionOrder.push('skills');
                pageHeights[currentPageIndex][colIndex] += totalHeight;
            }
        } else {
            let items = getItems(data, sectionId);
            if (items && items.length > 0) {
                // List (Education, Custom)
                const pageItems = [];
                items.forEach((item) => {
                    // Manual Item Break
                    if (data.pageBreaks?.[item.id] === true) {
                        addItemsToPage(pages[currentPageIndex], sectionId, pageItems, data);
                        pageItems.length = 0;
                        currentPageIndex++;
                        if (!pages[currentPageIndex]) {
                            pages[currentPageIndex] = createPage(data);
                            pageHeights[currentPageIndex] = [PADDING, PADDING];
                        }
                    }

                    const measuredHeight = heights[`item-${item.id}`] || 0;
                    const itemHeight = (measuredHeight > 0 ? measuredHeight : 50) + ITEM_MARGIN;

                    if (!pages[currentPageIndex]) {
                        pages[currentPageIndex] = createPage(data);
                        pageHeights[currentPageIndex] = [PADDING, PADDING];
                    }

                    const currentH = pageHeights[currentPageIndex][colIndex];
                    const isFirstOnPage = !pages[currentPageIndex].sectionOrder.includes(sectionId);
                    const titleH = isFirstOnPage ? titleHeight : 0;
                    const margin = isFirstOnPage ? SECTION_MARGIN : 0;

                    if (currentH + margin + titleH + itemHeight > maxPageHeight + SLACK) {
                        addItemsToPage(pages[currentPageIndex], sectionId, pageItems, data);
                        pageItems.length = 0;

                        currentPageIndex++;
                        if (!pages[currentPageIndex]) {
                            pages[currentPageIndex] = createPage(data);
                            pageHeights[currentPageIndex] = [PADDING, PADDING];
                        }

                        pages[currentPageIndex].sectionOrder.push(sectionId);
                        pageHeights[currentPageIndex][colIndex] += titleHeight + itemHeight;
                        pageItems.push(item);
                    } else {
                        if (isFirstOnPage) pages[currentPageIndex].sectionOrder.push(sectionId);
                        pageHeights[currentPageIndex][colIndex] += margin + titleH + itemHeight;
                        pageItems.push(item);
                    }
                });
                addItemsToPage(pages[currentPageIndex], sectionId, pageItems, data);
            }
        }
    });

    // --- PASS 2: MAIN CONTENT ---
    currentPageIndex = 0; // RESET to Page 0
    // mainSections is already defined above

    mainSections.forEach((sectionId) => {
        // Manual Page Break Check
        if (data.pageBreaks?.[sectionId] === true && currentPageIndex === 0) {
            currentPageIndex++;
            if (!pages[currentPageIndex]) {
                pages[currentPageIndex] = createPage(data);
                pageHeights[currentPageIndex] = [PADDING, PADDING];
            }
        }

        const colIndex = mainCol;
        const sectionHeight = heights[`section-${sectionId}`] || 0;
        const titleHeight = heights[`section-title-${sectionId}`] || TITLE_HEIGHT;
        const isListSection =
            ['experience', 'education'].includes(sectionId) ||
            data.customSections.some((cs) => cs.id === sectionId);

        if (isListSection) {
            let items = getItems(data, sectionId);
            if (!items || items.length === 0) return;

            const pageItems = [];
            items.forEach((item) => {
                // Manual Item Break
                if (data.pageBreaks?.[item.id] === true) {
                    addItemsToPage(pages[currentPageIndex], sectionId, pageItems, data);
                    pageItems.length = 0;
                    currentPageIndex++;
                    if (!pages[currentPageIndex]) {
                        pages[currentPageIndex] = createPage(data);
                        pageHeights[currentPageIndex] = [PADDING, PADDING];
                    }
                }

                const measuredHeight = heights[`item-${item.id}`] || 0;
                const itemHeight = (measuredHeight > 0 ? measuredHeight : 50) + ITEM_MARGIN;

                if (!pages[currentPageIndex]) {
                    pages[currentPageIndex] = createPage(data);
                    pageHeights[currentPageIndex] = [PADDING, PADDING];
                }

                const currentH = pageHeights[currentPageIndex][colIndex];
                const isFirstOnPage = !pages[currentPageIndex].sectionOrder.includes(sectionId);
                const titleH = isFirstOnPage ? titleHeight : 0;
                const margin = isFirstOnPage ? SECTION_MARGIN : 0;

                if (currentH + margin + titleH + itemHeight > maxPageHeight + SLACK) {
                    addItemsToPage(pages[currentPageIndex], sectionId, pageItems, data);
                    pageItems.length = 0;

                    currentPageIndex++;
                    if (!pages[currentPageIndex]) {
                        pages[currentPageIndex] = createPage(data);
                        pageHeights[currentPageIndex] = [PADDING, PADDING];
                    }

                    pages[currentPageIndex].sectionOrder.push(sectionId);
                    pageHeights[currentPageIndex][colIndex] += titleHeight + itemHeight;
                    pageItems.push(item);
                } else {
                    if (isFirstOnPage) pages[currentPageIndex].sectionOrder.push(sectionId);
                    pageHeights[currentPageIndex][colIndex] += margin + titleH + itemHeight;
                    pageItems.push(item);
                }
            });
            addItemsToPage(pages[currentPageIndex], sectionId, pageItems, data);
        } else {
            // Block Section (Summary)
            const totalHeight = sectionHeight + SECTION_MARGIN;

            if (!pages[currentPageIndex]) {
                pages[currentPageIndex] = createPage(data);
                pageHeights[currentPageIndex] = [PADDING, PADDING];
            }

            if (pageHeights[currentPageIndex][colIndex] + totalHeight > maxPageHeight + SLACK) {
                currentPageIndex++;
                if (!pages[currentPageIndex]) {
                    pages[currentPageIndex] = createPage(data);
                    pageHeights[currentPageIndex] = [PADDING, PADDING];
                }
                pages[currentPageIndex].sectionOrder.push(sectionId);
                pageHeights[currentPageIndex][colIndex] += totalHeight;
            } else {
                pages[currentPageIndex].sectionOrder.push(sectionId);
                pageHeights[currentPageIndex][colIndex] += totalHeight;
            }
        }
    });

    return addPageMetadata(pages);
};

/**
 * Pagination Strategy for STANDARD Layouts (Classic, Minimal, ATS, etc.)
 */
const paginateStandard = (data, heights, maxPageHeight, layoutId = 'classic') => {
    const pages = [];
    let currentPage = createPage(data);

    // CONFIG — all three spacing constants come from per-layout maps so the
    // engine models each template's actual CSS gaps. A mismatch is the main
    // cause of "page 1 has free space but the next section jumped to page 2"
    // — too much reserved gap = engine thinks the page is full before the
    // real render actually fills it.
    const PADDING = paddingFor(layoutId, 40);
    const ITEM_MARGIN = itemMarginFor(layoutId, 12);
    const SECTION_MARGIN = sectionMarginFor(layoutId, 16);
    const TITLE_HEIGHT = 28;

    let currentHeight = 0;

    // Personal Header
    const personalHeight = heights['section-personal'] || 0;
    currentHeight += personalHeight + PADDING;

    const startNewPage = () => {
        pages.push(currentPage);
        currentPage = createPage(data);
        currentHeight = PADDING;
    };

    data.sectionOrder.forEach((sectionId) => {
        if (data.pageBreaks?.[sectionId] === true && currentPage.sectionOrder.length > 0) {
            startNewPage();
        }

        const sectionHeight = heights[`section-${sectionId}`] || 0;
        const titleHeight = heights[`section-title-${sectionId}`] || TITLE_HEIGHT;
        const isListSection =
            ['experience', 'education'].includes(sectionId) ||
            data.customSections.some((cs) => cs.id === sectionId);

        if (isListSection) {
            let items = getItems(data, sectionId);
            if (!items || items.length === 0) return;

            const pageItems = [];
            items.forEach((item) => {
                // Manual Item Break
                if (data.pageBreaks?.[item.id] === true) {
                    addItemsToPage(currentPage, sectionId, pageItems, data);
                    pageItems.length = 0;
                    startNewPage();
                }

                const measuredHeight = heights[`item-${item.id}`] || 0;
                const itemHeight = (measuredHeight > 0 ? measuredHeight : 50) + ITEM_MARGIN;
                const isFirstItemOnPage = !currentPage.sectionOrder.includes(sectionId);

                if (isFirstItemOnPage) {
                    const marginToAdd = currentHeight > PADDING + 10 ? SECTION_MARGIN : 0;
                    if (
                        currentHeight + marginToAdd + titleHeight + itemHeight >
                            maxPageHeight + OVERFLOW_SLACK &&
                        currentHeight > PADDING + 100
                    ) {
                        startNewPage();
                        currentPage.sectionOrder.push(sectionId);
                        currentHeight += titleHeight + itemHeight;
                        pageItems.push(item);
                    } else {
                        currentHeight += marginToAdd + titleHeight + itemHeight;
                        currentPage.sectionOrder.push(sectionId);
                        pageItems.push(item);
                    }
                } else {
                    if (currentHeight + itemHeight > maxPageHeight + OVERFLOW_SLACK) {
                        addItemsToPage(currentPage, sectionId, pageItems, data);
                        pageItems.length = 0;
                        startNewPage();
                        currentPage.sectionOrder.push(sectionId);
                        currentHeight += titleHeight + itemHeight;
                        pageItems.push(item);
                    } else {
                        currentHeight += itemHeight;
                        pageItems.push(item);
                    }
                }
            });
            addItemsToPage(currentPage, sectionId, pageItems, data);
        } else {
            const totalHeight = sectionHeight + SECTION_MARGIN;
            if (
                currentHeight + totalHeight > maxPageHeight + OVERFLOW_SLACK &&
                currentHeight > PADDING + 100
            ) {
                startNewPage();
                currentPage.sectionOrder.push(sectionId);
                currentHeight += sectionHeight;
            } else {
                const marginToAdd = currentHeight > PADDING + 10 ? SECTION_MARGIN : 0;
                currentHeight += marginToAdd + sectionHeight;
                currentPage.sectionOrder.push(sectionId);
            }
            if (sectionId === 'skills') currentPage.skills = data.skills;
        }
    });

    pages.push(currentPage);
    return addPageMetadata(pages);
};

/**
 * Pagination Strategy for CANVAS Layout
 * Emits full data for each page, calculated by the maximum Y position.
 */
const paginateCanvas = (data) => {
    let maxY = 1123; // default 1 page (A4 at 96dpi approx)
    if (data.customStyles) {
        Object.values(data.customStyles).forEach((style) => {
            if (style && style.y !== undefined) {
                const bottom = style.y + 600; // rough estimate of block height
                if (bottom > maxY) parseInt((maxY = bottom));
            }
        });
    }

    // Always give at least 1 page.
    let numPages = Math.max(1, Math.ceil(maxY / 1123));
    // Provide at minimum 2 pages if it's typical to drag things out
    if (numPages < 2) numPages = 2;

    const pages = [];
    for (let i = 0; i < numPages; i++) {
        // Deep clone to prevent reference mutations
        const pageData = JSON.parse(JSON.stringify(data));
        pageData.pageIndex = i;
        pageData.sectionStartPage = {}; // Canvas handles its own "pages"
        pages.push(pageData);
    }
    return pages;
};

// --- HELPERS ---

const getItems = (data, sectionId) => {
    if (sectionId === 'experience') return data.experience;
    if (sectionId === 'education') return data.education;
    const cs = data.customSections.find((s) => s.id === sectionId);
    return cs ? cs.items : [];
};

const addItemsToPage = (page, sectionId, items, data) => {
    if (items.length === 0) return;
    if (sectionId === 'experience') page.experience = [...(page.experience || []), ...items];
    else if (sectionId === 'education') page.education = [...(page.education || []), ...items];
    else {
        const existingCS = page.customSections.find((s) => s.id === sectionId);
        if (existingCS) {
            existingCS.items = [...existingCS.items, ...items];
        } else {
            const originalCS = data.customSections.find((s) => s.id === sectionId);
            page.customSections.push({ ...originalCS, items: [...items] });
        }
    }
};

const addPageMetadata = (pages) => {
    const sectionStartPage = {};
    pages.forEach((page, index) => {
        page.sectionOrder.forEach((sectionId) => {
            if (sectionStartPage[sectionId] === undefined) {
                sectionStartPage[sectionId] = index;
            }
        });
    });

    pages.forEach((page, index) => {
        page.sectionStartPage = sectionStartPage;
        page.pageIndex = index;
    });
    return pages;
};

// Estimate how much vertical space a single section (with its title and
// items) would consume on a page. Uses the same measured heights the engine
// already collected — title from #section-title-X, item heights from
// #item-Y. Returns 0 if the section is empty.
//
// `alreadyOnPage` (optional, default false): if the target page already has
// items from this section, we're appending continuation items — no new
// section title, no fresh section margin. Skipping those keeps compaction
// honest about cost so it doesn't refuse a valid pull-up that would fit.
const estimateSectionHeight = (data, heights, sectionId, page, opts, alreadyOnPage = false) => {
    const { titleH, itemMargin, sectionMargin } = opts;
    const title = alreadyOnPage ? 0 : heights[`section-title-${sectionId}`] || titleH;
    const margin = alreadyOnPage ? 0 : sectionMargin;
    if (sectionId === 'skills') {
        return margin + (heights[`section-skills`] || 80);
    }
    if (sectionId === 'summary') {
        return margin + (heights[`section-summary`] || 80);
    }
    let items;
    if (sectionId === 'experience') items = page.experience || [];
    else if (sectionId === 'education') items = page.education || [];
    else {
        const cs = page.customSections.find((s) => s.id === sectionId);
        items = cs ? cs.items : [];
    }
    if (!items.length) return 0;
    const itemsHeight = items.reduce((sum, it) => sum + (heights[`item-${it.id}`] || 50) + itemMargin, 0);
    return margin + title + itemsHeight;
};

// Sum what's actually on a page. Header is page-1-only and already baked
// into PADDING-derived currentHeight during the first pass, so we approximate
// page content height by adding header (if page 0) + each section's atomic
// height. Conservative — used only to compute leftover room.
const measurePageFill = (page, data, heights, opts) => {
    const { padding, headerH } = opts;
    let total = padding;
    if (page.pageIndex === 0) total += headerH;
    page.sectionOrder.forEach((sectionId) => {
        total += estimateSectionHeight(data, heights, sectionId, page, opts);
    });
    return total;
};

// Post-pagination compaction. After the strategy returns N pages, walk
// page-pairs and try to MOVE the first section of page i+1 up to page i if
// it would fit in page i's leftover space. Repeats until no more pull-ups
// are possible. Removes empty trailing pages.
//
// This is the layer that delivers "dynamic spacing" from the user's
// perspective: even if the first-pass paginator was conservative and pushed
// education/skills to a near-empty page, this pass pulls them back when
// there's room. Single-column standard layouts only — sidebar/canvas/gold
// have their own column models and aren't safe to mutate this way.
const compactPages = (pages, data, heights, maxPageHeight, layoutId) => {
    if (!pages || pages.length < 2) return pages;
    const padding = paddingFor(layoutId, 40);
    const itemMargin = itemMarginFor(layoutId, 12);
    const sectionMargin = sectionMarginFor(layoutId, 16);
    const titleH = 28;
    const headerH = heights['section-personal'] || 0;
    const opts = { padding, itemMargin, sectionMargin, titleH, headerH };
    let changed = true;
    let safety = 8; // never loop forever
    while (changed && safety-- > 0) {
        changed = false;
        for (let i = 0; i < pages.length - 1; i++) {
            const curr = pages[i];
            const next = pages[i + 1];
            if (!next.sectionOrder.length) continue;
            const firstNextSection = next.sectionOrder[0];
            // Estimate room on current page.
            const fill = measurePageFill(curr, data, heights, opts);
            const leftover = maxPageHeight + OVERFLOW_SLACK - fill;
            // Cost of moving the entire first section of next page up.
            // If the section is already on curr (continuation case from a
            // split), skip the title + section-margin overhead — they're
            // already paid.
            const alreadyOnCurr = curr.sectionOrder.includes(firstNextSection);
            const cost = estimateSectionHeight(data, heights, firstNextSection, next, opts, alreadyOnCurr);
            if (cost === 0) continue;
            if (cost <= leftover) {
                // Move it up. Only register the section name on curr if it
                // wasn't already there — otherwise this is a continuation
                // append (split being re-merged), and re-pushing would
                // duplicate the section in sectionOrder.
                if (!alreadyOnCurr) curr.sectionOrder.push(firstNextSection);
                next.sectionOrder.shift();
                if (firstNextSection === 'experience') {
                    curr.experience = [...(curr.experience || []), ...(next.experience || [])];
                    next.experience = [];
                } else if (firstNextSection === 'education') {
                    curr.education = [...(curr.education || []), ...(next.education || [])];
                    next.education = [];
                } else if (firstNextSection === 'skills') {
                    curr.skills = data.skills;
                    next.skills = [];
                } else {
                    const csNext = next.customSections.find((s) => s.id === firstNextSection);
                    if (csNext) {
                        const existing = curr.customSections.find((s) => s.id === firstNextSection);
                        if (existing) existing.items = [...existing.items, ...csNext.items];
                        else curr.customSections.push(csNext);
                        next.customSections = next.customSections.filter((s) => s.id !== firstNextSection);
                    }
                }
                changed = true;
            }
        }
        // Drop any pages that emptied out completely.
        for (let i = pages.length - 1; i >= 1; i--) {
            const p = pages[i];
            const hasContent =
                p.sectionOrder.length > 0 ||
                (p.experience || []).length > 0 ||
                (p.education || []).length > 0 ||
                (p.customSections || []).some((s) => s.items?.length > 0);
            if (!hasContent) {
                pages.splice(i, 1);
                changed = true;
            }
        }
    }
    // Rebuild sectionStartPage metadata after compaction.
    return addPageMetadata(pages);
};

// Sum up the natural rendered heights of every section the resume will
// actually display. Used by the single-page fast-path. Reads the same per-
// section offsetHeights the engine already measured — these reflect the
// real DOM height of each <section id="section-X"> block (which includes
// its own title + items + internal gaps), so summing them gives a tight
// estimate of total content height that's NOT affected by any `h-full` /
// `flex-1` quirks on the layout's outer/inner padding wrappers.
const sumContentHeight = (data, heights, padding, sectionMargin) => {
    const headerH = heights['section-personal'] || 0;
    let total = padding + headerH;
    let measuredCount = 0;
    (data.sectionOrder || []).forEach((sectionId) => {
        const h = heights[`section-${sectionId}`] || 0;
        if (h > 0) {
            total += h + sectionMargin;
            measuredCount++;
        }
    });
    return measuredCount > 0 ? total : 0;
};

// If the hidden mirror reports the resume fits naturally in one page,
// short-circuit: every section goes on page 0, no splitting attempted.
// This is the most reliable path because we're trusting the actual rendered
// height instead of summing item heights + per-layout margin assumptions.
const buildSinglePage = (data) => ({
    personal: data.personal,
    sectionOrder: [...(data.sectionOrder || [])],
    customSections: (data.customSections || []).map((cs) => ({ ...cs, items: [...cs.items] })),
    experience: [...(data.experience || [])],
    education: [...(data.education || [])],
    skills: [...(data.skills || [])],
    // Pass-through fields layouts read per-page. Without these, single-page
    // fast-path results would differ from multi-page strategy outputs in
    // subtle ways (e.g. layouts that gate elements on `data.pageBreaks` or
    // `data.sectionStyles` would render differently on a "fits in 1 page"
    // result vs the same content paginated normally).
    pageBreaks: data.pageBreaks || {},
    sectionStyles: data.sectionStyles || {},
    customStyles: data.customStyles || {},
    coverLetter: data.coverLetter,
    pageIndex: 0,
    sectionStartPage: (data.sectionOrder || []).reduce((acc, id) => {
        acc[id] = 0;
        return acc;
    }, {}),
});

// For sidebar/two-column layouts: if the trailing page contains ONLY
// sidebar sections (Education, Skills, or sidebar-keyword custom sections)
// and the previous page's sidebar column clearly has space, merge them.
// This catches the very visible "page 1 sidebar half-empty / page 2 only
// has Education" failure mode the engine's per-column budget over-counts.
const SIDEBAR_KEYWORDS = ['language', 'interest', 'award', 'certification', 'skill', 'education'];
const isSidebarSectionId = (id, customSections) => {
    if (id === 'education' || id === 'skills') return true;
    const cs = (customSections || []).find((s) => s.id === id);
    if (cs) {
        const title = (cs.title || '').toLowerCase();
        return SIDEBAR_KEYWORDS.some((kw) => title.includes(kw));
    }
    return false;
};

const compactSidebarTail = (pages, data, heights, maxPageHeight, layoutId) => {
    if (!Array.isArray(pages) || pages.length < 2) return pages;
    const last = pages[pages.length - 1];
    const prev = pages[pages.length - 2];

    // Identify which sections on the trailing page are sidebar-eligible.
    const trailingSidebarIds = last.sectionOrder.filter((id) => isSidebarSectionId(id, data.customSections));
    if (trailingSidebarIds.length === 0) return pages;
    const trailingIsSidebarOnly = trailingSidebarIds.length === last.sectionOrder.length;

    // Estimate what the prev page's sidebar column currently uses and what
    // the trailing page wants to add. We use per-section measured heights
    // plus section margins as the engine does.
    const PADDING = paddingFor(layoutId, 48);
    const SECTION_MARGIN = sectionMarginFor(layoutId, 16);
    const ITEM_MARGIN = itemMarginFor(layoutId, 20);

    const sumSidebarUsed = (page) => {
        let h = PADDING;
        // Contact info only renders on page 0 for sidebar-right; counting it
        // on any other page over-estimates the used space.
        if (layoutId === 'sidebar-right' && pages.indexOf(page) === 0) {
            h += heights['section-contact'] || 0;
        }
        page.sectionOrder.forEach((id) => {
            if (!isSidebarSectionId(id, data.customSections)) return;
            const sh = heights[`section-${id}`] || 0;
            h += sh + SECTION_MARGIN;
        });
        return h;
    };

    const prevUsed = sumSidebarUsed(prev);
    let trailingAdds = 0;
    trailingSidebarIds.forEach((id) => {
        const sh = heights[`section-${id}`] || 0;
        trailingAdds += sh + SECTION_MARGIN;
        // For list sections, also account for items.
        if (id === 'education') {
            (last.education || []).forEach((e) => {
                trailingAdds += (heights[`item-${e.id}`] || 0) + ITEM_MARGIN;
            });
        }
    });

    // Be conservative — only merge if there's at least 60px headroom after
    // pulling everything back, to avoid creating a new overflow.
    const HEADROOM = 60;
    if (prevUsed + trailingAdds > maxPageHeight + OVERFLOW_SLACK - HEADROOM) return pages;

    // Merge: pull trailing sidebar sections back into prev.
    trailingSidebarIds.forEach((id) => {
        if (!prev.sectionOrder.includes(id)) prev.sectionOrder.push(id);
        if (id === 'education') {
            prev.education = [...(prev.education || []), ...(last.education || [])];
        } else if (id === 'skills') {
            prev.skills = data.skills;
        } else {
            const cs = data.customSections.find((s) => s.id === id);
            if (cs) {
                const lastCs = (last.customSections || []).find((s) => s.id === id);
                const items = lastCs ? lastCs.items : [];
                const existing = prev.customSections.find((s) => s.id === id);
                if (existing) existing.items = [...existing.items, ...items];
                else prev.customSections.push({ ...cs, items: [...items] });
            }
        }
        // Remove the pulled section from `last` so it doesn't render twice.
        last.sectionOrder = last.sectionOrder.filter((sid) => sid !== id);
        if (id === 'education') last.education = [];
        else if (id === 'skills') last.skills = [];
        else {
            const lastCs = (last.customSections || []).find((s) => s.id === id);
            if (lastCs) lastCs.items = [];
        }
    });

    // If the trailing page is now empty (sidebar-only case), drop it.
    if (trailingIsSidebarOnly) pages.pop();
    // Final defensive sweep — drop any page that ended up with no content
    // (no sectionOrder entries, no items in any of the list buckets).
    const isEmptyPage = (p) =>
        (p.sectionOrder?.length ?? 0) === 0 &&
        (p.experience?.length ?? 0) === 0 &&
        (p.education?.length ?? 0) === 0 &&
        ((p.skills?.length ?? 0) === 0 || pages.indexOf(p) > 0) &&
        (p.customSections?.every((cs) => (cs.items?.length ?? 0) === 0) ?? true);
    const filtered = pages.filter((p) => !isEmptyPage(p));
    return addPageMetadata(filtered.length > 0 ? filtered : pages);
};

/**
 * MAIN ENTRY POINT
 */
export const paginateResume = (data, heights, maxPageHeight = 1000, layoutId = 'classic') => {
    // Fast-path: if the resume's sections naturally sum to within page
    // budget, force one page. Summing per-section offsetHeights is more
    // accurate than measuring the layout's outer container because layouts
    // commonly use `h-full` + `flex-1` to push content to the bottom of the
    // page in normal-render mode, which inflates outer.offsetHeight in
    // measurement mode too.
    const padding = paddingFor(layoutId, 40);
    const sectionMargin = sectionMarginFor(layoutId, 16);
    const naturalHeight = sumContentHeight(data, heights, padding, sectionMargin);
    if (naturalHeight > 0 && naturalHeight <= maxPageHeight + OVERFLOW_SLACK + 30) {
        return addPageMetadata([buildSinglePage(data)]);
    }
    let pages;
    switch (layoutId) {
        case 'gold':
            pages = paginateGold(data, heights, maxPageHeight, layoutId);
            break;
        case 'executive':
            pages = paginateExecutive(data, heights, maxPageHeight, layoutId);
            break;
        case 'canvas':
            return paginateCanvas(data);
        case 'creative':
        case 'sidebar-left':
        case 'sidebar-right': {
            // Two-column strategies don't fit the single-column compaction
            // heuristic, but we still want to catch the common case where
            // the LAST page contains only trailing sidebar sections
            // (Education / Skills / sidebar Custom) while the prior page
            // has obvious sidebar room. Pull them back when safe.
            const sidebarPages = paginateSidebar(data, heights, maxPageHeight, layoutId);
            return compactSidebarTail(sidebarPages, data, heights, maxPageHeight, layoutId);
        }
        default:
            pages = paginateStandard(data, heights, maxPageHeight, layoutId);
    }
    // Compaction is safe for single-column strategies (standard, gold,
    // executive) where measurePageFill's "header on page 0 only" assumption
    // holds.
    return compactPages(pages, data, heights, maxPageHeight, layoutId);
};
