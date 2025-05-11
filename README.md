# 🏐 pikachu-volleyball(with Deuce) for use at Sejong University festival booth


> ℹ️ **Disclaimer:**  
> This project is based on a freeware game and utilizes code that was reverse-engineered by a third-party developer.  
> We have received **explicit permission** from the reverse engineer to use, modify, and publish this version of the game.  
> All modifications have been made with **full consent and respect** to the original and reverse-engineered works.


Forked from [original/project from gorisanson](https://github.com/gorisanson/pikachu-volleyball).  
This version includes additional features and customizations specifically for use at the **Sejong University festival booth**. 


## ▶️ How to run locally

1. Clone this repository and get into the directory.

```sh
git clone https://github.com/developowl/pikachu-volleyball
cd pikachu-volleyball
```

2. Install dependencies. (If errors occur, you can try with `node v16` and `npm v8`.)

```sh
npm install
```

3. Bundle the code.

```sh
npm run build
```

4. Run a local web server.

```sh
npx http-server dist
```

5. Connect to the local web server on a web browser. (In most cases, the URL for connecting to the server would be `http://localhost:8080`. For the exact URL, it is supposed to be found on the printed messages on your terminal.)


## 🔧 Refactored Features

### 1. 🏆 Win Condition & Deuce Rule
- The game now ends when a player scores **7 points**.
- If both players reach **6:6**, the game enters **deuce** mode:
  - A player must lead by at least **2 points** to win.

### 2. 🧍 Player Roles Fixed
- **Player 1** (left Pikachu) is the **booth participant**.
- **Player 2** (right Pikachu) is a **Greedy member**.
- The roles are now fixed for consistent gameplay at events.

### 3. 🎮 🕹️ Updated Controls

| Player | Direction | Key |
|--------|-----------|-----|
| Player 1 (participant) | Move Left  | `ArrowLeft` |
|                  | Move Right | `ArrowRight` |
|                  | Jump       | `ArrowUp` |
|                  | Down       | `ArrowDown` |
|                  | Power Hit  | `Comma ( , )` |
| Player 2 (Greedy) | Move Left  | `F` |
|                  | Move Right | `H` |
|                  | Jump       | `T` |
|                  | Down       | `G` |
|                  | Power Hit  | `Z` |

### 4. 🧮 Score Calculation Logic
The reward score for Player 1 (booth participant) is calculated based on game result:

- 🟢 Win **before deuce** → `10 points` (`winningScore + 3`)
- 🔴 Lose **before deuce** → actual score (`0` to `winningScore - 2`)
- 🟢 Win **after deuce** → `8 points` (`winningScore + 1`)
- 🔴 Lose **after deuce** → `7 points` (`winningScore`)

### 5. 📤 Score Submission Modal
- A result modal is now shown when the game ends.
- The player can **enter their ID** and **submit the score** to the leaderboard.


## 🌅 Snapshot


(please click `Korean(한국어)`)
<img width="1920" alt="Screenshot 2025-05-12 at 00 50 30" src="https://github.com/user-attachments/assets/bbeb250c-3ae6-43c8-b359-a738be471be1" />
<img width="1920" alt="Screenshot 2025-05-12 at 00 51 13" src="https://github.com/user-attachments/assets/56ba91f2-40e3-424b-94b0-2b7249aa7dee" />
<img width="1920" alt="Screenshot 2025-05-12 at 00 52 31" src="https://github.com/user-attachments/assets/3a40187f-a3d0-41c3-b1f1-e9a0c3675298" />




## ⚠️ Localhost:8080 remains active even after stopping the server?

Even after stopping the local development server with `Ctrl + C`, the browser may continue to show the previous version of the app or keep intercepting requests to `localhost:8080`.

This happens because the **Service Worker** and cached data are still active in your browser.

### ✅ Solution 1: Clear site data (recommended to try first)
1. Open Chrome DevTools (`F12` or `Cmd + Option + I`)
2. Go to the **Application** tab
3. In the sidebar, select **Storage**
4. Under **Site data**, check all the boxes (including `Local storage`, `Cookies`, `Cache storage`, etc.)
5. Click the **Clear site data** button
<img width="1920" alt="Screenshot 2025-05-12 at 00 53 37" src="https://github.com/user-attachments/assets/023334c4-4424-459d-bf32-acf09f3d9c09" />
6. Refresh the page

This often resolves the issue without needing to unregister the service worker.

---

### ✅ Solution 2: Unregister the Service Worker
If the above method does not work:

1. Open Chrome DevTools (`F12` or `Cmd + Option + I`)
2. Navigate to the **Application** tab
3. In the sidebar, click **Service Workers**
4. click **See all registrations**
<img width="1920" alt="Screenshot 2025-05-12 at 01 15 17" src="https://github.com/user-attachments/assets/765f6b58-4cdf-4327-9c6d-83613d0cc056" />
5. Look for the Service Worker registered for `localhost:8080`
6. Click **Unregister**
<img width="1920" alt="Screenshot 2025-05-12 at 01 15 35" src="https://github.com/user-attachments/assets/ba586571-58d3-4a55-ae56-2066f8e4b5af" />
7. Perform a **hard refresh** (`Ctrl + Shift + R`)


