# 🌱 GardenSphere

### Smart Home Garden Management & ERP System

GardenSphere is a **full-stack web-based Enterprise Resource Planning (ERP) system** designed to manage and integrate the complete lifecycle of home garden operations.

The system provides a centralized platform for managing **plants and crops, irrigation, fertilizers, pest and disease incidents, inventory, gardening tasks, harvesting, sales, finances, users, notifications, and management reports**.

GardenSphere is built using the **MERN Stack** with **Tailwind CSS**, providing a modern, responsive, scalable, and user-friendly garden management experience.

---

## 🎯 Project Purpose

Home garden operations are often managed using notebooks, spreadsheets, or disconnected methods. This can make it difficult to accurately manage planting records, watering schedules, fertilizer usage, inventory, gardening tasks, harvests, expenses, and income.

GardenSphere provides a centralized ERP solution that connects these activities into a single digital platform.

The system aims to:

* 🌿 Centralize garden-related information
* ⚡ Improve operational efficiency
* 💧 Reduce resource wastage
* 📦 Improve inventory control
* 💰 Improve financial visibility
* 📈 Monitor garden productivity
* 📊 Support data-driven decision making
* 📝 Reduce manual record keeping

---

## 🔄 ERP Business Workflow

The main GardenSphere workflow is:

```text
Purchase
   ↓
Inventory
   ↓
Planting
   ↓
Maintenance
   ↓
Harvest
   ↓
Sales
   ↓
Financial Reporting
```

Garden maintenance activities include:

```text
Planting
   ↓
Crop Management
   ↓
┌─────────────────────────────────┐
│ Irrigation │ Fertilizer │ Pest  │
│            │ Management │Disease│
└─────────────────────────────────┘
   ↓
Maintenance
   ↓
Harvest
```

---

## ✨ Core Features

### 🌱 1. Plant & Crop Management

Manage plants and crops throughout their lifecycle.

**Features:**

* Add and update plant records
* Manage plant varieties
* Record planting dates
* Record planting locations
* Record planted quantities
* Track growth stages
* Track crop status
* Record expected harvest dates
* Maintain crop history

---

### 💧 2. Irrigation Management

Create and monitor watering schedules for crops.

**Features:**

* Create irrigation schedules
* Assign schedules to crops
* Set watering frequency
* Set watering time
* Record water quantity
* Record completed watering
* Track missed watering activities
* Maintain irrigation history
* Generate irrigation reports

---

### 🧪 3. Fertilizer Management

Manage fertilizer inventory and crop applications.

**Features:**

* Add fertilizer types
* Manage fertilizer stock
* Record fertilizer purchases
* Record fertilizer usage
* Record application dates
* Record applied quantities
* Assign fertilizers to crops
* Track fertilizer costs
* Monitor expiry dates
* View fertilizer usage history

---

### 🐛 4. Pest & Disease Management

Monitor crop health and manage pest or disease incidents.

**Features:**

* Record pest problems
* Record crop diseases
* Identify affected crops
* Record detection dates
* Set severity levels
* Record symptoms
* Record treatments
* Track treatment costs
* Monitor treatment status
* Maintain crop health history

**Severity Levels:**

* Low
* Medium
* High
* Critical

---

### 📦 5. Inventory Management

Manage resources and materials required for garden operations.

**Inventory Categories:**

* Seeds
* Fertilizers
* Soil
* Compost
* Pesticides
* Gardening tools
* Irrigation equipment
* Plant containers
* Other materials

**Features:**

* Add inventory items
* Update stock
* Stock-in / Stock-out
* Record purchases
* Manage suppliers
* Configure minimum stock levels
* Low-stock alerts
* Inventory transaction history
* Damaged stock management
* Inventory valuation

---

### 💰 6. Finance Management

Track financial activities related to garden operations.

**Expense Management:**

* Seeds
* Fertilizers
* Soil
* Tools
* Water
* Electricity
* Pest treatments
* Maintenance
* Labour
* Transportation
* Other expenses

**Income Management:**

* Vegetable sales
* Fruit sales
* Plant sales
* Other harvest sales

**Features:**

* Record expenses
* Record income
* Manage financial categories
* Record payment methods
* Track transaction dates
* View financial history
* Calculate total income
* Calculate total expenses
* Calculate profit/loss
* Generate financial reports

### Profit Calculation

```text
Net Profit = Total Income - Total Expenses
```

---

### 🌾 7. Harvest Management

Manage and monitor harvested crops.

**Features:**

* Record harvests
* Select crops
* Record harvest dates
* Record quantities
* Select measurement units
* Record quality/grade
* Record harvest location
* Record selling prices
* Link harvests with sales
* View harvest history
* Generate harvest reports

---

### ✅ 8. Task Management

Manage daily gardening activities and responsibilities.

**Features:**

* Create tasks
* Assign tasks
* Set task priorities
* Set due dates
* Track task status
* Add descriptions
* Add comments
* Track completion
* View task history

**Task Workflow:**

```text
Pending
   ↓
Assigned
   ↓
In Progress
   ↓
Completed
```

---

### 📊 9. Reports & Dashboard

Provide managers with a centralized overview of garden operations.

**Dashboard KPIs:**

* Total Plants
* Active Crops
* Crops Ready for Harvest
* Pending Tasks
* Completed Tasks
* Low Stock Items
* Total Inventory Value
* Total Harvest
* Total Expenses
* Total Income
* Net Profit

**Available Reports:**

* Crop Productivity Report
* Harvest Report
* Inventory Report
* Irrigation Report
* Fertilizer Usage Report
* Pest & Disease Report
* Task Completion Report
* Expense Report
* Income Report
* Profit/Loss Report
* Monthly Performance Report
* Yearly Performance Report

---

### 👥 10. User Management

Manage system users and control access according to assigned roles.

**Features:**

* Create users
* Update users
* Deactivate users
* Assign roles
* Manage permissions
* Reset passwords
* View user activities
* Role-Based Access Control

---

## 👤 User Roles

GardenSphere supports different types of users.

### 👑 Admin

* Full system access
* Manage users
* Manage roles
* Manage permissions
* Monitor system activities
* Access reports

### 👨‍💼 Manager

* Manage crops
* Manage irrigation
* Manage fertilizers
* Manage pest and disease incidents
* Manage inventory
* Assign tasks
* Manage harvests
* Manage sales
* Manage finances
* View dashboards and reports

### 👨‍🌾 Gardener

* View assigned tasks
* Update task status
* Record irrigation
* Record maintenance activities
* Report pest and disease incidents
* Record harvest information
* Update crop information

---

## 🔔 Notifications

GardenSphere can provide notifications for:

* 📦 Low inventory levels
* 💧 Upcoming irrigation
* 🌱 Expected planting activities
* 🧪 Fertilizer expiry
* 🐛 Pest treatment follow-ups
* ✅ Assigned tasks
* 🌾 Upcoming harvests
* 💰 Financial reminders

---

## 🛠️ Technology Stack

### Frontend

* ⚛️ React.js
* 🎨 Tailwind CSS
* 🧭 React Router
* 🔗 Axios
* 📊 Recharts
* 📝 React Hook Form

### Backend

* 🟢 Node.js
* 🚂 Express.js
* 🔐 JWT Authentication
* 🔒 bcrypt
* 🛡️ Authentication & Authorization Middleware
* 🌐 RESTful API

### Database

* 🍃 MongoDB
* 📚 Mongoose

---

## 🏗️ System Architecture

```text
                    GardenSphere ERP
                           │
                    React Frontend
                           │
                     Tailwind CSS
                           │
                         Axios
                           │
                      RESTful API
                           │
                   Node.js + Express
                           │
                ┌──────────┴──────────┐
                │                     │
          JWT Middleware         Business Logic
                │                     │
                └──────────┬──────────┘
                           │
                        Mongoose
                           │
                        MongoDB
```

---

## 🗄️ Database Collections

The system may contain the following MongoDB collections:

```text
users
roles
plants
plantVarieties
plantings
gardenLocations
irrigationSchedules
irrigationRecords
fertilizers
fertilizerApplications
pests
diseases
treatments
inventory
inventoryTransactions
suppliers
purchases
tasks
harvests
sales
customers
expenses
income
notifications
```

---

## 📁 Project Structure

```text
GardenSphere/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── server.js
│
└── README.md
```

---

## 🔐 Security

GardenSphere includes security mechanisms such as:

* JWT-based authentication
* Password hashing using bcrypt
* Role-Based Access Control (RBAC)
* Protected backend API routes
* Protected frontend routes
* Input validation
* Server-side validation
* Authorization middleware
* Secure error handling
* MongoDB security best practices

---

## 📱 Responsive Design

GardenSphere is designed to provide a user-friendly experience across:

* 💻 Desktop
* 💻 Laptop
* 📱 Tablet
* 📱 Mobile

Tailwind CSS is used to create responsive layouts, navigation, dashboards, tables, forms, modals, and other UI components.

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

```text
Node.js
npm
MongoDB
Git
```

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd GardenSphere
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

### 4. Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

> Never commit your real `.env` file or secrets to GitHub.

### 5. Run the Backend

```bash
cd server
npm run dev
```

### 6. Run the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

---

## 📈 Key Performance Indicators

GardenSphere tracks important KPIs including:

**Crop KPIs**

* Total Crops
* Active Crops
* Crops Ready for Harvest
* Harvest Productivity

**Inventory KPIs**

* Total Inventory Items
* Low Stock Items
* Inventory Value
* Monthly Purchases

**Financial KPIs**

* Total Expenses
* Total Income
* Net Profit
* Monthly Profit

**Task KPIs**

* Total Tasks
* Pending Tasks
* Completed Tasks
* Overdue Tasks
* Task Completion Rate

**Harvest KPIs**

* Total Harvest Quantity
* Harvest Value
* Most Productive Crop
* Monthly Harvest

---

## 🔮 Future Enhancements

Future versions of GardenSphere can include:

* 🌐 IoT soil moisture sensor integration
* 💧 Automated irrigation
* ☁️ Weather API integration
* 🤖 AI crop disease detection
* 📈 AI-powered harvest prediction
* 📱 Android/iOS mobile application
* 📷 QR/Barcode inventory management
* 🏡 Multi-garden management

---

## 🎯 Project Goals

GardenSphere aims to:

> Transform traditional home garden management into a centralized, efficient, data-driven digital experience.

By integrating garden operations, inventory, tasks, harvesting, sales, finance, and reporting into a single platform, GardenSphere helps improve productivity, reduce resource wastage, and support better garden management decisions.

---

## 📄 License

This project is developed for educational and portfolio purposes.

---

## ⭐ Support

If you find this project useful, consider giving the repository a **⭐ Star**.

---

### 🌱 GardenSphere

**Grow Smarter. Manage Better.**
