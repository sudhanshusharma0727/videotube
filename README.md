# Videotube 

This is a ``YOUTUBE`` backend project that covers allmost the functionalities of youtube 
and also combines the tweet functionality from twitter into it which acts as a community post in youtube. Find more about his project in the documentaion below.
- [Model link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share)

- [Postman API Documentation](https://documenter.getpostman.com/view/37740363/2sAXxPBDhZ)

---
# Summary of this project

This project is a complex backend project that is built with nodejs, expressjs, mongodb, mongoose, jwt, bcrypt, and many more. This project is a complete backend project that has all the features that a backend project should have. We are building a complete video hosting website similar to youtube with all the features like login, signup, upload video, like, dislike, comment, reply, subscribe, unsubscribe, and many more.

Project uses all standard practices like JWT, bcrypt, access tokens, refresh Tokens and many more. We have spent a lot of time in building this project.

---
## Features

### User Management:

- Registration, login, logout, password reset
- Profile management (avatar, cover image, details)
- Watch history tracking

### Video Management:

- Video upload and publishing
- Video search, sorting, and pagination
- Video editing and deletion
- Visibility control (publish/unpublish)

### Tweet Management:

- Tweet creation and publishing
- Viewing user tweets
- Updating and deleting tweets

### Subscription Management:

- Subscribing to channels
- Viewing subscriber and subscribed channel lists

### Playlist Management:

- Creating, updating, and deleting playlists
- Adding and removing videos from playlists
- Viewing user playlists

### Like Management:

- Liking and unliking videos, comments, and tweets
- Viewing liked videos

### Comment Management:

- Adding, updating, and deleting comments on videos

### Dashboard:

- Viewing channel statistics (views, subscribers, videos, likes)
- Accessing uploaded videos

### Health Check:

- Endpoint to verify the backend's health

## Technologies Used

- Node.js 
- Express.js
- MongoDB
- Cloudinary (must have an account)

  ## Installation and Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/sudhanshusharma0727/videotube.git
    ```

2. **Install dependencies:**

    ```bash
    cd videotube
    npm install
    ```

3. **Set up environment variables:**
    Create a .env in root of project and fill in the required values in the .env file using .env.sample file

4. **Start the server:**

    ```bash
    npm run dev
    ```
