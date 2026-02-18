# Eligify - AI Policy Decision Engine

Eligify is an intelligent platform designed to democratize access to public benefits. It leverages AI to decode complex government policy documents and helps citizens instantly check their eligibility for various schemes, scholarships, and social welfare programs.

By bridging the gap between bureaucratic logic and citizen needs, Eligify ensures transparency, precision, and ease of access for everyone.

## 🚀 Features

-   **AI-Driven Eligibility Check**: Instantly analyzes user profiles against thousands of policy rules.
-   **Smart Scheme Discovery**: Recommendations for scholarships, housing, housing, and healthcare schemes.
-   **Modern User Interface**: A premium, responsive design with dark mode aesthetics (Dark Blue & Cyan theme).
-   **Document Analysis**: (Concept) automated verification of documents against criteria.
-   **Integrated Architecture**: Next.js frontend served seamlessly by a robust Django backend.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15 (React), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
-   **Backend**: Django (Python), Django REST Framework.
-   **Architecture**: Static export of Next.js frontend served via Django static file handling.

## 📋 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   **Node.js** (v18 or higher)
-   **Python** (v3.10 or higher)
-   **Git**

### Installation

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/Sarthakpatil23/DevCraft-TECH-AROSA.git
    cd DevCraft-TECH-AROSA
    ```

2.  **Frontend Setup (Next.js)**

    Navigate to the `eligify` directory to install dependencies and build the static assets.

    ```bash
    cd eligify
    npm install
    
    # Build the static export (Required for Django to serve the UI)
    npm run build
    ```

    *Note: This creates an `out` directory containing the HTML/CSS/JS files.*

3.  **Backend Setup (Django)**

    Navigate to the `backend` directory to set up the Python environment.

    ```bash
    cd ../backend
    
    # Create a virtual environment
    python -m venv venv
    
    # Activate the virtual environment
    # On Windows:
    venv\Scripts\activate
    # On macOS/Linux:
    # source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    # Apply database migrations
    python manage.py migrate
    ```

### 🏃‍♂️ Running the Application

Once both frontend build and backend setup are complete:

1.  Ensure you are in the `backend` directory with your virtual environment activated.
2.  Start the Django development server:

    ```bash
    python manage.py runserver
    ```

3.  Open your browser and navigate to:

    **http://127.0.0.1:8000/**

    You should see the Eligify application running. The Django server acts as the primary host, serving the Next.js frontend and handling API requests.

## 🧪 Development Workflow

-   **Frontend Changes**: If you are working on the UI, you can run `npm run dev` inside the `eligify` folder for hot-reloading development. However, to see changes reflected on the Django port (8000), you must run `npm run build` again.
-   **Backend Changes**: Django will auto-reload on python file changes.

## 🤝 Contribution

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.