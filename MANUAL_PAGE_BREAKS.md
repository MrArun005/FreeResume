# Manual Page Break Feature

## Overview

The Manual Page Break feature gives users **full control** over pagination when automatic pagination doesn't produce perfect results. Instead of trying to make the algorithm perfect for every edge case, users can now manually force any section to start on a new page.

## Problem It Solves

- Content sometimes looks misaligned or cut off at page boundaries
- Different templates have different spacing and padding
- Some sections look better starting on a fresh page
- Users know best when content doesn't look right

## How It Works

### For Users:

1. **Look at your resume preview** - Check if any sections look misaligned or cut off
2. **Click the page break icon** (📄) next to any section name in the editor
3. **That section will now start on a new page** - Forcing a clean break
4. **Orange icon = active** - The icon turns orange when a page break is active
5. **Click again to remove** - Toggle off to let the section flow naturally again

### Visual Indicators:

- **Gray icon** = No page break (section flows naturally)
- **Orange icon** = Page break active (section starts on new page)
- **Tooltip** = Hover over the icon for help text

### Technical Implementation:

#### 1. Data Structure

Added `pageBreaks` object to resume data:

```javascript
{
  personal: {...},
  experience: [...],
  pageBreaks: {
    'education': true,  // Education will start on new page
    'skills': false     // Skills flows naturally
  }
}
```

#### 2. Pagination Logic (`pagination.js`)

Before processing each section, check for manual page break:

```javascript
const hasManualPageBreak = data.pageBreaks?.[sectionId] === true;
if (hasManualPageBreak && pages.length > 0 && currentPage.sectionOrder.length > 0) {
    startNewPage(); // Force new page
}
```

#### 3. UI Controls (`App.jsx`)

- Added `togglePageBreak(sectionId)` function
- Added FileBreak icon button to each section tag
- Icon changes color based on state (gray → orange)
- Tooltip explains the feature

## Use Cases

### Example 1: Education Looks Cramped

**Problem**: Education section is squeezed at the bottom of page 1
**Solution**: Click page break icon on Education → It moves to top of page 2

### Example 2: Skills Cut Off

**Problem**: Skills section is partially visible, rest is hidden
**Solution**: Click page break icon on Skills → Entire section moves to new page

### Example 3: Better Visual Balance

**Problem**: Page 1 looks too crowded, page 2 looks empty
**Solution**: Force a section to page 2 for better balance

## Benefits

### 1. **User Empowerment**

- Users have final say on layout
- No need to wait for algorithm improvements
- Instant visual feedback

### 2. **Template Flexibility**

- Works with ALL templates (Gold, Executive, Creative, etc.)
- Compensates for template-specific quirks
- Handles edge cases gracefully

### 3. **Simple UX**

- One-click solution
- Visual feedback (orange icon)
- Reversible (click again to undo)

### 4. **Backward Compatible**

- Existing resumes work without changes
- `pageBreaks: {}` is default for new/old resumes
- No data migration needed

## Technical Details

### Files Modified:

1. **`/src/data/mockData.js`** - Added `pageBreaks: {}` to initialData
2. **`/src/App.jsx`** - Added toggle function, UI controls, and migration
3. **`/src/utils/pagination.js`** - Added page break check in section loop

### State Management:

```javascript
// Toggle page break
const togglePageBreak = (sectionId) => {
    setResume((prev) => ({
        ...prev,
        pageBreaks: {
            ...prev.pageBreaks,
            [sectionId]: !prev.pageBreaks?.[sectionId],
        },
    }));
};
```

### Persistence:

- Saved to localStorage automatically (via existing autosave)
- Persists across sessions
- Included in resume data export/import

## Future Enhancements (Optional)

1. **Visual Page Break Indicator**
    - Show a dashed line in preview where page breaks occur
    - Help users see the effect before printing

2. **Smart Suggestions**
    - Detect when content is cut off
    - Suggest page breaks automatically

3. **Bulk Operations**
    - "Reset all page breaks" button
    - "Optimize pagination" auto-mode

4. **Per-Item Page Breaks**
    - Force specific experience items to new page
    - More granular control

## Testing Checklist

- [x] Page break toggles on/off correctly
- [x] Icon changes color (gray ↔ orange)
- [x] Section moves to new page when toggled on
- [x] Section flows naturally when toggled off
- [x] Works with all templates
- [x] Persists across page refreshes
- [x] Backward compatible with old resumes
- [x] Tooltip shows helpful text

## User Guide

### Quick Start:

1. Open your resume in the editor
2. Look for sections that don't look right
3. Click the 📄 icon next to that section's name
4. The section will move to a new page
5. Print or export your resume!

### Tips:

- Use sparingly - let automatic pagination do most of the work
- Check preview after toggling to see the effect
- Try different combinations to find the best layout
- Remember: Orange = page break active

## Related Documentation

- See `PAGINATION_FIX.md` for automatic pagination improvements
- See `App.jsx` for implementation details
- See `pagination.js` for algorithm logic
