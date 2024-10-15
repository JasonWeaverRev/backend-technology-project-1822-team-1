# DnD Encounter Management Backend

## This is the backend for the Dungeons and Dragons Encounter Management application. It provides the API for user authentication, encounter creation, campaign management, and forum interactions.

_Table of Contents_

1. Installation
2. API Documentation
3. Features
4. Database Schema
5. Technologies Used
6. Environment Variables
7. Running Tests
8. Contributors

**Installation**

Prerequisites

    •	Node.js
    •	DynamoDB
    •	Postman

Getting Started

    1.	Clone the repository:

` https://github.com/JasonWeaverRev/backend-technology-project-1822-team-1.git`

    2.	Navigate into the project directory:

`cd dnd-encounter-management-backend 	`

3. Install dependencies:

`npm install `

4.  Set up environment variables

`export  VAR1=value1 VAR2=value2 VAR3=value3`

    5.	Start the server:

`npm start`

6. The server will start on http://localhost:3000.

**API Documentation**

Authentication

```
Method	Endpoint													Description
POST	/api/accounts/register										Register a new user
					Body: {
						"Email": "gmail@gmail.com",
						"Username": "User1",
						"Password": "8LettersLong"
						}

POST	/api/accounts/login											Log in an existing user
					Body: {
						"identifier": "gmail@gmail.com",
						"Password": "8LettersLong"
					}
```

User Profile

```
Method	Endpoint	    	 										Description
GET		/api/accounts/profile										View a user’s profile
					Body: {
						"Username": "User1"
					}

PUT		/api/accounts/profile										Update a user’s profile
```

Encounters

```
Method	Endpoint													Description
POST	/api/encounters/encounter									Create a new encounter
					Body: {
						"monsters": [monsterData],
    					"encounter_title": "New Encounter"
					}

GET		/api/encounters/encounter?encounter_id=[encounter_id]		Get single encounter by id


GET		/api/encounters/user										Get all encounters by a user
					Body: {
						"insert": "insert"
					}
				
GET		/api/encounters/monsters?challenge_rating={chal_rating}		Get random monsters by challenge rating
					Body: {
						"insert": "insert"
					}

PUT		/api/encounters/encounter									Update an existing encounter
					Body: {
						"monsters": [monsterData],
    					"encounter_title": "Edited Title",
    					"setting": "Cool new setting",
    					"encounter_id":"id of the encounter to be updated"
					}

DELETE	/api/encounters/encounter?encounter_id=[encounter_id]		Delete an encounter

```

Forum

```
POST	/api/forums	        										Create a post
					Body: {
						"Title": "NewPost",
						"Body": "Message Goes Here"
					}

GET		/api/forums													View a post

PUT		/api/forums		       										Update a post
					Body: {
						"post_id": "Postid-goes-here",
						"Body": "New Message Goes Here"
					}

DELETE	/api/forums													Delete a post
					Body: {
						"post_id": "Postid-goes-here"
					}

POST	/api/forums/:[postID]	        							Create a comment
					Body: {
						"Body": "Message Goes Here"
					}
PATCH	/api/forums/comments										Update an comment
					Body: {
						"comment_id": "d0-29-49-8c7-d693d",
						"comment_creation_time": "24-10-084:10.36Z",
						"body": "Updated comment text"
					}


DELETE	/api/forums/comments/{post_id}/{creation_time}		Delete a comment



Features

	•	User Authentication: Secure registration and login using JWT.
	•	Profile Management: Users can update their display name, profile picture, and about me section.
	•	Encounter Creation: Users can create encounters, specifying details like challenge rating, monster type, and environment.
	•	Campaign Organization: Encounters can be organized into campaigns with subfolders.
	•	Forum Interaction: Users can post about their encounters, comment on posts, and like/dislike posts.
	•	Moderator Tools: Admins can delete problematic comments and posts.


Database Schema

The backend uses DynamoDB to store data. Below are some key collections and their fields:

Dungeon_Delver_Users
```

{
"email": "user@example.com",
"username": "string",
"password": "hashedString",
"profile_pic": "https://example.com/images/profile.jpg",
"about_me": "I love DnD!",
"creation_time": "2024-10-01T10:00:00Z",
"role": "string"
}

```

Encounters
```

{
"encounter_iD": "UUID",
"encounter_title": "This Encounter",
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
"Saves": 10,
"campaign_title": "Cool Campaign",
"created_by": "User1",
"setting": "This is the current setting of the encounter",
"creation_time": "2024-10-01T10:00:00Z"
}


```
Delver_Forum_Posts
```

{
"post_id": "UUID",
"creation_time": "2024-10-01T10:00:00Z"
"written_by": "Username",
"parent_id": "UUID",
"title": "My Epic Encounter",
"body": "Here's a great encounter with a dragon and goblins. [Encounter Details]",
"likes": 20,
"parent_id": 2
"liked_by": ["user1", "user2"],
"disliked_by": ["user1", "user2"]
}

```

Technologies Used

	•	Node.js: JavaScript runtime for building the backend.
	•	Express.js: Web framework for handling API routes.
	•	DynamoDB: NoSQL database for storing data.
	•	JWT: Authentication using JSON Web Tokens.
	•	BCrypt: Password hashing and encryption.
	•	Postman: Testing for API routes.
	•	Axios: API fetch requests
	•	Winston: Logging library for managing error, info, and debug logs in the application.
 	•	Jest: Testing framework used for the unit and integration tests to ensure the application works as expected.
  	•	UUID: Library for generating universally unique identifiers.
   	•	AWS Document Client: AWS SDK’s DynamoDB DocumentClient for interacting with DynamoDB in a simpler, object-oriented way.



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














```
