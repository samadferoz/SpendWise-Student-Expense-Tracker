# 🎓 SpendWise — College Viva Examination Guide & Demo Script

This guide is prepared to help you confidently present and defend **SpendWise — Student Expense Tracker** in front of your college examiners, professors, and external evaluators.

---

## ⏱️ The 3-Minute College Viva Demonstration Script

*Practice this sequence before your presentation. Follow the exact time stamps and live actions.*

### 🟢 Minute 1: Introduction & Architecture (0:00 - 1:00)
- **What to say**:
  > *"Good morning/afternoon, Respected Examiners. Today, I am presenting **SpendWise**, a full-stack student expense tracker created to solve a very common problem: helping college students budget their semester expenses, track cafeteria and textbook costs in Indian Rupees (₹), and analyze daily spend patterns.*
  > 
  > *From an architecture standpoint, our frontend is built with **React 18 and Vite**, styled using custom **Plain CSS** with a modern responsive UI. Our backend runs on **Node.js and Express.js**, communicating via REST APIs. For our database, instead of a local SQL database or mock memory, we integrated **IBM Cloudant**, which is an enterprise-grade NoSQL JSON document database hosted on IBM Cloud. Finally, both services are containerized and orchestrated using **Docker and Docker Compose**."*

- **What to show on screen**:
  1. Open the browser at `http://localhost:3000`.
  2. Point out the top header: the brand logo and the **Cloudant NoSQL status indicator**.
  3. Show the **Dashboard metric cards**: Total Expenses, Today's Expenses, This Month, and Total Transactions.

---

### 🟡 Minute 2: Live CRUD & Cloudant NoSQL Operations (1:00 - 2:00)
- **What to say**:
  > *"Now, let me demonstrate the complete CRUD lifecycle directly against our IBM Cloudant database.*
  > 
  > *First, let's create a new expense. I will click '+ Add Expense', enter 'Operating Systems Lab Manual', set amount to '₹350', select category 'Books & Supplies', and submit. Notice the instant feedback toast and the loading state. The backend calls the official `@ibm-cloud/cloudant` SDK's `postDocument` method, generating a unique `_id` and revision hash `_rev`.*
  > 
  > *Notice that all 4 dashboard totals automatically updated in real-time based on actual database records.*
  > 
  > *Next, let's demonstrate the Update operation: I'll click the Edit pencil icon next to this record, change the amount to ₹400, and save. Cloudant uses Multi-Version Concurrency Control (MVCC), where updating requires matching the latest `_rev` to prevent race conditions.*
  > 
  > *Now, let's test Search and Filter: Typing 'Lab' instantly filters the table. Changing category to 'Books & Supplies' isolates relevant entries."*

- **What to show on screen**:
  1. Click **+ Add Expense** -> Enter title, amount ₹350, category, submit.
  2. Watch the toast: `"Saved to IBM Cloudant"`. Point to the dashboard totals updating.
  3. Click **Edit** -> Change amount -> Save -> Notice updated values in table.
  4. Type in Search input and select category dropdown to show live filtering.

---

### 🔴 Minute 3: Safe Deletion & Docker Containerization (2:00 - 3:00)
- **What to say**:
  > *"To safeguard against accidental data loss, clicking the Delete trash icon triggers a confirmation modal displaying the exact document details and Cloudant document ID. When confirmed, the backend calls `deleteDocument({ db, docId, rev })`. The document is permanently removed and the metrics update accordingly.*
  > 
  > *Finally, regarding containerization: In terminal, our application is orchestrated with `docker compose up --build`. The frontend runs on a multi-stage Nginx container on port 3000, while the backend runs on Node 22 Alpine on port 5000. Nginx automatically reverse-proxies `/api` calls internally over the Docker bridge network to the backend container, eliminating CORS issues.*
  > 
  > *Thank you. I am now ready for your questions."*

- **What to show on screen**:
  1. Click **Delete** -> Show the confirmation modal with document ID -> Confirm deletion.
  2. Switch to terminal: run `docker compose ps` to show both `spendwise-frontend` and `spendwise-backend` containers running and healthy.

---

## ❓ 20 Essential Viva Questions & Answers

### 1. React & Vite

#### Q1: Why did you choose React.js with Vite over traditional Create React App (CRA)?
**Answer**:
Vite uses native ES modules (ESM) in the browser and the lightning-fast esbuild bundler written in Go. This offers near-instantaneous hot module replacement (HMR) and fast build times compared to Webpack-based CRA, which is now deprecated by the React team.

#### Q2: How does state management work in SpendWise?
**Answer**:
We use React's built-in hooks:
- `useState`: Manages local state for transactions, dashboard metrics, search queries, active category filters, and modal visibility.
- `useEffect`: Triggers initial health checks and data fetching from the backend when the app mounts.
- `useCallback` & `useMemo`: Memoizes filter operations and handlers to avoid unnecessary re-renders.

#### Q3: Why did you use Plain CSS instead of a CSS framework like Tailwind or Bootstrap?
**Answer**:
Plain CSS with modern CSS custom properties (variables) allows fine-grained control over our design tokens (colors, gradients, glassmorphism `backdrop-filter`, and CSS animations) without adding heavy bundle dependencies. It demonstrates a deep understanding of core CSS grid, flexbox, and responsive media queries.

---

### 2. Node.js & Express.js

#### Q4: What is the role of Express.js in your project?
**Answer**:
Express.js is a minimalist web framework for Node.js. In SpendWise, Express acts as our REST API gateway:
- Routes incoming HTTP requests (`/api/transactions`, `/api/health`).
- Applies middleware such as `cors()`, `express.json()`, and custom input validators.
- Interacts with the IBM Cloudant database SDK and returns structured JSON responses.

#### Q5: What is middleware in Express? Give an example from your project.
**Answer**:
Middleware is a function that has access to the request (`req`), response (`res`), and the `next` function in the application's request-response cycle.
In SpendWise:
1. `validateTransaction`: Validates that `title` is non-empty, `amount` is a positive number, and `date` is valid before passing control to the controller.
2. `errorHandler`: Catches any thrown errors (like Cloudant 404s or 409 conflicts) and formats them into clean JSON error responses.

---

### 3. REST API & HTTP

#### Q6: What REST API endpoints did you design?
**Answer**:
- `GET /api/health`: Health status and database connectivity check.
- `GET /api/transactions`: Retrieves all expense documents and calculated dashboard metrics.
- `GET /api/transactions/:id`: Retrieves a single document by its Cloudant ID.
- `POST /api/transactions`: Creates a new expense document (returns 201 Created).
- `PUT /api/transactions/:id`: Updates an existing expense document (returns 200 OK).
- `DELETE /api/transactions/:id`: Deletes an expense document (returns 200 OK).

#### Q7: What HTTP status codes does SpendWise use?
**Answer**:
- `200 OK`: Successful retrieval, update, or deletion.
- `201 Created`: Successfully created a new transaction.
- `400 Bad Request`: Input validation failed (e.g. negative amount, missing title).
- `404 Not Found`: Transaction document does not exist in Cloudant.
- `409 Conflict`: Revision conflict (`_rev` mismatch during an update).
- `503 Service Unavailable`: IBM Cloudant credentials are missing or the database is unreachable.

---

### 4. IBM Cloudant & NoSQL Database

#### Q8: What is IBM Cloudant and how is it different from relational databases like MySQL?
**Answer**:
IBM Cloudant is a fully-managed cloud NoSQL document database based on **Apache CouchDB**.
- **Data Model**: Relational databases store structured rows in fixed tables with rigid schemas. Cloudant stores unstructured or semi-structured data as JSON documents with flexible schemas.
- **Scaling**: Cloudant is designed for horizontal scaling across distributed cloud clusters.
- **Access Protocol**: Cloudant uses a native HTTP/JSON REST API, making it easy to query and replicate.

#### Q9: What are `_id` and `_rev` in Cloudant documents?
**Answer**:
- `_id`: The document's unique identifier (primary key).
- `_rev`: The revision string (e.g., `1-4c2d...`, `2-9a1b...`). Each time a document is created or modified, Cloudant assigns a new revision hash.

#### Q10: What is MVCC (Multi-Version Concurrency Control) and why is it important in Cloudant?
**Answer**:
MVCC allows multiple clients to read and write without locking the entire database. When updating or deleting a document in Cloudant, you must supply the document's current `_rev`. If another user updated the document in the meantime, the `_rev` will not match, and Cloudant will reject the update with a `409 Conflict`. This prevents accidental overwrite of someone else's changes.

#### Q11: How does your backend initialize the database?
**Answer**:
When the backend starts, `initDatabase()` uses the official `@ibm-cloud/cloudant` SDK to call `getDatabaseInformation({ db: 'spendwise_db' })`. If the database does not exist (HTTP 404), it automatically calls `putDatabase({ db: 'spendwise_db' })` to create it on the fly.

#### Q12: Why shouldn't credentials be stored in frontend code?
**Answer**:
Frontend code runs entirely inside the client's web browser. Anyone can view JavaScript files in DevTools. Storing API keys or database credentials in frontend code exposes your entire database to the public. In SpendWise, credentials are kept secure in the backend's environment variables (`.env`).

---

### 5. Docker & Containerization

#### Q13: What is the difference between Docker and a Virtual Machine (VM)?
**Answer**:
- **Virtual Machines**: Emulate an entire operating system, including a virtual kernel and hypervisor, making them resource-heavy and slow to boot.
- **Docker Containers**: Share the host OS kernel and package only the application and its dependencies in lightweight, isolated user spaces. Containers start in seconds and consume significantly less memory.

#### Q14: Explain the multi-stage build in `frontend/Dockerfile`.
**Answer**:
Our frontend Dockerfile has two stages:
1. **Stage 1 (Builder)**: Uses `node:22-alpine` to run `npm install` and `npm run build`, compiling React and JSX into minified static HTML, JS, and CSS files in the `dist` directory.
2. **Stage 2 (Runner)**: Uses `nginx:alpine` and copies *only* the compiled static files from the builder stage into Nginx's web root (`/usr/share/nginx/html`).
**Benefit**: Node.js, npm, and devDependencies are discarded, reducing the final Docker image size from ~400MB down to ~25MB!

#### Q15: How do the frontend and backend containers communicate in Docker Compose?
**Answer**:
In `docker-compose.yml`, both containers join a user-defined bridge network (`spendwise-net`). Docker provides automatic DNS resolution:
- The frontend container's Nginx configuration includes `proxy_pass http://backend:5000/api/;`.
- Nginx resolves `backend` to the backend container's internal IP address, proxying all API requests seamlessly.

#### Q16: What is the purpose of `.dockerignore`?
**Answer**:
`.dockerignore` prevents unnecessary or sensitive files (such as local `node_modules`, `.git`, and `.env` credentials) from being copied into the Docker image. This keeps images small, speeds up build times, and protects secret credentials.

---

### 6. Calculations & Algorithms

#### Q17: How are the dashboard metrics calculated?
**Answer**:
When `GET /api/transactions` is called, the controller queries all documents using `postAllDocs({ includeDocs: true })`. It loops through the records and calculates:
1. `totalExpenses`: Sum of all `amount` fields.
2. `todayExpenses`: Sum of amounts where `date === todayDate (YYYY-MM-DD)`.
3. `monthlyExpenses`: Sum of amounts where `date.startsWith(currentYearMonth)`.
4. `transactionCount`: Total number of active expense documents.

This guarantees that all statistics reflect live, persisted database data.

#### Q18: What input validation does SpendWise enforce?
**Answer**:
1. `title`: Required, string, trimmed length between 2 and 100 characters.
2. `amount`: Required, positive numeric value, greater than ₹0 and capped at ₹10,000,000.
3. `category`: Required, must be a recognized student category.
4. `date`: Required, valid ISO date string (`YYYY-MM-DD`).
5. `description`: Optional, capped at 500 characters.

---

### 7. Future Enhancements

#### Q19: If you had more time, what features would you add next?
**Answer**:
1. **User Authentication**: Student login using JWT (JSON Web Tokens) or OAuth, allowing multiple students to have private accounts.
2. **Visual Charts**: Interactive monthly spend breakdown pie charts using Chart.js or Recharts.
3. **Monthly Budget Limits & Alerts**: Notify the student when their monthly spend exceeds a set target (e.g. ₹5,000).
4. **Receipt OCR**: Upload photo of paper bills and extract amount and date using IBM Watson / Cloud AI services.

#### Q20: What was the biggest challenge you faced in this project?
**Answer**:
Handling CouchDB / Cloudant's MVCC `_rev` management during rapid edits and deletes was a key learning curve. We solved this by ensuring our backend controller intelligently fetches or verifies the latest document revision before executing `putDocument` or `deleteDocument`, and returning clear 409 conflict messages if concurrent edits occur.
