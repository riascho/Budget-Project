# Personal Budget Project

## Overview

The **`Personal Budget`** project is part of the [Codecademy Back-End Engineer](https://www.codecademy.com/journeys/back-end-engineer/paths/becj-22-back-end-development/tracks/becj-22-personal-budget-i/) career path. It is intended as a `Javascript` Project but my implementation uses `Typescript`.

For this project, I built an API that allows clients to create and manage a personal budget. Using [Envelope Budgeting](https://www.thebalance.com/what-is-envelope-budgeting-1293682) principles, the API allows users to manage budget envelopes and track the balance of each envelope. This API also follows best practices regarding **REST endpoint naming conventions**, proper **response codes**, etc. I have also included **data validation** to ensure users do not overspend their budget.

### Project Objectives:

- Build an API using `Node.js` and `Express`
- Be able to create, read, update, and delete envelopes
- Create endpoints to update envelope balances
- Use `Git` version control to keep track of your work
- Use the command line to navigate your files and folders
- Use `Postman` to test API endpoints

### Prerequisites:

- Command line and file navigation
- `Javascript`
- `Typescript`
- `Node.js`
- `Express`
- `Git` and `GitHub`
- `Postman`

## Project Tasks

-[x] **Create file(s) and install Express:** On your computer, create a directory to hold your file(s) for a Node/Express project. Initialize a new Node.js project with `npm`, create a file to run your server, and add the Express library in said file.
You can start out with a single file called `server.js` or `index.js`. As you progress on your project you might find it best to separate logic under different folders/files in order to make it more scalable.

-[x] **Set up the environment and a simple endpoint:**
Create an Express app and write out an endpoint to send a `GET` request so that the message “Hello, World” appears when you open `localhost:3000/` in your browser.
Make sure to write out the necessary code to run a server in your main file and set your port to `3000`. The URL for the landing page is usually `/`. If working correctly, you should be able to navigate to `localhost:3000/` and see your message, “Hello, World” displayed on the browser.

-[x] **Version Control**:
Set up Git tracking in your directory and make sure to add and commit changes as you make them.
You can set up your git tracking with `git init`. Remember to add and commit your progress as you move forward with the project.

-[x] **Create your envelopes:**
Create global variables to store information about your envelopes and total budget. Create an endpoint that sends a POST request in order to generate individual budget envelopes.
It will be useful to prepend your endpoints with a keyword for your API, such as `/envelopes`. In this case, an array holding objects to represent each envelope might be a useful approach. Each envelope will be represented by a numerical ID and hold information regarding its budget and title.
Feel free to attach response codes so that users can see if their requests were sent successfully or if there were any errors.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/PersonalBudget_Codecademy.git
   ```
2. Navigate to the project directory:
   ```bash
   cd PersonalBudget_Codecademy
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the application:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`.
