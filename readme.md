# 🏰 Castle Town Hub

A web-based game inspired by Deltarune's Castle Town concept. Create your character, customize them, and see them displayed in a shared town with other users!

## ✨ Features

### For Users
- ✅ User registration and login with JWT authentication
- ✅ Character creation and customization (color, style, description)
- ✅ Add personality traits and speech bubbles to your character
- ✅ View all characters in the shared Castle Town
- ✅ Characters are displayed with their custom appearance and messages
- ❌ Users cannot move or interact (admin-only feature)

### For Administrators
- ✅ Move characters anywhere in the town
- ✅ Add personality traits to characters
- ✅ Add items to character inventories
- ✅ Write character history entries
- ✅ Add interaction messages to characters

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hamzao2005/castle-town-hyodo.git
cd castle-town-hyodo
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Edit `.env` and set your configuration:
```
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## 🎮 How to Use

### Creating an Account

1. Click the **Register** button on the welcome screen
2. Enter a username (minimum 3 characters) and password (minimum 6 characters)
3. Customize your character:
   - Choose a color
   - Select a style (round or square)
   - Add a description
   - Add a particularity
   - Set your speech bubble message
4. Click **Save Character** to complete registration

### Logging In

1. Enter your username and password
2. Click **Login**
3. You'll be taken to the Castle Town view

### Viewing the Town

- Your character and all other characters are displayed in the town
- Click on any character to view their information
- The town automatically refreshes every 30 seconds

### Editing Your Character

1. Click the **Edit Character** button in the top bar
2. Update your character's appearance and information
3. Click **Save Character**

### Admin Features

**Note:** The first user to register automatically becomes an admin. Users with the username "admin" also become admins.

As an admin, you have access to the Admin Panel:

1. **Move Characters:**
   - Click on a character to select them
   - Click "Enable Move Mode"
   - Click anywhere in the town to move the character
   - Click "Disable Move Mode" when done

2. **Add Traits:**
   - Select a character
   - Enter a trait in the "Add Trait" field
   - Click "Add Trait"

3. **Add Items:**
   - Select a character
   - Enter an item in the "Add Item" field
   - Click "Add Item"

4. **Add History:**
   - Select a character
   - Enter a history entry
   - Click "Add History"

5. **Add Interactions:**
   - Select a character
   - Enter an interaction message
   - Click "Add Interaction"

## 🏗️ Architecture

### Backend (Node.js + Express)

```
server/
├── index.js              # Main server file
├── models/
│   └── User.js          # User model with JSON storage
├── middleware/
│   └── auth.js          # JWT authentication middleware
└── routes/
    ├── auth.js          # Authentication routes
    ├── characters.js    # Character routes
    └── admin.js         # Admin routes
```

### Frontend (Vanilla JavaScript)

```
public/
├── index.html           # Main HTML file
├── css/
│   └── style.css       # Pixel art inspired styles
└── js/
    ├── api.js          # API client
    ├── auth.js         # Authentication module
    ├── character.js    # Character customization module
    ├── town.js         # Town rendering module
    ├── admin.js        # Admin controls module
    └── app.js          # Main application entry point
```

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- XSS protection on all user inputs
- Admin-only routes protected by middleware
- CORS enabled for API requests

## 🎨 Visual Design

Inspired by Deltarune's pixel art style:
- **Font:** Press Start 2P (retro pixel font)
- **Color Scheme:** Purple and gold theme
- **Background:** Starry night sky gradient
- **Buildings:** Pixel art castle, shop, and house
- **Characters:** Customizable round or square sprites with eyes
- **Speech Bubbles:** White bubbles with custom messages

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify` - Verify JWT token

### Characters
- `GET /api/characters` - Get all characters
- `GET /api/characters/:id` - Get specific character
- `PUT /api/characters/me` - Update own character

### Admin (Protected)
- `PUT /api/admin/move/:userId` - Move a character
- `POST /api/admin/trait/:userId` - Add trait to character
- `POST /api/admin/item/:userId` - Add item to character
- `POST /api/admin/history/:userId` - Add history entry
- `POST /api/admin/interact/:userId` - Add interaction

## 🗄️ Data Storage

User data is stored in `server/data/users.json` in the following format:

```json
{
  "id": "uuid",
  "username": "string",
  "password": "hashed",
  "isAdmin": boolean,
  "character": {
    "name": "string",
    "color": "hex-color",
    "style": "round|square",
    "description": "string",
    "particularity": "string",
    "message": "string",
    "position": { "x": number, "y": number },
    "traits": [],
    "items": [],
    "history": [],
    "interactions": []
  },
  "createdAt": "ISO date"
}
```

## 🛠️ Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

### Project Structure

- `/server` - Backend code
- `/public` - Frontend static files
- `.env` - Environment variables (create from .env.example)
- `package.json` - Dependencies and scripts

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

Inspired by Deltarune's Castle Town by Toby Fox.

## 🐛 Troubleshooting

**Server won't start:**
- Make sure you've run `npm install`
- Check that port 3000 is not already in use
- Verify `.env` file exists and is configured correctly

**Can't login:**
- Check that you've registered an account
- Verify your username and password are correct
- Check browser console for errors

**Characters not showing:**
- Make sure you're logged in
- Check browser console for errors
- Try refreshing the page

## 📞 Support

For issues and questions, please open an issue on the GitHub repository.
