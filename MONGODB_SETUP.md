# MongoDB Setup Guide

This guide will help you set up MongoDB for the Hungry Foodicsers backend. You have two options:

## Option 1: MongoDB Atlas (Cloud - Recommended for Beginners) ⭐

MongoDB Atlas is a cloud-hosted MongoDB service. It's free to start and easier to set up.

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (you can use Google/GitHub to sign in)

### Step 2: Create a Free Cluster

1. After signing in, click **"Build a Database"**
2. Choose the **FREE (M0)** tier
3. Select a cloud provider (AWS is fine)
4. Choose a region closest to you (e.g., `N. Virginia (us-east-1)` or `Europe (eu-west-1)`)
5. Give your cluster a name (e.g., "HungryFoodicsers")
6. Click **"Create"** (takes 1-3 minutes)

### Step 3: Create Database User

1. In the security section, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username (e.g., `foodics-admin`)
5. Enter a strong password (save it somewhere safe!)
6. Under "Database User Privileges", select **"Atlas admin"**
7. Click **"Add User"**

### Step 4: Whitelist Your IP Address

1. In the security section, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development, click **"Add Current IP Address"** (or **"Allow Access from Anywhere"** with `0.0.0.0/0` - less secure but easier for testing)
4. Click **"Confirm"**

### Step 5: Get Your Connection String

1. Go to **"Database"** section
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"5.5 or later"**
5. Copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update Your .env File

Replace the connection string in your `.env` file:

```env
MONGODB_URI=mongodb+srv://foodics-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hungry-foodicsers?retryWrites=true&w=majority
```

**Important:** 
- Replace `YOUR_PASSWORD` with the password you created in Step 3
- Replace `cluster0.xxxxx` with your actual cluster name
- The database name `hungry-foodicsers` will be created automatically

### Step 7: Test the Connection

1. Start your server: `npm run dev`
2. You should see: `✅ Connected to MongoDB`
3. If you see an error, check:
   - Password is correct (no special characters need URL encoding)
   - IP address is whitelisted
   - Connection string is correct

---

## Option 2: Local MongoDB Installation

If you prefer to run MongoDB on your computer:

### macOS Installation

#### Using Homebrew (Easiest)

1. Install Homebrew (if not installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install MongoDB:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

3. Start MongoDB:
   ```bash
   brew services start mongodb-community
   ```

4. Verify it's running:
   ```bash
   mongosh
   ```
   If you see a MongoDB shell prompt, it's working! Type `exit` to leave.

5. Update your `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hungry-foodicsers
   ```

#### Manual Installation

1. Download MongoDB from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Select: macOS, Package (.tgz), and your macOS version
3. Extract and move to `/usr/local/mongodb`
4. Create data directory:
   ```bash
   sudo mkdir -p /data/db
   sudo chown -R $(whoami) /data/db
   ```
5. Start MongoDB:
   ```bash
   /usr/local/mongodb/bin/mongod
   ```

### Windows Installation

1. Download MongoDB from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Select: Windows, MSI installer
3. Run the installer:
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Check "Install MongoDB Compass" (GUI tool - optional but helpful)
4. MongoDB will start automatically as a Windows service
5. Update your `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hungry-foodicsers
   ```

### Linux Installation

#### Ubuntu/Debian

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## Verify MongoDB is Working

### Test Connection

1. Start your server:
   ```bash
   npm run dev
   ```

2. You should see:
   ```
   ✅ Connected to MongoDB
   🚀 Server running on port 3000
   ```

### Test with MongoDB Shell

#### If using MongoDB Atlas:
- Use MongoDB Compass (download from [mongodb.com/products/compass](https://www.mongodb.com/products/compass))
- Connect using your connection string

#### If using Local MongoDB:
```bash
mongosh
```

Then in the shell:
```javascript
use hungry-foodicsers
db.offices.insertOne({ name: "Test Office", location: "Test" })
db.offices.find()
```

---

## Common Issues & Solutions

### Issue: "MongoServerError: Authentication failed"

**Solution:**
- Check your username and password in the connection string
- Make sure special characters in password are URL-encoded (e.g., `@` becomes `%40`)

### Issue: "MongoServerError: IP not whitelisted"

**Solution:**
- Go to MongoDB Atlas → Network Access
- Add your current IP address or use `0.0.0.0/0` for development

### Issue: "Cannot connect to MongoDB"

**Solution:**
- Check if MongoDB service is running (local installation)
- Verify connection string is correct
- Check firewall settings
- For Atlas: Make sure cluster is not paused

### Issue: "Connection timeout"

**Solution:**
- Check internet connection (for Atlas)
- Verify IP is whitelisted
- Try increasing timeout in connection string:
  ```
  ?retryWrites=true&w=majority&serverSelectionTimeoutMS=5000
  ```

---

## Recommended: MongoDB Compass (GUI Tool)

MongoDB Compass is a visual tool to view and manage your database:

1. Download from [https://www.mongodb.com/products/compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Browse collections, documents, and run queries visually

---

## Next Steps

Once MongoDB is set up:

1. ✅ Update `.env` with your connection string
2. ✅ Start your server: `npm run dev`
3. ✅ Run seed script: `npm run seed`
4. ✅ Test the API!

---

## Which Option Should I Choose?

- **MongoDB Atlas (Cloud)**: Best for beginners, no installation needed, free tier available
- **Local MongoDB**: Better for offline development, full control, no internet needed

For learning and development, **MongoDB Atlas is recommended** because:
- ✅ No installation required
- ✅ Works on any OS
- ✅ Free tier is generous
- ✅ Easy to share with team
- ✅ Automatic backups
