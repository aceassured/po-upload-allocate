# PO Upload & Allocate

A web application built with Flask that streamlines the process of uploading Purchase Order (PO) PDFs, allocating quantities, distributing items into boxes, and generating QR codes for each box. This tool automates extraction of item details from a PO, allows interactive allocation and distribution, and produces a summarized view with QR codes for easy scanning.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Requirements](#requirements)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Usage](#usage)

   * [1. Upload & Allocate](#1-upload--allocate)
   * [2. Distribute](#2-distribute)
   * [3. Summary & QR Generation](#3-summary--qr-generation)
7. [Technical Details](#technical-details)

   * [Backend (`app.py`)](#backend-apppy)
   * [Templates (HTML)](#templates-html)
   * [Static Assets (CSS & JS)](#static-assets-css--js)
   * [PDF Extraction](#pdf-extraction)
   * [QR Code API](#qr-code-api)
8. [Future Improvements](#future-improvements)
9. [License](#license)

---

## Overview

This application targets warehouse or logistics teams that receive Purchase Order PDFs containing a table of items (name, item number, and requested quantity). Instead of manually copying data into spreadsheets, this tool:

1. **Extracts** the first-page table from a PO PDF.
2. **Displays** the items in a dynamic allocation interface where a user can specify how many units to allocate from the requested quantity.
3. **Distributes** allocated quantities into up to three boxes (configurable), allowing the user to enter box-specific quantities per item.
4. **Generates** a summary view showing each box’s contents, total quantities, and a QR code encoding a JSON payload for that box.

This results in a QR-coded packing slip for each box for quick scanning in downstream workflows (warehouse scanners, mobile apps, etc.).

---

## Features

* **PDF Upload & Preview**

  * Drag-and-drop or browse to select a PDF file.
  * Inline preview of the first page of the PDF.
  * Automatic extraction of tabular data (Item Name, Item Number, Requested Quantity) using [pdfplumber](https://github.com/jsvine/pdfplumber).

* **Allocation Interface**

  * Displays all extracted items in a table.
  * Input field per item to specify the **allocated quantity** (must be ≤ requested).
  * “Next” button becomes available after allocation.

* **Distribution Interface**

  * Once allocation is saved, navigate to “Distribute” view.
  * Displays each item’s name, item number, and allocated quantity.
  * Three input columns (Box 1, Box 2, Box 3) to choose how many units of each item go into each box.
  * Input fields enforce a minimum of 0 and a maximum equal to the allocated quantity.
  * Stores distribution data in browser `localStorage`.

* **Summary & QR Code Generation**

  * Reads distribution data from `localStorage`.
  * Groups items by the box they belong to (Box 1, Box 2, Box 3).
  * Calculates total units per box.
  * Sends a JSON payload (box number, items array, total) to a Flask QR-code endpoint.
  * Displays for each box:

    * List of items & quantities
    * Total quantity
    * QR code image (PNG) generated on-the-fly.

* **Persistent File Storage**

  * Uploaded PDFs are saved in an `uploads/` directory.
  * Secure filename handling via `werkzeug.utils.secure_filename`.
  * Endpoint to serve uploaded PDFs for preview.

---

## Requirements

1. **Python 3.8+**
2. **Flask** – lightweight WSGI web framework
3. **pdfplumber** – for reading/extracting tables from PDFs
4. **qrcode** – to generate QR codes as PNG images
5. **Werkzeug** – for secure filename handling (bundled with Flask)
6. A modern browser (Chrome/Firefox/Edge) with JavaScript enabled

**Optional (recommended)**

* [`pipenv`](https://pipenv.pypa.io/) or `virtualenv` for isolated environments
* `gunicorn` or similar WSGI server for production deployments

---

## Project Structure

```
po-upload-allocate/
├── app.py
├── uploads/
│   └── list_po.pdf           # (Sample PO used for testing)
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── upload.js
│       ├── upload_allocate.js
│       ├── distribution.js
│       └── summary.js
├── templates/
│   ├── base.html
│   ├── upload.html
│   ├── upload_allocate.html
│   ├── distribution.html
│   └── summary.html
└── README.md
```

* **`app.py`**

  * Core Flask application: routes, APIs, PDF extraction logic, QR code generation.

* **`uploads/`**

  * Stores user-uploaded PDF files. Automatically created if missing.

* **`static/`**

  * **css/style.css** – global styles (Tailwind-like utility classes and custom rules).
  * **js/\*** – page-specific JavaScript to handle drag-and-drop, form population, `localStorage`, and AJAX calls.

* **`templates/`**

  * Jinja2 HTML templates.
  * **base.html** – common layout (nav bar, `<head>`, CSS/JS includes).
  * **upload\_allocate.html** – initial page where users upload PDF and allocate quantities.
  * **distribution.html** – page for distributing allocated quantities into boxes.
  * **summary.html** – final summary with QR code display.

---

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/po-upload-allocate.git
   cd po-upload-allocate
   ```

2. **Create a virtual environment (recommended)**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate          # Linux/macOS
   .venv\Scripts\activate             # Windows
   ```

3. **Install dependencies**

   ```bash
   pip install --upgrade pip
   pip install flask pdfplumber qrcode
   ```

4. **Run the application**

   ```bash
   python app.py
   ```

   By default, Flask will start on `http://127.0.0.1:5000` in debug mode. Navigate to that URL in your browser.

---

## Usage

### 1. Upload & Allocate

1. **Navigate** to `http://127.0.0.1:5000/`.
2. You will see a **drag-and-drop area** (or a “Browse” button) prompting you to upload a PDF.
3. **Drag a PO PDF** (containing a table on its first page with columns “Item Name”, “Item Number”, “Requested Quantity”).
4. Once uploaded, the first page is previewed (inline), and a table appears below showing each row extracted via `pdfplumber`.
5. In the **“Allocated Quantity”** column next to each item, enter a numeric value ≤ the requested quantity.
6. Click **“Next”** to save allocations and move to distribution.

### 2. Distribute

1. You’re redirected to `/distribute`.
2. A table lists all items with their **Name**, **Item Number**, **Requested**, and **Allocated** quantities.
3. For each item row, there are three input fields labeled **Box 1**, **Box 2**, **Box 3**.
4. Enter how many units of that item should go into each box. Input values are constrained between `0` and the item’s allocated quantity.
5. Click **“Next”** to store the distribution data in `localStorage` and proceed to summary.

### 3. Summary & QR Generation

1. On `/summary`, JavaScript reads distribution data from `localStorage`.
2. Items are grouped by box (i.e., Box 1, Box 2, Box 3).
3. For each box:

   * A card is rendered displaying:

     * **Box number** (e.g., Box 1)
     * **List of items** with their allocated quantities in that box
     * **Total quantity** of all items in that box
     * A **QR code** (PNG) generated by the backend.

   The QR code’s JSON payload is of the form:

   ```json
   {
     "box": 1,
     "items": [
       { "name": "Item A", "qty": 5 },
       { "name": "Item B", "qty": 3 }
     ],
     "total": 8
   }
   ```
4. Right-click or scan the QR codes to verify contents. You can print these or integrate them into downstream packing processes.

---

## Technical Details

### Backend (`app.py`)

* **Routes**

  * `GET /` → Renders `upload_allocate.html`.
  * `GET /distribute` → Renders `distribution.html`.
  * `GET /summary` → Renders `summary.html`.
  * `GET /uploads/<filename>` → Serves uploaded PDF files from `uploads/` folder.

* **API Endpoints**

  * `POST /api/upload`

    * Accepts a PDF file (`multipart/form-data`).
    * Validates extension (`.pdf`).
    * Saves file under `uploads/` with a secure filename.
    * Opens it via `pdfplumber`, extracts the first page’s table.
    * Returns JSON:

      ```json
      {
        "items": [
          { "name": "Widget X", "number": "WX-100", "requested": 10 },
        ],
        "pdf_url": "/uploads/list_po.pdf"
      }
      ```
  * `POST /api/qr`

    * Accepts JSON payload in the form `{ "data": <any string> }`.
    * Uses `qrcode` library to generate a PNG image in memory.
    * Returns the PNG as an image response (`image/png`).

* **Utilities**

  * `allowed_file(filename)` – Checks that the uploaded file has a `.pdf` extension.
  * `secure_filename` – Prevents directory traversal or invalid characters.

### Templates (HTML)

All templates extend `base.html`, which includes common `<head>` imports (Tailwind CSS CDN or custom CSS), a navigation header, and the basic layout. Each page has its own content block:

1. **`upload_allocate.html`**

   * Drop-zone for PDF (drag & drop or file browse).
   * Hidden PDF preview container (`<iframe>` pointing to `/uploads/<filename>`).
   * Allocation table dynamically populated by `upload_allocate.js`.
   * “Next” button to save allocations.

2. **`distribution.html`**

   * Table with headers: Item | Requested | Allocated | Box 1 | Box 2 | Box 3.
   * Populated in `distribution.js` using `localStorage` data.
   * “Next” button to save box allocations and redirect.

3. **`summary.html`**

   * A flex-grid container (`<div id="summaryGrid">`) that holds one card per box.
   * Cards are generated by `summary.js`. Each card includes a `<ul>` listing items, a total, and an `<img>` for the QR code returned from `/api/qr`.

4. **`distribution.html` and `summary.html`** share the same base styles and nav bar.

### Static Assets (CSS & JS)

* **CSS** (`static/css/style.css`)

  * Basic classes for table styling, button styling, form inputs, and responsiveness.
  * Utility classes (e.g., `.hidden`, `.p-4`, `.bg-white`, `.rounded-xl`, etc.).

* **JavaScript** (`static/js/*`)

  * **`upload.js`** – Handles drag-and-drop events, file preview, and sending FormData to `/api/upload`. On success, populates the allocation table via `upload_allocate.js`.
  * **`upload_allocate.js`** –

    * Reads JSON response from `/api/upload`.
    * Fills an HTML `<table>` with each item’s details.
    * Renders an `<input>` for “Allocated Quantity” with `min="0"` and `max=requested`.
    * Once allocations are entered, clicking “Next” saves an array of objects (`[{name, number, requested, allocated}, …]`) into `localStorage` under key `"poItems"`, then redirects to `/distribute`.
  * **`distribution.js`** –

    * Reads `poItems` from `localStorage`.
    * For each item, populates a row with three `<input>` fields (`box1_i`, `box2_i`, `box3_i`) having `min=0` and `max=allocated`.
    * On “Next,” aggregates these inputs into a `boxes` object per item:

      ```js
      it.boxes = { 
        box1: <number>, 
        box2: <number>, 
        box3: <number> 
      };
      ```

      Saves back to `localStorage` and navigates to `/summary`.
  * **`summary.js`** –

    * Reads updated `poItems` from `localStorage`.
    * Builds three payloads (one per box), each containing:

      * `box` (1, 2, 3)
      * `items`: `[ { "name": <string>, "qty": <number> }, … ]` filtered so `qty > 0`
      * `total`: sum of all `qty` values
    * For each payload, sends an AJAX `POST` to `/api/qr` with `{"data": JSON.stringify(payload)}`.
    * Receives a `PNG` blob, creates an object URL via `URL.createObjectURL()`, and injects a card:

      ```html
      <div class="card">
        <h3>Box 1</h3>
        <ul>
          <li>Item A: 5</li>
          <li>Item B: 3</li>
          …
        </ul>
        <p>Total: 8</p>
        <img src="<object-url>" alt="QR Code" />
      </div>
      ```

### PDF Extraction

* Uses **pdfplumber** to open and parse the first page of the uploaded PDF.
* `pdf.pages[0].extract_table()` returns a 2D list (rows × columns).
* The first row is assumed to be the header; subsequent rows map to:

  * `row[0]` → **Item Name**
  * `row[1]` → **Item Number**
  * `row[2]` → **Requested Quantity** (cast to integer)

If the PO’s table structure varies, minor adjustments to column indices may be needed.

### QR Code API

* **Endpoint**: `POST /api/qr`
* **Request Body**:

  ```json
  { "data": "<string_to_encode>" }
  ```
* **Behavior**:

  1. Parses `data` from JSON.
  2. Creates an in-memory `BytesIO` buffer.
  3. Calls `qrcode.make(data)` → PIL image.
  4. Saves the PNG into the buffer, rewinds to the start.
  5. Returns `send_file(buffer, mimetype="image/png")`.
* The JavaScript side converts the response to a `Blob` and displays it as an `<img>`.

---

## Future Improvements

* **Dynamic Box Count**

  * Allow users to specify how many boxes (beyond 3) they need. The logic currently assumes exactly 3 boxes.

* **Validation & Error Handling**

  * Validate that the sum of Box 1 + Box 2 + Box 3 equals the Allocated Quantity for each item.
  * Display error messages if totals mismatch.

* **User Accounts & Persistence**

  * Integrate user authentication so multiple users can manage POs.
  * Store allocation/distribution data in a database (e.g., SQLite/PostgreSQL) instead of `localStorage`.

* **Styling & Responsiveness**

  * Enhance the UI (Tailwind CSS) for mobile responsiveness.
  * Add progress indicators and success/failure modals.

* **PDF Generation**

  * Instead of just serving the original PDF, generate a packing slip PDF for each box combining item list and QR code.
  * Use a library like [ReportLab](https://www.reportlab.com/) or [WeasyPrint](https://weasyprint.org/).

* **Bulk Upload & Batch Processing**

  * Allow uploading multiple POs at once and queue jobs.
  * Provide a dashboard showing all POs in progress.

