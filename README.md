# 🚨 DispatchOS - Next-Gen Emergency Dispatch System

A highly professional, 3D-animated, Uber-like live emergency dispatch intelligence platform. Built with Advanced Object-Oriented principles to instantly coordinate Citizens with First Responders (Police, Fire, Ambulance).

---

## 🛠️ The Tech Stack

- **Backend:** Java Spring Boot 3.4.3 (Compiled dynamically to Java 21)
- **Database:** MySQL (Powered natively by standard XAMPP)
- **ORM Tooling:** Hibernate / Spring Data JPA
- **Frontend Engine:** React 18 & Vite
- **UI & Animations:** `@react-three/fiber` (3D rendering), `framer-motion` (Glassmorphism UI)

---

## 🚀 How to Run the System

The easiest way to launch both your Backend Engine and your React 3D UI simultaneously is to use the automated launcher script.

1. Ensure **XAMPP / MySQL** is running in the background.
2. Open a terminal in the root `Emergency/` directory.
3. Run the following command:
```bash
./start.sh
```

### ⚠️ IMPORTANT SERVER WARNING (MUST READ)

When the backend starts up, it will eventually pause and show something like:
`> :bootRun`
`> 80% EXECUTING`

**THIS IS NORMAL! YOUR APP IS NOT STUCK.** 
Because this is a live web-server API, its job is to stay "awake" forever, constantly listening on `port 8080` for emergency data. The progress bar will stay at 80% until you manually decide to shut down the server by pressing **`Ctrl + C`**.

*(As soon as you see "Tomcat started on port 8080", your database tables are completely built and the engine is listening!)*

---

## 👤 System Roles

1. **Citizens:** Standard users. They require NID validation, a Home Address, and an Emergency Contact Number explicitly mapped to their profile.
2. **Responders:** First responders consisting of `POLICE`, `FIRE_SERVICE`, and `AMBULANCE` teams. Their accounts map their assigned `Vehicle Registration Number` directly to the grid.
3. **Admins:** General overseers tracking system analytics.
