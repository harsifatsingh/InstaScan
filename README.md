# InstaScan 🚀

**Find out who doesn't follow you back on Instagram — all processed locally in your browser for maximum privacy.**

Live Site: [https://instascan.netlify.app/](https://instascan.netlify.app/)

![InstaScan Preview](./img/Screenshot%202025-05-09%20at%207.16.11 PM.png)

---

## 🌟 Key Features

* **Privacy-First:** 100% client-side processing. Your data never leaves your device.
* **Lightning-Fast Analysis:** Instantly parse your Instagram JSON export using modern JavaScript and JSZip.
* **Comprehensive Data Support:** Auto-detects followers and following JSON structures, even if Instagram nests them in subfolders.
* **Interactive Dashboard:** View total counts for Followers, Following, and Users Not Following You Back.
* **Unfollowers and Fans Lists:** See who you follow that doesn’t follow you back, and vice versa.
* **CSV Export:** Download your lists in CSV format with a single click.
* **Drag & Drop:** Simply drag your ZIP file onto the upload area for instant selection.
* **Light & Dark Mode:** Toggle between themes to match your style.
* **Responsive & Accessible:** Designed to work on desktop and mobile browsers with clear, readable typography.

---

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/harsifatsingh/InstaScan.git
   cd InstaScan
   ```

2. **Open `index.html`**

   * No build tools required — just open in any modern browser (Chrome, Firefox, Edge, Safari).

3. **Upload Your Instagram Data**

   * Request your data from Instagram in JSON format (only Followers & Following recommended).
   * Drag & drop the downloaded ZIP file or click **Choose ZIP File** to select it.

4. **Analyze**

   * Click **Analyze Now** to instantly reveal your follower metrics and unfollowers list.

5. **Export Your List**

   * Click **Export to CSV** on any list to download a CSV report you can open in Excel or Google Sheets.

---

## 🛠️ Under the Hood

* **JSZip** for client-side ZIP extraction and JSON parsing.
* **Vanilla JavaScript** with modular functions to detect multiple JSON formats and safely extract nested data.
* **CSS Custom Properties** for dynamic theming (light/dark mode) and smooth transitions.
* **Responsive Grid & Flexbox** layout for modern, mobile-friendly design.
* **Font Awesome Icons** and Google Fonts for a polished UI.

---

## 🎨 Customization

* **Colors & Theme**: Tweak CSS variables in `styles.css` under `:root` or `.light-mode`.
* **Iconography**: Swap Font Awesome icons or add custom SVGs in the HTML.
* **Export Formats**: Extend `exportToCSV()` in `follow.js` to support JSON or XLSX downloads.

---

## 🚾 Troubleshooting

1. **"Could not locate followers or following JSON files"**

   * Ensure you’re uploading the correct inner `instagram_data.zip`.
   * Re-request your data from Instagram, selecting only Followers & Following.

2. **Format Errors**

   * Instagram occasionally updates export structure. Check for `relationships_followers.json` or nesting under `connections/`.

3. **Analyze Button Unresponsive**

   * Make sure a valid ZIP file is selected; check browser console for errors.

4. **Large File Performance**

   * Request only Followers & Following to reduce file size and speed up parsing.

---

## 🤝 Contributing

1. Fork this repo.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m "feat: Add your feature"`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request and let’s make InstaScan even better!

---

**Made with ❤️ by Harsifat Singh — because your privacy matters.**
