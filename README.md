# 🌐 Portfolio FullStack Project

A modern and fully responsive **FullStack Portfolio Website** designed and developed to showcase projects, skills, and achievements.  
This project demonstrates our ability to build scalable, well-structured applications using cutting-edge technologies in both **Frontend** and **Backend**.

---

## ✨ Features

- 🖼️ **Responsive Portfolio UI** – clean, modern, and mobile-friendly design.  
- 📂 **Projects Showcase** – dynamically rendered projects with images, descriptions, and links.  
- 📧 **Contact Form** – send messages directly through a secure backend API.  
- ⚡ **FullStack Architecture** – React frontend with Node.js/Express backend.  
- 💾 **Database Integration** – Postgress to store projects and contact messages.  
- 🔐 **Security Best Practices** – environment variables, validation, and API protection.  

---

## 🛠️ Tech Stack

**Frontend:**
- React.js  
- React Router  
- Axios  
- CSS3 / SCSS (responsive design)  

**Backend:**
- Node.js  
- Express.js  
- Postgress 
- dotenv & cors  

**Other Tools:**
- Git & GitHub for version control  
- ESLint + Prettier for code consistency  
- Postman for API testing  

---

## 📂 Project Structure

```
Portfolio-FullStack-Project/
├── frontend/              # React client-side code
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Portfolio pages (Home, Projects, Contact, About)
│   │   ├── assets/        # Images, icons, and static resources
│   │   └── App.js
│   └── package.json
│
├── backend/               # Express server
│   ├── models/            # Postgress Schemas
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   ├── server.js          # Entry point
│   └── package.json
│
└── README.md              # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended)  
- Postgress (local or Atlas connection)  
- npm or yarn package manager  

### Installation

1. Clone the repository:  
   ```bash
   git clone https://github.com/yazandahood8/Portfolio-FullStack-Project.git
   cd Portfolio-FullStack-Project
   ```

2. Install dependencies for backend & frontend:  
   ```bash
   cd backend && npm install  
   cd ../frontend && npm install  
   ```

3. Configure environment variables:  
   Create a `.env` file inside `backend/` with:  
   ```env
   PORT=5000
   Postgress=your_Postgress_connection_string
   ```

4. Run the development servers:  
   ```bash
   # Backend
   cd backend
   npm start

   # Frontend (in a separate terminal)
   cd frontend
   npm start
   ```

---

## 👥 Authors

- **Yazan Dawud** – FullStack Developer  
- **Maria El Heeb** – FullStack Developer  

---

## 📜 License

This project is licensed under the MIT License – feel free to use, modify, and distribute with attribution.
