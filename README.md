# Portfolio Builder

A professional portfolio builder web application with the following features:

## Features

- **4 Templates**: Modern Minimal, Creative Showcase, Professional Corporate, Dark Developer
- **Color & Font Customization**: 6 preset color schemes + custom color picker, 6 font families
- **Dynamic Content Management**: Add/remove projects, skills, experience, education entries
- **Profile Photo Upload**: Drag-and-drop or click to upload profile photo
- **Auto-Save Draft**: Work is saved automatically to localStorage (every 2 seconds after changes, and every 30 seconds)
- **Export as ZIP**: Downloads complete portfolio as HTML, CSS, assets in a ZIP file
- **Mobile-Friendly Preview**: Test desktop, tablet, and mobile views in real-time
- **Dark Mode**: Full dark theme support for both editor and exported portfolio
- **Responsive Design**: Works on all device sizes

## Getting Started

### Option 1: Open directly in browser
Simply open `public/index.html` in your browser.

### Option 2: Serve with a local server (recommended)
```bash
cd portfolio-builder/public
npx serve .
# or
python3 -m http.server 8000
# or
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

## Usage

1. **Fill in your profile** - Name, title, bio, contact info, social links
2. **Upload a profile photo** - Click "Upload Photo" in the Profile section
3. **Add projects** - Click "+ Add Project" to showcase your work
4. **Add skills** - Organize skills by category
5. **Add experience** - Work history with dates and descriptions
6. **Add education** - Degrees and institutions
7. **Customize appearance** - Choose template, colors, fonts, spacing
8. **Preview** - Use device buttons to test responsive design
9. **Export** - Click "Export ZIP" to download your complete portfolio

## Keyboard Shortcuts

- `Ctrl/Cmd + S` - Save draft
- `Ctrl/Cmd + E` - Export portfolio
- `Escape` - Close modals

## Project Structure

```
portfolio-builder/
├── public/
│   ├── index.html      # Main editor interface
│   ├── styles.css      # All styling
│   └── app.js          # Application logic
└── README.md
```

## Export Output

The exported ZIP contains:
- `index.html` - Complete portfolio page
- `styles.css` - Self-contained stylesheet
- `assets/profile-photo.*` - Your uploaded photo
- `README.md` - Deployment instructions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## No Dependencies

The editor uses only vanilla JavaScript. The exported portfolio has zero dependencies (except Google Fonts which are loaded via CDN).

## License

MIT - Feel free to use for personal or commercial projects.