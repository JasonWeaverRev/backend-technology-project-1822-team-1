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
   
Database Schema

The backend uses DynamoDB to store data. Below are some key collections and their fields:

User 

{
  "UserID": "UUID",
  "Username": "string",
  "Password": "hashedString",
  "Email": "string@example.com",
  "Encounters": [
    {
      "EncounterID": "UUID",
      "ChallengeRating": 5,
      "MonsterTypes": ["Dragon", "Goblin"],
      "Environment": "Forest"
    }
  ],
  "Collections": ["FolderID1", "FolderID2"],
  "ForumPosts": ["PostID1", "PostID2"],
  "LikedPosts": ["PostID1", "PostID3"]
}

Encounter

{
  "EncounterID": "UUID",
  "FolderID": "FolderID1",
  "ChallengeRating": 5,
  "MonsterTypes": ["Dragon", "Goblin"],
  "MonsterURLs": ["https://monsterapi.com/dragon", "https://monsterapi.com/goblin"],
  "Environment": "Forest",
  "CreatedAt": "2024-10-01T10:00:00Z",
  "UpdatedAt": "2024-10-01T12:00:00Z"
}


Campaign

{
  "FolderID": "UUID",
  "UserID": "UUID",
  "FolderName": "My Epic Campaign",
  "EncounterIDs": ["EncounterID1", "EncounterID2"],
  "CreatedAt": "2024-10-01T10:00:00Z",
  "UpdatedAt": "2024-10-01T12:00:00Z"
}

Forum Post

{
  "PostID": "UUID",
  "WrittenBy": "Username",
  "Title": "Encounter Tips",
  "Body": "Here's how to make your encounters more exciting...",
  "Likes": 10,
  "Comments": [
    {
      "CommentID": "UUID",
      "WrittenBy": "AnotherUser",
      "Content": "Great tips!",
      "CreatedAt": "2024-10-01T11:00:00Z"
    }
  ]
}

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






  
 
 
 

 

 
