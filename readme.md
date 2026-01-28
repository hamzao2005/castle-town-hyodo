# 🏰 Castle Town Hub

A web-based game inspired by Deltarune's Castle Town concept. Create your character, customize them with unique costumes, and see them displayed in a vibrant open town with other users! Admins can organize the town with categories, manage a public gallery, and create NPCs.

## ✨ Features

### For Users
- ✅ User registration and login with JWT authentication
- ✅ Character creation and customization (color, style, description)
- ✅ **NEW:** Upload custom costume images for your character
- ✅ Add personality traits and speech bubbles to your character
- ✅ View all characters in the shared open town
- ✅ Browse the town's public gallery with image navigation
- ✅ Characters are displayed with their custom appearance and messages

### For Administrators
- ✅ **NEW:** Create NPC (Non-Player Characters) without user accounts
- ✅ **NEW:** Award golden hearts (💛) to characters
- ✅ **NEW:** Create and manage categories (houses) for organizing characters
- ✅ **NEW:** Assign characters to categories
- ✅ **NEW:** Manage the town gallery (upload/delete images)
- ✅ **NEW:** Upload custom costumes for any character
- ✅ Move characters anywhere in the town (with coordinates or move mode)
- ✅ Add personality traits to characters
- ✅ Add items to character inventories
- ✅ Write character history entries
- ✅ Add interaction messages to characters

## 🎨 New Town Features

### Open Town View
The game now features a vibrant open town instead of the previous isometric room:
- 🌤️ **Sky with clouds** - Beautiful animated clouds
- 🌳 **Trees** - Decorative trees throughout the town
- 💡 **Streetlights** - Illuminated streetlights for ambiance
- 🛣️ **Streets** - Road with yellow lane markings
- 🏠 **Category Houses** - Each category gets a unique colored house
- 🖼️ **Gallery Wall** - Central display showing the current gallery image

### Golden Hearts System
Admins can award golden hearts to characters which appear above their sprites as a badge of honor.

### Category System
Organize characters into categories (e.g., "Merchants", "Guards", "Citizens"):
- Each category gets a unique colored house in the town
- Characters can be assigned to categories
- Houses display the category emoji and name

### Gallery Wall
A central billboard in the town displays images from the gallery:
- Navigate with ◀ ▶ buttons
- Admins can upload/delete images
- Images are automatically compressed for performance

### Custom Costumes
Both users and admins can upload custom character images:
- Images replace the default sprite
- Automatically compressed to 500KB
- Supports all common image formats

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

1. **Create NPCs:**
   - Enter a name and description
   - Click "Créer" to create an NPC
   - NPCs appear in the town like regular characters but have no login

2. **Award Golden Hearts:**
   - Select a character
   - Click + or - to adjust their golden hearts count
   - Hearts display above the character

3. **Manage Categories:**
   - Create new categories with custom names and colors
   - Each category gets a house in the town
   - Delete categories as needed

4. **Assign Characters to Categories:**
   - Select a character
   - Choose a category from the dropdown
   - Click "Assigner" to assign

5. **Manage Gallery:**
   - Upload images (supports multiple at once)
   - Images appear on the central gallery wall
   - Delete images from the admin panel

6. **Upload Costumes:**
   - Select a character
   - Choose an image file
   - Click "Appliquer" to set the custom costume
   - Click "Retirer" to remove it

7. **Move Characters:**
   - Click on a character to select them
   - Enter X and Y coordinates and click "Apply Coordinates"
   - OR click "Enable Move Mode" and click on the town canvas
   - Click "Disable Move Mode" when done

8. **Add Traits:**
   - Select a character
   - Enter a trait in the "Add Trait" field
   - Click "Add Trait"

9. **Add Items:**
   - Select a character
   - Enter an item in the "Add Item" field
   - Click "Add Item"

10. **Add History:**
    - Select a character
    - Enter a history entry
    - Click "Add History"

11. **Add Interactions:**
    - Select a character
    - Enter an interaction message
    - Click "Add Interaction"

## 🏗️ Architecture

### Backend (Node.js + Express)

```
server/
├── index.js              # Main server file
├── models/
│   ├── User.js          # User model with JSON storage
│   ├── Category.js      # Category model
│   └── Gallery.js       # Gallery model
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── utils/
│   └── sanitize.js      # Input sanitization
└── routes/
    ├── auth.js          # Authentication routes
    ├── characters.js    # Character routes
    ├── admin.js         # Admin routes
    ├── categories.js    # Category routes
    └── gallery.js       # Gallery routes
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
    ├── town.js         # Town rendering module (open town view)
    ├── categories.js   # Category management module
    ├── gallery.js      # Gallery display and management
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

Inspired by Deltarune's pixel art style with a vibrant open town:
- **Font:** Press Start 2P (retro pixel font)
- **Color Scheme:** Purple and gold theme
- **Background:** Open sky with animated clouds
- **Town Elements:** 
  - Green grass ground
  - Gray streets with yellow markings
  - Trees and streetlights
  - Category houses with custom colors
  - Central gallery wall with golden frame
- **Characters:** Customizable round or square sprites with eyes, or custom costume images
- **Golden Hearts:** Award badge displayed above characters
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
- `POST /api/admin/create-player` - Create NPC character
- `PUT /api/admin/hearts/:userId` - Update character's golden hearts
- `PUT /api/admin/assign-category/:userId` - Assign character to category
- `PUT /api/admin/costume/:userId` - Update character's costume (admin)
- `PUT /api/admin/move/:userId` - Move a character
- `POST /api/admin/trait/:userId` - Add trait to character
- `POST /api/admin/item/:userId` - Add item to character
- `POST /api/admin/history/:userId` - Add history entry
- `POST /api/admin/interact/:userId` - Add interaction

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get specific category
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Gallery
- `GET /api/gallery` - Get all gallery images
- `GET /api/gallery/:id` - Get specific image
- `POST /api/gallery` - Add image to gallery (admin)
- `PUT /api/gallery/order` - Reorder gallery images (admin)
- `DELETE /api/gallery/:id` - Delete gallery image (admin)

## 🗄️ Data Storage

Data is stored in JSON files in `server/data/`:

### Users (`users.json`)

```json
{
  "id": "uuid",
  "username": "string",
  "password": "hashed (null for NPCs)",
  "isAdmin": boolean,
  "isNPC": boolean,
  "character": {
    "name": "string",
    "color": "hex-color",
    "style": "round|square",
    "description": "string",
    "particularity": "string",
    "message": "string",
    "position": { "x": number, "y": number },
    "goldenHearts": number,
    "categoryId": "uuid|null",
    "costumeImage": "base64|null",
    "traits": [],
    "items": [],
    "history": [],
    "interactions": []
  },
  "createdAt": "ISO date"
}
```

### Categories (`categories.json`)

```json
{
  "id": "uuid",
  "name": "string",
  "color": "hex-color",
  "icon": "emoji",
  "position": { "x": number, "y": number },
  "createdAt": "ISO date"
}
```

### Gallery (`gallery.json`)

```json
[
  {
    "id": "uuid",
    "data": "base64-image-data",
    "title": "string",
    "addedAt": "ISO date"
  }
]
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
