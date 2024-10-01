# DnD Encounter Management Backend

## This is the backend for the Dungeons and Dragons Encounter Management application. It provides the API for user authentication, encounter creation, campaign management, and forum interactions.

*Table of Contents*

  	1.	Installation
	2.	API Documentation
	3.	Features
	4.	Database Schema
	5.	Technologies Used
	6.	Environment Variables
	7.	Running Tests
	8.	Contributors

**Installation**

Prerequisites

	•	Node.js
	•	DynamoDB
	•	Postman 

Getting Started

	1.	Clone the repository:
 ``` https://github.com/JasonWeaverRev/backend-technology-project-1822-team-1.git```
 
	2.	Navigate into the project directory: 
 
 ```cd dnd-encounter-management-backend 	```
 
 	3.	Install dependencies:
  
```npm install ```
  
  	4.	Set up environment variables
   
	5.	Start the server:
 
```npm start```
   
 	6.	The server will start on http://localhost:3000.

**API Documentation**

Authentication
```
Method	Endpoint	Description
POST	/auth/register	Register a new user
POST	/auth/login	Log in an existing user
```
User Profile
```
Method	Endpoint	Description
GET	/profile/:userId	View a user’s profile
PUT	/profile/:userId	Update a user’s profile
```

Encounters
```
Method	Endpoint	Description
POST	/encounters	Create a new encounter
GET	/encounters/:userId	Get all encounters by a user
PUT	/encounters/:encounterId	Update an existing encounter
DELETE	/encounters/:encounterId	Delete an encounter
```
Campaigns 
```
POST	/campaigns	Create a campaign folder
GET	/campaigns/:userId	View campaigns for a user
PUT	/campaigns/:campaignId	Update a campaign
DELETE	/campaigns/:campaignId	Delete a campaign

```


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
```
{
  "UserID": "UUID",
  "Username": "string",
  "Password": "hashedString",
  "Email": "user@example.com",
  "ProfilePicture": "https://example.com/images/profile.jpg",
  "AboutMe": "I love DnD!",
  "Encounters": ["EncounterID1", "EncounterID2"],
  "Collections": ["CampaignID1", "CampaignID2"],
  "ForumPosts": ["PostID1", "PostID2"],
  "LikedPosts": ["PostID1", "PostID3"],
  "CreationTime": "2024-10-01T10:00:00Z"
}
```

Encounter
```
{
  "EncounterID": "UUID",
  "Monsters": [
    {
      "Name": "Goblin",
      "API_URL": "https://dndapi.com/monsters/goblin"
    },
    {
      "Name": "Dragon",
      "API_URL": "https://dndapi.com/monsters/dragon"
    }
  ],
  "Saves": 10
}
```

Campaign
```
{
  "CampaignID": "UUID",
  "Encounters": ["EncounterID1", "EncounterID2", "EncounterID3"]
}

```
Forum Post
```
{
  "PostID": "UUID",
  "WrittenBy": "Username",
  "Title": "My Epic Encounter",
  "Body": "Here's a great encounter with a dragon and goblins. [Encounter Details]",
  "Likes": 20,
  "Dislikes": 2,
  "RepliesTo": "PostID123" // This would be null or omitted if it's an independent post
}
```

Technologies Used

	•	Node.js: JavaScript runtime for building the backend.
	•	Express.js: Web framework for handling API routes.
	•	DynamoDB: NoSQL database for storing data.
	•	JWT: Authentication using JSON Web Tokens.
	•	BCrypt: Password hashing and encryption.
	•	Postman: Testing for API routes.
Running Tests

	1.	Ensure all dependencies are installed:
			 npm install 
    
 	2.	Run the test suite:
  			npm test 
     
     Test coverage includes API endpoints, database operations, and authentication flows.

Contributors

	•	Aaron Cordeau – Team Lead
	•	Ricky Ly – Scrum Master
	•	Gerdine Behrmann – Scribe
	•	Jason Weaver – Git Master






  
 
 
 

 

 
