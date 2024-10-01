# DnD Encounter Management Backend

## This is the backend for the Dungeons and Dragons Encounter Management application. It provides the API for user authentication, encounter creation, campaign management, and forum interactions.

Table of Contents

  1.	Installation
	2.	API Documentation
	3.	Features
	4.	Database Schema
	5.	Technologies Used
	6.	Environment Variables
	7.	Running Tests
	8.	Contributors

Installation

Prerequisites

	•	Node.js
	•	DynamoDB
	•	Postman 

Getting Started

	1.	Clone the repository:
 
	2.	Navigate into the project directory: 
 
 	3.	Install dependencies:
  
  	4.	Set up environment variables (see Environment Variables).
   
	5.	Start the server:
   
 	6.	The server will start on http://localhost:3000.

Features

	•	User Authentication: Secure registration and login using JWT.
	•	Profile Management: Users can update their display name, profile picture, and about me section.
	•	Encounter Creation: Users can create encounters, specifying details like challenge rating, monster type, and environment.
	•	Campaign Organization: Encounters can be organized into campaigns with subfolders.
	•	Forum Interaction: Users can post about their encounters, comment on posts, and like/dislike posts.
	•	Moderator Tools: Admins can delete problematic comments and posts.
Technologies Used

	•	Node.js: JavaScript runtime for building the backend.
	•	Express.js: Web framework for handling API routes.
	•	MongoDB: NoSQL database for storing data.
	•	JWT: Authentication using JSON Web Tokens.
	•	Mongoose: ODM for MongoDB, used to model data.
	•	BCrypt: Password hashing and encryption.
	•	Mocha/Chai: Testing framework for API routes.
Running Tests

	1.	Ensure all dependencies are installed:
			 npm install 
    
 	2.	Run the test suite:
  			nom test 
     
     Test coverage includes API endpoints, database operations, and authentication flows.

Contributors

	•	Aaron Cordeau – Team Lead
	•	Ricky Ly – Scrum Master
	•	Gerdine Behrmann – Scribe
	•	Jason Weaver – Git Master






  
 
 
 

 

 
