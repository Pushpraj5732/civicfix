# 🏛️ CivicFix — AI-Powered Smart Urban Management

**CivicFix** is a next-generation civic issue reporting and visualization platform designed to bridge the gap between citizens and municipal authorities. By leveraging **Deep Learning (AI)**, **Real-time Analytics**, and **Smart Workflows**, CivicFix ensures that potholes, garbage piles, and infrastructure issues in your city are identified, verified, and resolved faster than ever.

---

## 🚀 Key Features

### 🔹 For Citizens (Users)
- **📸 Smart Issue Reporting**: Report issues with photos, descriptions, and automatic location tagging.
- **🤖 AI Verification**: Reports are instantly scanned by AI to verify authenticity (e.g., confirming if a photo actually contains garbage or a pothole).
- **🛤️ Journey Tracking**: Real-time status updates from *Pending* to *Resolved* with an activity timeline.
- **🗺️ City Heatmap**: Visualize problematic zones across the city using interactive data mapping.

### 🔹 For Zone Heads (Municipal Workers)
- **📍 Regional Intelligence**: Manage only the issues assigned to your specific geographical zone.
- **🔧 Active Workflow**: Start work, manage progress, and mark issues as resolved directly from the dashboard.
- **📸 Resolution Proof**: Mark an issue as resolved by uploading an "After" photo, which is cross-verified by AI to ensure the work was completed.

### 🔹 For Administrators
- **📊 Advanced Analytics**: Comprehensive city-wide trajectory trends, status demographics, and issue breakdowns.
- **🔍 Global Filter Engine**: Powerful server-side filtering and search across thousands of records.
- **⚖️ Zone Performance**: Monitor and compare the efficiency and resolution rates of different city zones.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React.js (Vite), Tailwind CSS, GSAP (Animations), Chart.js |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), JWT Auth |
| **AI Service** | Python (Flask), TensorFlow/Keras, NumPy, Pillow |
| **Security** | Helmet.js, Express Rate Limit, Internal API Secrets |

---

## 🧠 AI Capabilities

CivicFix integrates custom-trained **Convolutional Neural Networks (CNNs)** to automate trust and verification:
- **Image Recognition**: Instantly identifies Potholes and Garbage with high confidence.
- **Resolution Verification**: Scans "After" images to confirm that the issue reported in the "Before" image has truly been removed/fixed.
- **Confidence Scoring**: Only highly credible reports are automatically approved, reducing manual overhead for city staff.

---

## 🏗️ Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (3.9+)
- **MongoDB** (Local or Atlas)

### 2. Backend Setup
```bash
cd civic-fix/server
npm install
# Configure your .env (MONGO_URI, JWT_SECRET, AI_SERVICE_URL)
npm start
```

### 3. AI Service Setup
```bash
cd civic-fix/ai-service
pip install -r requirements.txt
python app.py
```

### 4. Frontend Setup
```bash
cd civic-fix
npm install
# Configure .env (VITE_API_URL)
npm run dev
```

---

## 🛡️ Security & Performance
- **Protected Routes**: Role-based access control (RBAC) ensuring only authorized staff can access dashboards.
- **Rate Limiting**: Protection against API spam and brute-force attempts.
- **Server-Side Filtering**: High-performance data retrieval even with large datasets.
- **Trend Smoothing**: Automated data-gap-filling for continuous and professional analytics visualization.

---

## 📱 Responsiveness
CivicFix is fully responsive, featuring a **Mobile-First Design** optimized for tablet and phone views, ensuring municipal workers can use the platform smoothly while on-site.

---

## 🤝 Contribution
Developed for the **6th Semester Mini Project**.