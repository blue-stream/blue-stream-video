**Create Video**
----
  Create a video resource and returns a json of it's data in json format

* **URL**

  /api/video

* **Method:**

  `POST`
  
*  **URL Params**
 
   None

* **Data Params**

  **BODY**

  ```javascript
  {
	  "title": "The Best of Chopin",
	  "description": "Subscribe for more classical music:  http://bit.ly/YouTubeHalidonMusic",
    "dislikes": 11204,
    "likes": 220501,
    "owner": "chopin@music",
    "views": 58744261
  }
  ```

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 

    ```javascript 
    {
      "video": {
        "_id": "5b32927c9e8acf14e80a6f24",
        "title": "The Best of Chopin",
        "description": "Subscribe for more classical music:  http://bit.ly/YouTubeHalidonMusic",
        "dislikes": 11204,
        "likes": 220501,
        "owner": "chopin@music",
        "views": 58744261,
        "publishDate": "2018-06-26T19:22:36.740Z",
        "updateDate": "2018-06-26T19:22:36.740Z",
        "__v": 0,
        "id": "5b32927c9e8acf14e80a6f24"
      }
    }
    ```
 
* **Error Response:**

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
      url: "/api/video",
      dataType: "json",
      method : "POST",
      data: {
        "title": "The Best of Chopin",
        "description": "Subscribe for more classical music: http://bit.ly/YouTubeHalidonMusic",
        "dislikes": 11204,
        "likes": 220501,
        "owner": "chopin@music",
        "views": 58744261
      }
      success : function(result) {
        ...
      }
    });
  ```
