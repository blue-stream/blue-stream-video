**Get Video**
----
  Update video by id if exists.
  Otherwise returns 404 error code.

* **URL**

  /api/video/:id

* **Method:**

  `PUT`
  
*  **URL Params**

   **Required:**
 
   `id=[ObjectID]`

* **Data Params**

  **BODY**

  ```javascript
    {
		  "title": "Another chopin music"
    }
  ```

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 

    ```javascript 
    {
      "video": {
        "_id": "5b328efa9e8acf14e80a6f23",
        "title": "Another chopin music",
        "description": "Subscribe for more classical music:  http://bit.ly/YouTubeHalidonMusic",
        "dislikes": 11204,
        "likes": 220501,
        "owner": "chopin@music",
        "views": 58744261,
        "publishDate": "2018-06-26T19:07:38.202Z",
        "updateDate": "2018-06-26T19:40:39.265Z",
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
      method : "PUT",
      data: {
          title: 'Another chopin music'
      }
      success : function(result) {
        ...
      }
    });
  ```
