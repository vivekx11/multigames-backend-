# Push Backend to GitHub

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `multigames-backend`
3. Description: "Real-time multiplayer game server for Flutter MultiGames app"
4. Keep it **Public** (for free Render deployment)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 2: Push Code

After creating the repository, run these commands:

```bash
cd backend

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/multigames-backend.git

# Push code
git branch -M main
git push -u origin main
```

## Step 3: Verify

Go to https://github.com/YOUR_USERNAME/multigames-backend
You should see all backend files.

## Step 4: Deploy to Render

Now you can deploy to Render:

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select `multigames-backend` repository
5. Configure:
   - Name: multigames-backend
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables:
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: *
7. Click "Create Web Service"

## Step 5: Update Flutter App

After deployment, copy your Render URL (e.g., https://multigames-backend.onrender.com)

Update `lib/config/socket_config.dart`:
```dart
static const String serverUrl = 'https://multigames-backend.onrender.com';
```

Done! 🎉
