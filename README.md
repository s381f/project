# Project Name: Book Management System

## Cloud-based Server URL : [https://project-7wpm.onrender.com](https://project-7wpm.onrender.com)

## Group Info (Group No. 33)

| Student Name    | SID      | responsible parts                                                                                                                    |
|-----------------|----------|--------------------------------------------------------------------------------------------------------------------------------------|
| Zhim Chin Pong  | 13184669 | - All css file set up<br/>- All ejs(Ui) file set up <br/>                                                                              |
| Tsang Cheuk Nok | 13745730 | - book model related<br/>- create and delete book                                                                                                                                        |
| Fung Tsun Hin   | 12086250 | - login/logout                                                                                                                       |
| Wu Ka Wai       | 13711683 | - project base set up<br/>- docker set up<br/>- mongodb owner<br/>- cloud server setup<br/>- edit book<br/>- Swagger API Docs Set up |
| Yip Wing Hei    | 13119940 | - insert/find/update/deletedocument<br/>- search and delete book                                                                      |

## Project File Intro
### server.js

### package.json

### public (folder)
Include all pages css file:
createBook.css,
dashboard.css,
deleteBook.css,
editBook.css,
index.css,
login_signup.css,
searchBooks.css

### views (folder)
Include all pages EJS and UI file:
createBook.ejs,
dashboard.ejs,
deleteBook.ejs,
editBook.ejs,
index.ejs,
login.ejs,
searchBooks.ejs,
signup.ejs

### models (folder)


## Operation Guides

### Login and Sign-Up Pages
#### Valid Login Information
- **Username:** admin
- **Password:** admin

#### Sign-Up Steps
1. Navigate to the sign-up page.
2. Fill in the required fields:
   - **Username**
   - **Password**
   - **Confirm Password**
3. Click the "Sign Up" button.
4. Upon successful sign-up, you will be redirected to the index page.
#### Login Steps
1. Open the login page.
2. Enter the valid username and password.
3. Click the "Login" button.
4. Upon successful login, you will be redirected to the dashboard page.
5. To logout, click on the "Logout" button located in the middle of the page.

### CRUD Web Pages
#### Create
- **Steps:**
1. In dashboard page, click the "Add Book" to navigate to the createBook page.
2. Click the "Add New Item" button.
3. Fill in the required fields in the form.
   - **Title**
   - **Auther**
4. Click the "Add Book" button to create a new book.

#### Read
- **Steps:**
 1. In dashboard page, click the "Search Books" to navigate to the searchBooks page.
 2. In searchBooks page, there has the search input field where the user can enter keywords to search for books.
 3. Search: This is the button the user can click to initiate the search.
 4. The details of the book will be displayed on the below search results table.

#### Update
- **Steps:**
 1. In dashboard page, click the "Search Books" to navigate to the searchBooks page.
 2. Click the "Edit" button next to the item you wish to update.
 3. Modify the necessary fields in the form.
 4. Click the "Update Book" button to update the book.

#### Delete
- **Steps:**
 1. In dashboard page, click the "Search Books" to navigate to the searchBooks page.
 2. Click the "Delete" button next to the item you want to remove.
 3. Confirm the "Delete Book" button to delete the book.
 4. If you don't want to delete, you can click the "Cancel" button to back to the searchBooks page.
### RESTful CRUD Services
