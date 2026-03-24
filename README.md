# homework-66

<div align="center">

<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" />
<img src="https://img.shields.io/badge/Passport.js-34E27A?style=for-the-badge&logo=passport&logoColor=white" />

<br /><br />

<img src="https://img.shields.io/badge/version-2.0.0-blue?style=flat-square" />
<img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
<img src="https://img.shields.io/badge/author-mihuilsu-orange?style=flat-square" />
<img src="https://img.shields.io/badge/CRUD-complete-brightgreen?style=flat-square" />

<br /><br />

> **Full CRUD server built on Express + MongoDB Atlas — Create, Read (with projection), Update, Replace and Delete, all behind Passport authentication.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [What's New in homework-66](#-whats-new-in-homework-66)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Routes](#-api-routes)
  - [Read + Projection](#read--projection)
  - [Create](#create-insertone--insertmany)
  - [Update](#update-updateone--updatemany--replaceone)
  - [Delete](#delete-deleteone--deletemany)
- [Route Examples](#-route-examples)
- [Author](#-author)

---

## 🌐 Overview

**homework-66** extends the previous project (homework-65) by adding a complete set of CRUD operations on the `items` collection in MongoDB Atlas. Every write route is protected by Passport session authentication, and the read route now supports **field projection** and **category filtering** via query parameters.

---

## 🆕 What's New in homework-66

| Feature | Method | Route |
|---|---|---|
| Read with projection & filter | `find()` | `GET /data` |
| Insert one document | `insertOne` | `POST /items` |
| Insert many documents | `insertMany` | `POST /items/bulk` |
| Update one document | `updateOne` + `$set` | `POST /items/:id` |
| Update many documents | `updateMany` + `$set` | `POST /items/update-many` |
| Replace one document | `replaceOne` | `POST /items/:id/replace` |
| Delete one document | `deleteOne` | `POST /items/:id/delete` |
| Delete many documents | `deleteMany` | `POST /items/delete-many` |

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) | Runtime environment |
| ![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white) | Web framework |
| ![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white) | Cloud database |
| ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white) | ODM — schema, validation, CRUD methods |
| ![Passport](https://img.shields.io/badge/Passport.js-34E27A?style=flat-square&logo=passport&logoColor=white) | Session authentication |
| ![EJS](https://img.shields.io/badge/EJS-B4CA65?style=flat-square&logo=ejs&logoColor=black) | Server-side templating |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- A MongoDB Atlas account with a cluster

### Installation

```bash
git clone https://github.com/mihuilsu/homework-66.git
cd homework-66
npm install
cp .env.example .env   # fill in your credentials
node seed.js           # populate the collection with sample data
npm run dev
```

### Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/homework66?retryWrites=true&w=majority&appName=Cluster0
SESSION_SECRET=your_long_random_secret
```

---

## 📁 Project Structure

```
homework-66/
├── config/
│   ├── db.js                  # MongoDB Atlas connection
│   └── passport.js            # Passport local strategy
├── middleware/
│   └── isAuthenticated.js     # Auth guard for protected routes
├── models/
│   ├── User.js                # User schema (bcrypt hashing)
│   └── Item.js                # Item schema (CRUD target collection)
├── routes/
│   ├── auth.js                # /register /login /logout
│   └── data.js                # All CRUD routes
├── views/
│   ├── partials/              # header.ejs, footer.ejs
│   ├── items/
│   │   ├── new.ejs            # insertOne form
│   │   ├── bulk.ejs           # insertMany form
│   │   └── edit.ejs           # updateOne form
│   ├── data.ejs               # List view (find + projection)
│   ├── item.ejs               # Detail view + replaceOne form
│   ├── index.ejs              # Home page
│   ├── login.ejs
│   ├── register.ejs
│   └── error.ejs
├── public/css/style.css
├── app.js
├── seed.js
├── .env.example
└── package.json
```

---

## 🔌 API Routes

### Read + Projection

#### `GET /data`
Fetches all documents from the `items` collection. Supports optional query parameters:

| Query param | Description | Example |
|---|---|---|
| `category` | Filter by category | `/data?category=Backend` |
| `fields` | Projection — show only these fields | `/data?fields=title,category` |

```js
// Mongoose call inside the route:
const items = await Item.find(filter, projection).sort({ createdAt: -1 });
```

**Example request:**
```
GET /data?category=Backend&fields=title,author
```
**Result:** returns only `title` and `author` fields of Backend items.

---

#### `GET /data/:id`
Returns a single document by its MongoDB `_id`.

```
GET /data/665f1a2b3c4d5e6f7a8b9c0d
```

---

### Create: insertOne / insertMany

#### `GET /items/new` → form
#### `POST /items` — insertOne

Inserts one document into the `items` collection.

**Form fields:** `title`, `description`, `category`, `author`

```js
await Item.create({ title, description, category, author });
```

**Expected result:** redirects to `/data` with the new document visible.

---

#### `GET /items/bulk` → form
#### `POST /items/bulk` — insertMany

Accepts a JSON array in a textarea and bulk-inserts all documents.

**Example input:**
```json
[
  { "title": "Redis Basics", "category": "Database", "author": "mihuilsu" },
  { "title": "Docker Compose", "category": "DevOps", "author": "mihuilsu" }
]
```

```js
await Item.insertMany(docs, { ordered: false });
```

**Expected result:** success message showing how many documents were inserted.

---

### Update: updateOne / updateMany / replaceOne

#### `GET /items/:id/edit` → form
#### `POST /items/:id` — updateOne

Updates only the fields that changed using `$set`. The rest of the document is untouched.

```js
await Item.updateOne(
  { _id: req.params.id },
  { $set: { title, description, category, author } }
);
```

**Example:** change the title of document `665f...` → redirects back to `/data`.

---

#### `POST /items/update-many` — updateMany

Updates all documents where `category` matches, renaming the category.

**Form fields:** `category` (current), `newCategory` (replacement)

```js
await Item.updateMany({ category }, { $set: { category: newCategory } });
```

**Example:** rename all `"Backend"` items to `"Server-Side"`.

---

#### `POST /items/:id/replace` — replaceOne

Fully replaces the matched document — no `$set`, the entire document is swapped. Located on the item detail page (`/data/:id`).

```js
await Item.replaceOne({ _id: req.params.id }, { title, description, category, author });
```

**Expected result:** the document is completely replaced with the new values.

---

### Delete: deleteOne / deleteMany

#### `POST /items/:id/delete` — deleteOne

Removes a single document by `_id`. Triggered by the **Del** button on each card.

```js
await Item.deleteOne({ _id: req.params.id });
```

---

#### `POST /items/delete-many` — deleteMany

Removes all documents where `category` matches the provided value.

**Form field:** `category`

```js
await Item.deleteMany({ category });
```

**Example:** delete all `"DevOps"` items at once.

---

## 👤 Author

<div align="center">

<img src="https://img.shields.io/badge/GitHub-mihuilsu-181717?style=for-the-badge&logo=github&logoColor=white" />

**mihuilsu** — Hillel IT Fullstack Course

</div>

---

<div align="center">
<img src="https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square" />
<img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" />
</div>
