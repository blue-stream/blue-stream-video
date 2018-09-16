**DELETE Video**
----
  Delete video by id if exists.
  Otherwise returns 404 status code

* **URL**

  /api/video/:id

* **Method:**

  `DELETE`
  
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
      "_id": "5b9ea2f46c5a7f369211a852",
      "title": "Another chopin music",
      "description": "Subscribe for more classical music:  http://bit.ly/YouTubeHalidonMusic",
      "owner": "chopin@music",
      "views": 58744261,
      "thumbnailUrl": "https://g.com",
      "contentUrl": "https://g.com",
      "createdAt": "2018-09-16T18:37:40.634Z",
      "updatedAt": "2018-09-16T18:41:40.813Z",
      "__v": 0,
      "id": "5b9ea2f46c5a7f369211a852"
    }
    ```
 
* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** 

    ```javascript
    {
      "type": "VideoNotFoundError",
      "message": "Video not found"
    }
    ```

  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** 
    
    ```javascript
    {
      "type": "IdInvalidError",
      "message": "Id is invalid"
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/api/video/5b328efa9e8acf14e80a6f23",
      dataType: "json",
      method : "DELETE",
      success : function(result) {
        ...
      }
    });
  ```
