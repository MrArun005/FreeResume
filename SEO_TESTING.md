# SEO Testing & Validation Commands

## After You Deploy Your Site

### 1. Check if Sitemap is Accessible
```bash
# Replace YOURDOMAIN.com with your actual domain
curl -I https://YOURDOMAIN.com/sitemap.xml

# ✅ Expected: HTTP/2 200 or HTTP 200 OK
# ❌ If you get 404, the sitemap is not accessible
```

### 2. Check if robots.txt is Accessible
```bash
curl -I https://YOURDOMAIN.com/robots.txt

# ✅ Expected: HTTP/2 200 or HTTP 200 OK
```

### 3. View Your Sitemap Content
```bash
curl https://YOURDOMAIN.com/sitemap.xml

# Should display XML content with your URLs
```

### 4. View Your robots.txt Content
```bash
curl https://YOURDOMAIN.com/robots.txt

# Should show:
# User-agent: *
# Allow: /
# Sitemap: https://YOURDOMAIN.com/sitemap.xml
```

### 5. Check Meta Tags on Live Site
```bash
curl -s https://YOURDOMAIN.com/ | grep -E '<title>|<meta name="description"|<meta property="og:'

# Should show your SEO meta tags
```

---

## Testing Before Deployment (Local)

### 1. Start Your Dev Server
```bash
cd /Users/arunmallikarjun/Downloads/youtube-channel-search/my-resume
npm run dev
```

### 2. Check Local Sitemap
```bash
curl http://localhost:5173/sitemap.xml
```

### 3. Check Local robots.txt  
```bash
curl http://localhost:5173/robots.txt
```

### 4. View Page Source Locally
```bash
curl http://localhost:5173/ | grep '<title>'
curl http://localhost:5173/ | grep 'description'
```

---

## Google Testing Tools (Use in Browser)

### 1. Mobile-Friendly Test
```
https://search.google.com/test/mobile-friendly?url=YOURDOMAIN.com
```

### 2. PageSpeed Insights
```
https://pagespeed.web.dev/?url=YOURDOMAIN.com
```

### 3. Rich Results Test (For Structured Data)
```
https://search.google.com/test/rich-results?url=YOURDOMAIN.com
```

### 4. URL Inspection Tool (Google Search Console)
```
https://search.google.com/search-console/inspect
```

---

## Check if Google Has Indexed Your Site

### Method 1: site: Search
Open Google and search:
```
site:YOURDOMAIN.com
```

**What you should see:**
- If indexed: Your homepage appears in results
- If not indexed yet: "No results found" (normal for new sites)

### Method 2: Check Specific Page
```
site:YOURDOMAIN.com "Free Resume Builder"
```

---

## Monitor Google Search Console

### Important Reports to Check Weekly

1. **Performance Report**
```
Google Search Console → Performance
```
Check:
- Clicks (people visiting from Google)
- Impressions (how often you appear)
- Average position
- CTR (click-through rate)

2. **Coverage Report**
```
Google Search Console → Coverage
```
Check for:
- ✅ Valid pages (should have at least 1)
- ❌ Errors (should be 0)
- ⚠️ Warnings (investigate if any)

3. **Sitemaps Report**
```
Google Search Console → Sitemaps
```
Check:
- Status should be "Success"
- Discovered URLs should show your pages

---

## Validate Your Structured Data

### Online Validator
Paste your homepage HTML or URL here:
```
https://validator.schema.org/
```

✅ **Expected**: No errors, shows WebApplication structured data

---

## Check Backlinks (After a Month)

### Free Backlink Checkers:
```
https://ahrefs.com/backlink-checker
https://www.semrush.com/analytics/backlinks/
```

Enter your domain to see who's linking to you.

---

## Keyword Tracking

### Check Your Rankings

Use these free tools to track where you rank for keywords:

**Ubersuggest**
```
https://neilpatel.com/ubersuggest/
```

**Google Search Console**
```
Google Search Console → Performance → Queries
```
Shows exact search terms people use to find you.

---

## Weekly SEO Health Check

Run this checklist every week:

### Week 1-4: Foundation
- [ ] Site is indexed (site:YOURDOMAIN.com)
- [ ] Sitemap submitted in Google Search Console
- [ ] No coverage errors in Search Console
- [ ] Mobile-friendly test passes
- [ ] PageSpeed score > 70

### Month 2+: Growth
- [ ] Getting impressions in Search Console (>100/day)
- [ ] Getting clicks from Google (>5/day)
- [ ] Ranking for long-tail keywords
- [ ] Average position improving
- [ ] No technical SEO errors

### Month 3+: Optimization
- [ ] First page rankings for some keywords
- [ ] Growing organic traffic weekly
- [ ] Good CTR (>2%)
- [ ] Low bounce rate (<70%)
- [ ] Getting backlinks

---

## Common Issues & Fixes

### Issue: Site Not Indexed After 2 Weeks
**Fix:**
1. Check robots.txt doesn't block Google
2. Request indexing in Search Console
3. Submit sitemap again
4. Check for technical errors

### Issue: Sitemap Not Found (404)
**Fix:**
1. Ensure sitemap.xml is in /public folder
2. Deploy properly
3. Check file permissions
4. Test locally first

### Issue: Low Impressions
**Fix:**
1. Add more content (500+ words per page)
2. Target long-tail keywords
3. Build more backlinks
4. Create blog content

### Issue: High Impressions, Low Clicks
**Fix:**
1. Improve title tag (make it compelling)
2. Improve meta description
3. Add numbers/dates ("2025")
4. Add power words ("Free", "Best", "Easy")

---

## Emergency SEO Audit

If something goes wrong, run these checks:

```bash
# 1. Check if site is online
curl -I https://YOURDOMAIN.com

# 2. Check if robots.txt allows crawling
curl https://YOURDOMAIN.com/robots.txt

# 3. Check if sitemap exists
curl https://YOURDOMAIN.com/sitemap.xml

# 4. Check if meta tags exist
curl -s https://YOURDOMAIN.com | grep 'meta name="description"'

# 5. Check if structured data exists
curl -s https://YOURDOMAIN.com | grep 'application/ld+json'
```

All should return successful responses!

---

## Performance Benchmarks

### Good SEO Metrics:

**PageSpeed Insights:**
- Mobile: >70 (good), >90 (excellent)
- Desktop: >80 (good), >95 (excellent)

**Search Console (Month 3+):**
- Clicks: >50/day
- Impressions: >1,000/day  
- CTR: >3%
- Average Position: <20

**Google Rankings:**
- Month 1: Rank 50-100 for long-tail keywords
- Month 3: Rank 20-50 for medium keywords
- Month 6: Rank 10-30 for competitive keywords
- Month 12: Rank 1-10 for some keywords

---

## Quick Daily Check (30 seconds)

```bash
# Save this as check_seo.sh and run daily
#!/bin/bash

DOMAIN="YOURDOMAIN.com"

echo "🔍 Quick SEO Health Check"
echo "========================="
echo ""

echo "✓ Site Status:"
curl -Is https://$DOMAIN | head -1
echo ""

echo "✓ Sitemap:"
curl -Is https://$DOMAIN/sitemap.xml | head -1
echo ""

echo "✓ Robots.txt:"
curl -Is https://$DOMAIN/robots.txt | head -1
echo ""

echo "✓ Search Console:"
echo "Visit: https://search.google.com/search-console"
echo ""

echo "Done! ✨"
```

Make it executable:
```bash
chmod +x check_seo.sh
./check_seo.sh
```

---

## Resources

- **Google Search Console**: https://search.google.com/search-console
- **PageSpeed Insights**: https://pagespeed.web.dev
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Schema Validator**: https://validator.schema.org
- **Backlink Checker**: https://ahrefs.com/backlink-checker

---

**Pro Tip**: Set up Google Analytics to track all this automatically!
