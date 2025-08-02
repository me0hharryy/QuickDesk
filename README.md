# QuickDesk 

A streamlined and user-friendly help desk solution designed to simplify ticket management and enhance communication between users and support teams.

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Ticket Lifecycle](#-ticket-lifecycle)
- [System Workflow](#-system-workflow)
- [Getting Started](#-getting-started)
- [Tech Stack](#-tech-stack)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧐 About The Project

**QuickDesk** provides a simple, easy-to-use help desk solution where users can raise support tickets, and support staff can manage and resolve them efficiently. The system aims to streamline communication between users and support teams without unnecessary complexity, ensuring a smooth and productive workflow for everyone involved.

---

## ✨ Key Features

-   **User Authentication**: Secure registration and login for all user roles.
-   **Ticket Management**: Users can create tickets with a subject, description, category, and optional attachments.
-   **Role-Based Access**: Distinct dashboards and permissions for End Users, Support Agents, and Admins.
-   **Advanced Search & Filtering**:
    -   Filter tickets by status (`Open`, `Closed`).
    -   Filter by category.
    -   Sort tickets by most replied or recently modified.
-   **Ticket Status Tracking**: Follow the ticket's journey through a clear status system: `Open` → `In Progress` → `Resolved` → `Closed`.
-   **Interactive Communication**:
    -   Threaded conversations for clear communication.
    -   Users can upvote and downvote ticket resolutions.
-   **Admin Controls**: Admins can manage users, roles, and ticket categories.
-   **Email Notifications**: Automated email alerts are sent when a ticket is created or its status changes.

---

## 👤 User Roles

The system is designed with three distinct user roles:

-   **End Users (Employees/Customers)**:
    -   Create and track their support tickets.
    -   View ticket status and conversation history.
    -   Reply to comments on their own tickets.
    -   Receive email notifications.

-   **Support Agents**:
    -   View all tickets in a centralized dashboard.
    -   Assign tickets to themselves or other agents.
    -   Update ticket status and add comments/replies.
    -   Can also create tickets on behalf of users.

-   **Admin**:
    -   Full oversight of the system.
    -   Manage user accounts, roles, and permissions.
    -   Create, edit, and delete ticket categories.
    -   Monitor the overall ticket flow and system health.

---

## 🔄 Ticket Lifecycle

The basic flow for a ticket from creation to resolution is simple and intuitive:

1.  **Creation**: A user registers/logs in and creates a new ticket. The ticket is set to **Open**.
2.  **Assignment**: A support agent views the open ticket queue, picks up a ticket, and changes its status to **In Progress**.
3.  **Resolution**: The agent works on the issue, communicates with the user via comments, and eventually marks the ticket as **Resolved**.
4.  **Closure**: After resolution, the ticket is automatically or manually moved to the **Closed** state.

The status flow is strictly maintained:
`Open` → `In Progress` → `Resolved` → `Closed`

---

## 🌐 System Workflow

For a detailed visual representation of the system architecture, database schema, and user flow, please refer to our Excalidraw diagram:

-   **[View System Design on Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/83JslFMQqb3)**

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed:
* [Node.js](https://nodejs.org/)
* [npm](https://www.npmjs.com/)
* [Git](https://git-scm.com/)

### Installation

1.  Clone the repository:
    ```sh
    git clone [https://github.com/your-username/quickdesk.git](https://github.com/your-username/quickdesk.git)
    ```
2.  Navigate to the project directory:
    ```sh
    cd quickdesk
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```
4.  Create a `.env` file in the root directory and add the necessary environment variables (see `.env.example`).
5.  Start the development server:
    ```sh
    npm start
    ```

---

## 🛠️ Tech Stack

This project is built with modern technologies to ensure performance and scalability.

-   **Frontend**: *(React)*
-   **Backend**: *(Node.js, Express.js)*
-   **Database**: *(MongoDB)*
-   **Authentication**: *(JWT)*
-   **Deployment**: *(Heroku, Vercel, Render)*

---



## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.