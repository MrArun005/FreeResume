# Formspree Setup Guide

This guide will help you set up Formspree to receive feedback emails from your landing page.

## 📝 Step 1: Create a Formspree Account

1. Go to [https://formspree.io](https://formspree.io)
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up using:
    - Email + Password, or
    - GitHub, or
    - Google

> **Note**: The free tier includes **50 submissions per month**, which is usually enough for most personal projects.

## 🎯 Step 2: Create a New Form

1. After signing in, click **"+ New Form"** button
2. Give your form a name: **"Free Resume Feedback"** (or anything you like)
3. Click **"Create"**

## 🔑 Step 3: Get Your Form ID

After creating the form, you'll see a page with your form details. Look for:

**Form Endpoint:**

```
https://formspree.io/f/YOUR_FORM_ID
```

Copy the **`YOUR_FORM_ID`** part (it looks like `xpznqwer` or similar random characters).

## 🛠️ Step 4: Add Form ID to Your Code

1. Open [LandingPage.jsx](file:///Users/arunmallikarjun/Downloads/youtube-channel-search/my-resume/src/components/pages/LandingPage.jsx)
2. Find line **~468** (search for `YOUR_FORM_ID`):

```javascript
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
```

3. Replace `YOUR_FORM_ID` with your actual Form ID:

```javascript
const response = await fetch('https://formspree.io/f/xpznqwer', {
```

4. Save the file

## ✅ Step 5: Test It!

1. Go to your landing page
2. Scroll to the **"Help Us Grow"** section
3. Fill out the feedback form with test data
4. Click **"Send Feedback"**
5. You should see a success message! ✅

## 📧 Step 6: Check Your Email

1. Go to your email inbox (the one you used to sign up for Formspree)
2. You should receive an email with the feedback!
3. **First submission?** Formspree will send you a confirmation email - click the link to verify

## 🎨 Optional: Formspree Dashboard

- View all submissions in the Formspree dashboard: [https://formspree.io/forms](https://formspree.io/forms)
- See analytics, spam filtering, and more
- Export submissions as CSV

## 🚨 Troubleshooting

### "Failed to send feedback" error

- **Check Form ID**: Make sure you replaced `YOUR_FORM_ID` correctly
- **Verify Email**: Check if you verified your email with Formspree
- **Check Console**: Open browser dev tools (F12) and check Console tab for errors

### Not receiving emails

- **Check Spam folder**
- **Verify your Formspree email** (they send a confirmation link on first use)
- **Check form status** in Formspree dashboard

### Monthly limit reached

- Free tier: 50 submissions/month
- Upgrade to paid plan or wait for next month
- Consider alternative: EmailJS, Firebase, etc.

## 🎉 Done!

Your feedback form is now live and connected to your email. Every submission will be sent directly to your inbox!

---

## 📚 Additional Resources

- [Formspree Documentation](https://help.formspree.io/)
- [Formspree Pricing](https://formspree.io/pricing)
- Alternative platforms: EmailJS, Basin, Getform
