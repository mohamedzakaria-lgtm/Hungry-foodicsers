# How to Get Google Client ID - Step by Step

Quick guide to get your Google OAuth Client ID and Client Secret.

---

## 🚀 Quick Steps

### **Step 1: Go to Google Cloud Console**

1. Visit: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Sign in with your Google account

---

### **Step 2: Create or Select Project**

1. Click **"Select a project"** (top bar)
2. Click **"New Project"**
3. Enter project name: `Hungry Foodicsers` (or any name)
4. Click **"Create"**
5. Wait a few seconds for project creation
6. Select the project from the dropdown

---

### **Step 3: Configure OAuth Consent Screen**

1. In the left sidebar, go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have Google Workspace)
3. Click **"Create"**

**Fill in the form:**
- **App name:** `Hungry Foodicsers`
- **User support email:** Your email
- **Developer contact information:** Your email
- Click **"Save and Continue"**

**Scopes:**
- Click **"Add or Remove Scopes"**
- Add: `email`, `profile`, `openid`
- Click **"Update"** → **"Save and Continue"**

**Test users (if in testing mode):**
- Add test users (optional for now)
- Click **"Save and Continue"**

**Summary:**
- Review and click **"Back to Dashboard"**

---

### **Step 4: Create OAuth 2.0 Credentials**

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** (top bar)
3. Select **"OAuth client ID"**

**If prompted:**
- Application type: **"Web application"**
- Name: `Hungry Foodicsers Web Client`

**Fill in:**
- **Name:** `Hungry Foodicsers Web Client` (or any name)

**Authorized JavaScript origins:**
- Click **"+ ADD URI"**
- Add: `https://hungry-foodicsers--mohamedzakari21.replit.app`
- (For local testing, also add: `http://localhost:3000`)

**Authorized redirect URIs:**
- Click **"+ ADD URI"**
- Add: `https://hungry-foodicsers--mohamedzakari21.replit.app/api/auth/google/callback`
- (For local testing, also add: `http://localhost:3000/api/auth/google/callback`)

4. Click **"CREATE"**

---

### **Step 5: Copy Your Credentials**

After clicking "CREATE", a popup will show:

**✅ Your Client ID:**
```
123456789-abc123def456.apps.googleusercontent.com
832445831329-gviptvjlb3c1v1h69lgiqroih100m6dn.apps.googleusercontent.com
```
**Copy this!**

**✅ Your Client Secret:**
```
GOCSPX-abc123def456ghi789
```
**Copy this!**

**⚠️ Important:** This is the only time you'll see the Client Secret! Save it immediately.

---

## 📋 What You'll Get

After completing the steps, you'll have:

1. **Client ID** - Looks like: `123456789-abc123def456.apps.googleusercontent.com`
2. **Client Secret** - Looks like: `GOCSPX-abc123def456ghi789`

---

## 🔧 Add to Replit Secrets

In Replit, add these as Secrets:

**Secret 1:**
- Name: `GOOGLE_CLIENT_ID`
- Value: `123456789-abc123def456.apps.googleusercontent.com`

**Secret 2:**
- Name: `GOOGLE_CLIENT_SECRET`
- Value: `GOCSPX-abc123def456ghi789`

**Secret 3:**
- Name: `GOOGLE_CALLBACK_URL`
- Value: `https://hungry-foodicsers--mohamedzakari21.replit.app/api/auth/google/callback`

---

## 🖼️ Visual Guide

### **Where to Find Credentials Later:**

If you need to view them again:

1. Go to **"APIs & Services"** → **"Credentials"**
2. Find your OAuth 2.0 Client ID
3. Click on it to view details
4. **Note:** Client Secret is hidden (shows as dots)
5. If you lost it, you'll need to create new credentials

---

## ✅ Verification Checklist

- [ ] Project created in Google Cloud Console
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Client ID copied
- [ ] Client Secret copied (saved securely!)
- [ ] Authorized redirect URI added (your Replit URL)
- [ ] Added to Replit Secrets

---

## 🔍 Common Issues

### **Issue: "redirect_uri_mismatch"**

**Solution:**
- Make sure redirect URI in Google Console **exactly matches** your Replit URL
- Include the full path: `/api/auth/google/callback`
- No trailing slashes
- Use `https://` (not `http://`)

### **Issue: "Access blocked: This app's request is invalid"**

**Solution:**
- Your app might be in testing mode
- Add test users in OAuth consent screen
- Or publish your app (for production)

### **Issue: Can't find Client Secret**

**Solution:**
- Client Secret is only shown once when created
- If you lost it, create new credentials
- Or reset the secret (creates a new one)

---

## 📝 Quick Reference

**Your Replit URL:**
```
https://hungry-foodicsers--mohamedzakari21.replit.app
```

**Callback URL:**
```
https://hungry-foodicsers--mohamedzakari21.replit.app/api/auth/google/callback
```

**For Local Testing:**
```
http://localhost:3000/api/auth/google/callback
```

---

## 🎯 Summary

1. **Go to:** [console.cloud.google.com](https://console.cloud.google.com/)
2. **Create project** (or select existing)
3. **Configure OAuth consent screen**
4. **Create OAuth 2.0 credentials** (Web application)
5. **Add redirect URI:** Your Replit URL + `/api/auth/google/callback`
6. **Copy Client ID and Client Secret**
7. **Add to Replit Secrets**

**Time:** ~5-10 minutes

---

## 💡 Pro Tips

1. **Save Client Secret immediately** - You won't see it again!
2. **Use same credentials** for local and production (or create separate ones)
3. **Test redirect URI** matches exactly (case-sensitive)
4. **Add localhost** for local testing if needed

---

**That's it! You now have your Google Client ID and Secret!** 🎉
