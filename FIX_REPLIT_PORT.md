# Fix Replit Port Configuration Error

## 🔴 Error Message

```
forwarding local port 5000 to external port 80 (mapped as 1104)
🚀 Server running on port 3000
a port configuration was specified but the required port was never opened
```

**Problem:** Replit expects port 5000, but your app is using port 3000.

---

## ✅ Solution

### **Step 1: Update .replit File**

I've updated the `.replit` file. Make sure it has:

```toml
language = "nodejs"
run = "node server.js"
entrypoint = "server.js"

[deploy]
run = ["sh", "-c", "node server.js"]

[env]
PORT = "5000"

[ports]
localPort = 5000
externalPort = 80
```

**Key changes:**
- `PORT = "5000"` (Replit expects this)
- Added `[ports]` section with `localPort = 5000`

### **Step 2: Update Replit Secrets**

In Replit Secrets, make sure:

```
PORT=5000
```

**OR** remove PORT from secrets (let .replit file handle it)

### **Step 3: Restart Repl**

1. Click **"Stop"**
2. Click **"Run"**
3. Check logs - should see:
   ```
   🚀 Server running on port 5000
   ```

---

## 🔍 Why Port 5000?

Replit's deployment system:
- Uses **port 5000** as the local port
- Maps it to **port 80** externally
- Your app **must** listen on port 5000

---

## 📝 Quick Fix Checklist

- [ ] `.replit` file has `PORT = "5000"` in `[env]` section
- [ ] `.replit` file has `[ports]` section with `localPort = 5000`
- [ ] Replit Secrets: `PORT=5000` (or remove it, let .replit handle it)
- [ ] Server code uses `process.env.PORT` (✅ already does)
- [ ] Restart Repl
- [ ] Check logs show: `🚀 Server running on port 5000`

---

## 🧪 Verify It Works

After restart, check logs:

**Should see:**
```
🚀 Server running on port 5000
📡 Listening on 0.0.0.0:5000
✅ Connected to MongoDB
```

**Test API:**
```bash
curl https://hungry-foodicsers--mohamedzakari21.replit.app/health
```

---

## 💡 Important Notes

1. **Replit uses port 5000** - This is fixed, can't change it
2. **Your server code is fine** - It already uses `process.env.PORT`
3. **Just need to set PORT=5000** - Either in .replit file or Secrets

---

## 🔄 Alternative: Let Replit Auto-Detect

If the above doesn't work, try removing PORT from Secrets and let Replit set it automatically. The `.replit` file should handle it.

---

## ✅ Summary

**The fix:**
1. ✅ Updated `.replit` file with `PORT = "5000"` and `[ports]` section
2. ✅ Server code already uses `process.env.PORT` (good!)
3. ⚠️ Make sure Replit Secrets has `PORT=5000` OR remove it
4. ⚠️ Restart your Repl

**After this, your app should listen on port 5000 and Replit will be happy!** 🎉
