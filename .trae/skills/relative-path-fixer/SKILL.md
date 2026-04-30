---
name: "relative-path-fixer"
description: "Fixes relative path issues in HTML files across different directory levels. Invoke when pages in different directories need consistent styling and resource loading."
---

# Relative Path Fixer

## Problem Description
When creating multiple HTML pages in different directory levels (e.g., `文章/产品种草/` vs `文章/新闻通稿/`), the relative paths for CSS, JavaScript, images, and navigation links can break, causing inconsistent styling and resource loading failures.

## Root Cause
- Pages in deeper directories require additional `../` in relative paths to reach the same resources
- Templates often use hardcoded paths that work for one directory level but not others
- Resource files (CSS, JS, images) are typically stored in top-level directories

## Solution Steps

### 1. Identify Directory Structure
- Determine the relative depth of each page directory
- Example: `文章/新闻通稿/` is one level deeper than `文章/`

### 2. Adjust Relative Paths
For pages in deeper directories, modify all relative paths:

**From:**
```html
<link rel="stylesheet" href="../css/style.css">
<img src="../images/logo.png">
<a href="../ARRIE.html">首页</a>
<script src="../js/script.js"></script>
```

**To:**
```html
<link rel="stylesheet" href="../../css/style.css">
<img src="../../images/logo.png">
<a href="../../ARRIE.html">首页</a>
<script src="../../js/script.js"></script>
```

### 3. Update All Resource Types
- CSS files
- JavaScript files
- Image files
- Navigation links
- Return buttons and other internal links

### 4. Verify Consistency
- Open pages in different directories side by side
- Check that all resources load correctly
- Verify styling is consistent across all pages
- Test navigation between pages

## Example Usage

**Before Fix:**
- News articles in `文章/新闻通稿/` had broken styles
- Resources like `../css/vendor.css` couldn't be found
- Navigation links pointed to incorrect locations

**After Fix:**
- All pages use correct relative paths based on their directory depth
- Consistent styling across all pages
- Proper resource loading and navigation

## Common Pitfalls
- Forgetting to update all resource types (e.g., only fixing CSS but not images)
- Using absolute paths that break when moving the project
- Not testing across different directory levels
- Hardcoding paths in templates without considering directory structure

## Best Practices
- Use consistent directory structures
- Test paths in multiple directory levels
- Document path conventions for your project
- Consider using a build tool to handle path resolution automatically