export default {
  async fetch(request) {

    /* ================================
       ONLY POST
    ================================= */

    if (request.method !== "POST") {

      return Response.json(
        {
          error: "Only POST request is allowed."
        },
        {
          status: 405
        }
      );

    }


    /* ================================
       API KEY
    ================================= */

    const apiKey =
      process.env.TRYONCLOUD_API_KEY;


    if (!apiKey) {

      return Response.json(
        {
          error:
            "TRYONCLOUD_API_KEY is not configured.",
          code:
            "NO_API_KEY"
        },
        {
          status: 500
        }
      );

    }


    try {

      /* ================================
         GET FORM DATA
      ================================= */

      const incomingForm =
        await request.formData();


      const personImage =
        incomingForm.get("person_image");


      const garmentImage =
        incomingForm.get("garment_image");


      /* ================================
         CHECK PERSON
      ================================= */

      if (
        !personImage ||
        typeof personImage === "string"
      ) {

        return Response.json(
          {
            error:
              "Person photo is missing.",
            code:
              "NO_PERSON"
          },
          {
            status: 400
          }
        );

      }


      /* ================================
         CHECK GARMENT
      ================================= */

      if (
        !garmentImage ||
        typeof garmentImage === "string"
      ) {

        return Response.json(
          {
            error:
              "Garment photo is missing.",
            code:
              "NO_GARMENT"
          },
          {
            status: 400
          }
        );

      }


      /* ================================
         CREATE TRYONCLOUD FORM
      ================================= */

      const form =
        new FormData();


      form.append(
        "person_image",
        personImage,
        personImage.name ||
          "person.jpg"
      );


      form.append(
        "garment_image",
        garmentImage,
        garmentImage.name ||
          "garment.jpg"
      );


      /* ================================
         CALL TRYONCLOUD
      ================================= */

      const response =
        await fetch(
          "https://www.tryoncloud.com/api/v1/generate",
          {
            method: "POST",

            headers: {
              "X-API-KEY":
                apiKey
            },

            body:
              form
          }
        );


      /* ================================
         ERROR FROM TRYONCLOUD
      ================================= */

      if (!response.ok) {

        let errorData = {
          error:
            "Try-On generation failed.",
          code:
            "GENERATION_FAILED"
        };


        try {

          const contentType =
            response.headers.get(
              "content-type"
            ) || "";


          if (
            contentType.includes(
              "application/json"
            )
          ) {

            errorData =
              await response.json();

          } else {

            const text =
              await response.text();

            if (text) {

              errorData = {
                error: text,
                code:
                  "GENERATION_FAILED"
              };

            }

          }

        } catch (error) {

          console.error(
            "Error reading API error:",
            error
          );

        }


        return Response.json(
          errorData,
          {
            status:
              response.status
          }
        );

      }


      /* ================================
         SUCCESS
         TRYONCLOUD RETURNS IMAGE
      ================================= */

      return new Response(
        response.body,
        {
          status: 200,

          headers: {
            "Content-Type":
              response.headers.get(
                "content-type"
              ) ||
              "image/png",

            "Cache-Control":
              "no-store"
          }
        }
      );


    } catch (error) {

      console.error(
        "TRYON SERVER ERROR:",
        error
      );


      return Response.json(
        {
          error:
            error.message ||
            "Server error occurred.",
          code:
            "SERVER_ERROR"
        },
        {
          status: 500
        }
      );

    }

  }
};
