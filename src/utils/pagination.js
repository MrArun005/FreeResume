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
const paginateGold = (data, heights, maxPageHeight) => {
    const pages = [];
    let currentPage = createPage(data);

    // STRICT DISCIPLINE CONSTANTS
    // PADDING reflects the *top* padding of the layout — it is added to
    // currentHeight once and never released, so the effective fill budget
    // for content on each page is (maxPageHeight - PADDING).
    const PADDING = 32; // tightened from 40 so page 1 fills more before overflow
    const ITEM_MARGIN = 24; // tightened from 32 (real CSS space-y-8 measures less in practice)
    const SECTION_MARGIN = 32; // tightened from 40
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

                    if (currentHeight + totalToAdd > maxPageHeight && currentHeight > PADDING + 100) {
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
                    if (currentHeight + itemHeight > maxPageHeight) {
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

            if (currentHeight + totalHeight > maxPageHeight && currentHeight > PADDING + 100) {
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
const paginateExecutive = (data, heights, maxPageHeight) => {
    const pages = [];
    let currentPage = createPage(data);

    // EXECUTIVE CONSTANTS — tightened to reduce trailing whitespace on page 1
    const PADDING = 40; // was 48; better matches measured fill
    const ITEM_MARGIN = 24; // was 32
    const SECTION_MARGIN = 24; // was 32
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
                        currentHeight + marginToAdd + titleHeight + itemHeight > maxPageHeight &&
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
                    if (currentHeight + itemHeight > maxPageHeight) {
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
            if (currentHeight + totalHeight > maxPageHeight && currentHeight > PADDING + 100) {
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

    // CONFIG — was over-conservative (PADDING 80 wasted ~80px per page)
    const PADDING = 48;
    const ITEM_MARGIN = 20;
    const SECTION_MARGIN = 16;
    const TITLE_HEIGHT = 28;

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

            if (pageHeights[currentPageIndex][colIndex] + totalHeight > maxPageHeight) {
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

                    if (currentH + margin + titleH + itemHeight > maxPageHeight) {
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

                if (currentH + margin + titleH + itemHeight > maxPageHeight) {
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

            if (pageHeights[currentPageIndex][colIndex] + totalHeight > maxPageHeight) {
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
const paginateStandard = (data, heights, maxPageHeight) => {
    const pages = [];
    let currentPage = createPage(data);

    // CONFIG — tightened so page 1 fills closer to A4 (1123px) before forcing a new page.
    // Most "standard" layouts (Classic, Minimal, ATS, Jakes) use p-10 or p-12 = 40-48px CSS padding.
    // PADDING here is the *top* reservation; effective fill budget = (maxPageHeight - PADDING).
    const PADDING = 40;
    const ITEM_MARGIN = 12;
    const SECTION_MARGIN = 16;
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
                        currentHeight + marginToAdd + titleHeight + itemHeight > maxPageHeight &&
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
                    if (currentHeight + itemHeight > maxPageHeight) {
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
            if (currentHeight + totalHeight > maxPageHeight && currentHeight > PADDING + 100) {
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

/**
 * MAIN ENTRY POINT
 */
export const paginateResume = (data, heights, maxPageHeight = 1000, layoutId = 'classic') => {
    switch (layoutId) {
        case 'gold':
            return paginateGold(data, heights, maxPageHeight);
        case 'executive':
            return paginateExecutive(data, heights, maxPageHeight);
        case 'canvas':
            return paginateCanvas(data);
        case 'creative':
        case 'sidebar-left':
        case 'sidebar-right':
            return paginateSidebar(data, heights, maxPageHeight, layoutId);
        case 'modern-grid':
            // For now, use sidebar logic (2-col) or standard?
            // Modern grid is complex, let's use sidebar logic but tweak it if needed.
            // Actually, modern grid is 2-col but not sidebar.
            // Fallback to standard for now to avoid breaking it, or create paginateModernGrid.
            // Given time constraints, let's map it to Sidebar but with different config if needed.
            // But Modern Grid has header spanning both.
            // Let's use Standard for now (single flow) as it's safer than broken 2-col.
            return paginateStandard(data, heights, maxPageHeight);
        default:
            return paginateStandard(data, heights, maxPageHeight);
    }
};
