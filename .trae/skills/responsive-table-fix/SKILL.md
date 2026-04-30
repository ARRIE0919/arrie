---
name: "responsive-table-fix"
description: "Fixes HTML table display issues on small screens by adding responsive CSS. Invoke when user reports tables being cut off or not displaying properly on mobile/small screens."
---

# Responsive Table Fix Skill

This skill provides a comprehensive solution for making HTML tables responsive on small screens, preventing content from being cut off on the right side.

## Problem Description

HTML tables with multiple columns often overflow their containers on small screens (mobile devices), causing the rightmost columns to be hidden or inaccessible. This is a common issue when:
- Tables have many columns
- Table cells contain long text
- Viewport width is less than 768px (especially < 412px and < 300px)

## Solution

Add the following CSS to the HTML file's `<style>` section or external stylesheet:

```css
/* 表格响应式优化 - 适用于所有小屏幕 */
.table-responsive {
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
}

/* 屏幕宽度小于 768px */
@media (max-width: 768px) {
  .table-responsive table {
    font-size: 10px !important;
    table-layout: fixed;
  }
  .table-responsive td,
  .table-responsive th {
    padding: 6px 4px !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    min-width: 60px;
  }
}

/* 屏幕宽度小于 576px */
@media (max-width: 576px) {
  .table-responsive table {
    font-size: 9px !important;
  }
  .table-responsive td,
  .table-responsive th {
    padding: 4px 3px !important;
    min-width: 50px;
  }
}

/* 屏幕宽度小于 412px */
@media (max-width: 412px) {
  .table-responsive table {
    font-size: 8px !important;
  }
  .table-responsive td,
  .table-responsive th {
    padding: 3px 2px !important;
    min-width: 40px;
  }
}

/* 屏幕宽度小于 350px */
@media (max-width: 350px) {
  .table-responsive table {
    font-size: 7px !important;
  }
  .table-responsive td,
  .table-responsive th {
    padding: 2px 1px !important;
    min-width: 35px;
    line-height: 1.2;
  }
}

/* 屏幕宽度小于 280px */
@media (max-width: 280px) {
  .table-responsive table {
    font-size: 6px !important;
  }
  .table-responsive td,
  .table-responsive th {
    padding: 2px 1px !important;
    min-width: 30px;
    line-height: 1.1;
  }
}

/* 屏幕宽度小于 200px */
@media (max-width: 200px) {
  .table-responsive table {
    font-size: 5px !important;
  }
  .table-responsive td,
  .table-responsive th {
    padding: 1px !important;
    min-width: 25px;
    line-height: 1;
  }
}
```

## Key Techniques

1. **Horizontal Scrolling**: `overflow-x: auto` enables horizontal scrolling when content overflows
2. **Fixed Table Layout**: `table-layout: fixed` distributes column widths more evenly
3. **Progressive Font Scaling**: Font size decreases as screen width decreases (10px → 5px)
4. **Minimum Column Width**: `min-width` prevents columns from becoming too narrow
5. **Text Wrapping**: `word-break: break-word` allows text to wrap within cells
6. **Touch Scrolling**: `-webkit-overflow-scrolling: touch` enables smooth scrolling on iOS

## Breakpoint Reference

| Screen Width | Font Size | Padding | Min Column Width | Line Height |
|-------------|-----------|---------|------------------|-------------|
| < 768px | 10px | 6px 4px | 60px | default |
| < 576px | 9px | 4px 3px | 50px | default |
| < 412px | 8px | 3px 2px | 40px | default |
| < 350px | 7px | 2px 1px | 35px | 1.2 |
| < 280px | 6px | 2px 1px | 30px | 1.1 |
| < 200px | 5px | 1px | 25px | 1 |

## Usage Instructions

1. Locate the HTML file(s) with table display issues
2. Find the `<style>` section in the `<head>` or create one
3. Insert the CSS code above into the style section
4. Ensure tables are wrapped with a container having `class="table-responsive"`
5. Test on various screen sizes

## HTML Structure Requirement

The table should be wrapped in a responsive container:

```html
<div class="table-responsive">
  <table class="table table-bordered">
    <!-- table content -->
  </table>
</div>
```

## When to Invoke This Skill

- User reports tables being cut off on mobile devices
- Tables don't display properly on small screens
- Rightmost table columns are hidden or inaccessible
- Need to make existing tables responsive
- Working with Bootstrap tables that overflow on mobile

## Example Fix

**Before**: Table content cut off on screens < 400px

**After**: Table becomes horizontally scrollable with progressively smaller fonts:
- At 350px: 7px font, readable with scrolling
- At 280px: 6px font, still accessible
- At 200px: 5px font, minimum viable size
