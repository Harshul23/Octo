# Setup Checklist

Use this checklist to ensure you complete all setup steps correctly.

## ☐ Pre-Setup

- [ ] Node.js 16+ is installed (`node --version`)
- [ ] npm is installed (`npm --version`)
- [ ] You have a GitHub account
- [ ] Git is installed (optional, for version control)

---

## ☐ GitHub OAuth App Creation

- [ ] Visited https://github.com/settings/developers
- [ ] Clicked "OAuth Apps" → "New OAuth App"
- [ ] Set Application name: `Octo Dashboard` (or your choice)
- [ ] Set Homepage URL: `http://localhost:5173`
- [ ] Set Authorization callback URL: `http://localhost:5173/callback`
- [ ] Clicked "Register application"
- [ ] Copied **Client ID** (saved securely)
- [ ] Generated and copied **Client Secret** (saved securely)
- [ ] ⚠️ **Important**: Keep Client Secret private!

---

## ☐ Environment Configuration

### Frontend Environment (.env)

- [ ] Created `.env` file in project root
- [ ] Added `VITE_GITHUB_CLIENT_ID=your_client_id`
- [ ] Added `VITE_GITHUB_REDIRECT_URI=http://localhost:5173/callback`
- [ ] Verified no spaces around `=` signs
- [ ] Saved the file

### Backend Environment (server/.env)

- [ ] Created `server/.env` file
- [ ] Added `PORT=3001`
- [ ] Added `CLIENT_URL=http://localhost:5173`
- [ ] Added `GITHUB_CLIENT_ID=your_client_id`
- [ ] Added `GITHUB_CLIENT_SECRET=your_client_secret`
- [ ] Verified no spaces around `=` signs
- [ ] Saved the file

---

## ☐ Dependencies Installation

### Frontend Dependencies

- [ ] Ran `npm install` in project root
- [ ] No errors during installation
- [ ] `node_modules` folder created
- [ ] Optional: Ran `npm install concurrently` for dev:all script

### Backend Dependencies

- [ ] Navigated to `server/` directory
- [ ] Ran `npm install`
- [ ] No errors during installation
- [ ] `node_modules` folder created in server/

---

## ☐ File Verification

Check that these files exist:

### Created Files

- [ ] `src/context/AuthContext.jsx`
- [ ] `src/services/githubApi.js`
- [ ] `src/components/github-heatmap-calendar.jsx`
- [ ] `server/auth-server.js`
- [ ] `server/package.json`
- [ ] `.env` (in project root)
- [ ] `server/.env`

### Modified Files

- [ ] `src/App.jsx` (has AuthProvider)
- [ ] `src/components/login-form.jsx` (has GitHub button)
- [ ] `src/components/activity-timeline.jsx` (uses real data)
- [ ] `src/components/navbar.jsx` (shows user profile)
- [ ] `package.json` (has new scripts)

---

## ☐ Running the Application

### Backend Server (Terminal 1)

- [ ] Opened first terminal
- [ ] Navigated to project directory
- [ ] Ran `npm run dev:server`
- [ ] Saw: "GitHub OAuth proxy server running on http://localhost:3001"
- [ ] No error messages
- [ ] Server is running (don't close this terminal)

### Frontend Server (Terminal 2)

- [ ] Opened second terminal
- [ ] Navigated to project directory
- [ ] Ran `npm run dev`
- [ ] Saw: "Local: http://localhost:5173/"
- [ ] No error messages
- [ ] Server is running (don't close this terminal)

**OR Use Single Command:**

- [ ] Ran `npm run dev:all`
- [ ] Both servers started successfully
- [ ] Can see both SERVER and CLIENT logs

---

## ☐ Testing Authentication

### Initial Load

- [ ] Opened browser to http://localhost:5173
- [ ] Saw login page (not dashboard)
- [ ] "Login with GitHub" button is visible
- [ ] No console errors (F12 → Console)

### Login Flow

- [ ] Clicked "Login with GitHub"
- [ ] Redirected to GitHub (github.com/login/oauth/authorize)
- [ ] Saw authorization page listing permissions
- [ ] Clicked "Authorize [Your App Name]"
- [ ] Redirected back to http://localhost:5173
- [ ] Loading indicator appeared briefly
- [ ] Dashboard loaded successfully

### Dashboard Check

- [ ] Navbar shows your GitHub profile picture
- [ ] Greeting shows your name (e.g., "Good Morning, John")
- [ ] Stats card shows your public repos count
- [ ] Right sidebar is visible

---

## ☐ Feature Verification

### Contribution Heatmap

- [ ] Calendar grid is visible in right sidebar
- [ ] Squares show different shades of green
- [ ] Hovering over squares shows tooltip
- [ ] Tooltip displays contribution count and date
- [ ] Total contributions count is shown
- [ ] No "Loading..." or error messages

### Activity Timeline

- [ ] Timeline is visible below calendar
- [ ] Shows "Created X commits in Y repositories"
- [ ] Lists repository names with commit counts
- [ ] If you have PRs, they're displayed
- [ ] If you created repos, they're listed
- [ ] Clicking links opens GitHub in new tab

### User Profile

- [ ] Navbar shows your avatar
- [ ] Hovering over avatar shows menu
- [ ] Menu displays your name and username
- [ ] "Logout" button is visible in menu
- [ ] Middle section shows personalized greeting
- [ ] Stats show follower/following counts

---

## ☐ Logout Test

- [ ] Hovered over profile picture in navbar
- [ ] Clicked "Logout"
- [ ] Redirected to login page
- [ ] Dashboard is no longer accessible
- [ ] Clicking browser back doesn't show dashboard

---

## ☐ Re-Login Test

- [ ] Clicked "Login with GitHub" again
- [ ] Logged in successfully (may be automatic if still authorized)
- [ ] Dashboard loaded with all data
- [ ] Contribution heatmap displayed
- [ ] Activity timeline populated

---

## ☐ Browser Console Check

### No Errors

- [ ] Opened DevTools (F12)
- [ ] Clicked Console tab
- [ ] No red error messages
- [ ] API requests are successful (Network tab)
- [ ] Token is stored in localStorage (Application → Local Storage)

---

## ☐ Production Checklist (Optional)

Only complete if deploying to production:

- [ ] Created new GitHub OAuth app for production domain
- [ ] Updated production .env with new credentials
- [ ] Changed all URLs from localhost to production domain
- [ ] Built frontend: `npm run build`
- [ ] Deployed backend server to hosting service
- [ ] Deployed frontend to static hosting
- [ ] Tested production authentication flow
- [ ] Verified HTTPS is working
- [ ] Checked all features work in production

---

## 🎉 Completion Status

**Total Checkboxes**: 89

**Completed**: **\_** / 89

**Percentage**: **\_** %

---

## ❌ Common Issues

If you encounter problems, check:

### Authentication Fails

- [ ] Verify Client ID and Secret are correct
- [ ] Check callback URL matches exactly
- [ ] Ensure backend server is running
- [ ] Check CORS settings in server/.env

### Heatmap Not Loading

- [ ] Check browser console for errors
- [ ] Verify GitHub token has correct permissions
- [ ] Check API rate limit (should be 5000/hour)
- [ ] Ensure GraphQL query is formatted correctly

### Activity Timeline Empty

- [ ] Verify you have recent GitHub activity
- [ ] Check that events API is being called
- [ ] Ensure token is valid
- [ ] Try re-logging in

### Servers Won't Start

- [ ] Check if ports 3001 and 5173 are available
- [ ] Kill any processes using those ports
- [ ] Reinstall node_modules if necessary
- [ ] Check for missing dependencies

---

## 📝 Notes

Use this space for your own notes:

```
Date Started: ___________
Date Completed: ___________

Issues Encountered:
1.
2.
3.

Solutions Applied:
1.
2.
3.

Additional Customizations:
1.
2.
3.
```

---

## ✅ Final Sign-Off

- [ ] All features working correctly
- [ ] Documentation reviewed
- [ ] Environment variables configured
- [ ] Ready to use in development
- [ ] (Optional) Ready for production deployment

**Setup completed by**: ********\_\_\_********

**Date**: ********\_\_\_********

**Signature**: ********\_\_\_********

---

**Congratulations on completing the setup! 🎉**

For ongoing support, refer to:

- [INSTRUCTIONS.md](./INSTRUCTIONS.md) - Detailed guide
- [QUICK-START.md](./QUICK-START.md) - Quick reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System details
