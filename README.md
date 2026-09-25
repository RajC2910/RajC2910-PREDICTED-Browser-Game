# PREDICTED

A minimalist psychological strategy / escape game where an adaptive local AI learns how you play and weaponizes that knowledge against you.

> **The AI does not need to control every move. It only needs to learn the next one.**

## Play

**Browser prototype:**  
https://stackblitz.com/fork/github/RajC2910/RajC2910-PREDICTED-Browser-Game/tree/main/playtest?startScript=dev

**Playtest source:**  
https://github.com/RajC2910/RajC2910-PREDICTED-Browser-Game/tree/main/playtest

**Game source:**  
https://github.com/RajC2910/RajC2910-PREDICTED-Browser-Game/tree/main/artifacts/predicted-game/src

## Prototype pitch

PREDICTED puts a human inside AI-controlled rooms. Every turn, the player chooses LEFT, CENTER, or RIGHT. The room predicts the player's next decision, then turns that prediction into a temptation by assigning the predicted choice the highest immediate reward.

The player must collect enough Escape Score to open the exit before the AI's Trace reaches 100 or the 60-second room clock expires.

From Room 4 onward, the model can begin reading how the player reacts to being predicted: **second-order prediction**.

From Room 11 onward, the AI stops revealing which direction it predicts. Only its confidence remains visible. The player has to reason about what the model may believe without being told the answer.

## Core loop

1. Observe the room's current prediction or confidence.
2. Choose LEFT / CENTER / RIGHT.
3. Receive points and Trace feedback.
4. Decide whether to follow, bluff, or take the third-ranked reward.
5. Adapt before the model adapts again.
6. Reach the room's Escape Score and continue.

### Reward logic

Each turn has three ranked rewards:

- **1st highest:** the model's confident read / predicted lane.
- **2nd highest:** **BLUFF**.
- **3rd highest:** third-rank move; not counted as a bluff.

This ranking also drives challenge logic.

## Psychological systems

PREDICTED tracks:

- **Trace** — how legible the player's behavior has become.
- **Awareness** — how strongly the player reacts to being observed and predicted.
- **Trust** — whether the player gives confident AI reads more weight or starts treating them as bait.
- **Hesitation** — decision time is recorded and contributes to the behavioral read.
- **Second-order reads** — the model can predict how the player will react to a prediction.
- **Model Theory** — the room summarizes what it has learned about the player's behavior at the end of a cleared room.

## Progression

There are **20 rooms**.

Rooms 1–10 establish the first progression arc.

Rooms 11–20 repeat the same room target / reward structure and challenge positions, but the AI enters the **blind-read** phase and no longer shows its predicted direction.

Escape Score targets:

`500 → 600 → 700 → 800 → 900 → 1000 → 1500 → 2000 → 2500 → 3000`

Rooms 11–20 repeat that same target sequence.

Challenge timing:

- Rooms 1–3: no explicit challenge.
- Rooms 4–10: challenge system active.
- Rooms 11–13: no explicit challenge.
- Rooms 14–20: the same challenge positions repeat.

Consecutive challenge limits are now **2**, not 3.

## Multiplayer

The prototype includes **local two-player multiplayer**.

- Player 1: **A / S / D**
- Player 2: **Arrow keys**
- Each player has an independent prediction model, score, Trace and bluff state.
- Both players must clear the room target.
- Multiplayer progression is stored separately from single-player.
- Multiplayer has three independent local save slots.
- The multiplayer layout is designed for a full-width horizontal two-player presentation.

## Save system

Single-player and multiplayer each have **three local save slots**.

No account or network connection is required for the prototype.

## AI usage

AI tools were used during prototyping for code generation, iteration, debugging, balancing and design exploration.

The game's actual prediction system is intentionally lightweight and local: it uses the player's recorded action history, transitions, behavioral statistics and psychological state rather than an external AI API.

## Current prototype scope

- Browser-playable prototype
- 20 rooms
- 60-second room timer
- Single-player + local two-player multiplayer
- Three local save slots per mode
- Adaptive prediction model
- Second-order prediction
- Blind-read phase from Room 11
- Room challenges
- Behavioral profile / model theory
- Web Audio API sound
- Browser speech synthesis
- No paid APIs
- No backend required

## Controls

### Single-player

`A` = LEFT  
`S` = CENTER  
`D` = RIGHT

Mouse input is also supported.

### Multiplayer

Player 1: `A / S / D`  
Player 2: `← / ↓ / →`

## Submission notes

The prototype is intentionally built to be easy to inspect and play from the browser. The `playtest/` directory is a standalone Vite app; `artifacts/predicted-game/` contains the main project source.

For design-test submission, the key artifacts are:

- Browser prototype: the **Play** link above
- GitHub code: the repository and source links above
- Core game concept: this README's pitch and core-loop sections
- Progression and system design: progression / psychological systems / multiplayer sections

## Repository

https://github.com/RajC2910/RajC2910-PREDICTED-Browser-Game

Final prototype branch: `predicted-v5-balance-multiplayer`
