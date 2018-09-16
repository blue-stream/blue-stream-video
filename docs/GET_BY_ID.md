**Get Video**
----
  Get video resource by id and returns it's data in json format

* **URL**

  /api/video/:id

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `id=[ObjectID]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 

    ```javascript 
    {
      "video": {
        "_id": "5b328efa9e8acf14e80a6f23",
        "title": "The Best of Chopin",
        "description": "Subscribe for more classical music:  http://bit.ly/YouTubeHalidonMusic",
        "dislikes": 11204,
        "likes": 220501,
        "owner": "chopin@music",
        "views": 58744261,
        "publishDate": "2018-06-26T19:07:38.202Z",
        "updateDate": "2018-06-26T19:07:38.202Z",
        "__v": 0,
        "id": "5b328efa9e8acf14e80a6f23"
      } 
    }
    ```
 
* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** 

    ```javascript
    {
      "message": "Resource not found."
    }
    ```

  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** 
    
    ```javascript
    {
      "message": "Request validation failed"
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/api/video/5b328efa9e8acf14e80a6f23",
      dataType: "json",
      method : "GET",
      success : function(result) {
        ...
      }
    });
  ```
