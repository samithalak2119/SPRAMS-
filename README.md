# University of Vavuniya: Research Document Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Express](https://img.shields.io/badge/Backend-Express.js-000000?logo=express)

A centralized, high-performance research management platform designed specifically for the **University of Vavuniya**. This system bridges the gap between academic networking and citation management, blending the social discovery features of **ResearchGate** with the robust document organization of **Mendeley**.

---

## 🚀 Key Features

*   **Researcher Profiles:** Showcase publications, h-index, and research interests.
*   **Document Management:** Upload, categorize, and store research papers with full-text search.
*   **Citation Generator:** Automatic citation generation in APA, IEEE, and MLA formats.
*   **Collaborative Feed:** A real-time feed to follow colleagues, share updates, and discover trending research within the university.
*   **Secure Access:** Role-based access control (RBAC) for students, faculty, and administrators.
*   **Version Control:** Track revisions of manuscripts and collaborative drafts.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Usage |
| :--- | :--- |
| **React.js** | Functional components and UI logic |
| **Redux Toolkit** | Global state management |
| **Tailwind CSS** | Responsive and modern styling |
| **Axios** | API communication |

### Backend
| Technology | Usage |
| :--- | :--- |
| **Express.js** | Server-side framework |
| **Node.js** | Runtime environment |
| **MongoDB** | NoSQL database for flexible document schemas |
| **JWT** | Secure authentication and authorization |

---

## 📂 Project Structure

```text
research-vavuniya/
├── client/                # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Dashboard, Profile, Library
│   │   └── redux/         # Store and Slices
├── server/                # Express Backend
│   ├── controllers/       # Business logic
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   └── middleware/        # Auth and Validation
└── README.md

Group members 2021 ASP 56
