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
    "views": 58744261,
    "thumbnailPath": "https://g.com",
    "contentPath": "https://g.com"
  }
  ```

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 

    ```javascript 
    {
      "_id": "5b9ea9e26c5a7f369211a853",
      "title": "The Best of Chopin",
      "description": "Subscribe for more classical music:  http://bit.ly/YouTubeHalidonMusic",
      "owner": "chopin@music",
      "views": 58744261,
      "thumbnailPath": "https://g.com",
      "contentPath": "https://g.com",
      "createdAt": "2018-09-16T19:07:14.052Z",
      "updatedAt": "2018-09-16T19:07:14.052Z",
      "__v": 0,
      "id": "5b9ea9e26c5a7f369211a853"
    }
    ```

* **Error Response:**

  * **Code:** 400 BAD REQUEST <br />
    **Content:** 
    
    ```javascript
    {
      "type": "VideoValidationFailedError",
      "message": "Video validation failed for field title"
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
        "description": "Subscribe for more classical music:  http://bit.ly/YouTubeHalidonMusic",
        "dislikes": 11204,
        "likes": 220501,
        "owner": "chopin@music",
        "views": 58744261,
        "thumbnailPath": "https://g.com",
        "contentPath": "https://g.com"
      }
      success : function(result) {
        ...
      }
    });
  ```
