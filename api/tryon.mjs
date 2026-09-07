export async function POST(request) {

  /* ================================
     TRYONCLOUD API KEY
  ================================= */

  const apiKey =
    process.env.TRYONCLOUD_API_KEY;


  if (!apiKey) {

    return Response.json(
      {
        error:
          "TRYONCLOUD_API_KEY is not configured.",
        code: "NO_API_KEY"
      },
      {
        status: 500
      }
    );

  }


  /* ================================
     MAIN TRY-ON PROCESS
  ================================= */

  try {

    const incomingForm =
      await request.formData();


    /* ================================
       GET PERSON IMAGE
    ================================= */

    const personImage =
      incomingForm.get(
        "person_image"
      );


    /* ================================
       GET GARMENT IMAGE
    ================================= */

    const garmentImage =
      incomingForm.get(
        "garment_image"
      );


    /* ================================
       CHECK PERSON PHOTO
    ================================= */

    if (
      !personImage ||
      typeof personImage === "string"
    ) {

      return Response.json(
        {
          error:
            "Person photo is missing.",
          code: "NO_PERSON"
        },
        {
          status: 400
        }
      );

    }


    /* ================================
       CHECK GARMENT PHOTO
    ================================= */

    if (
      !garmentImage ||
      typeof garmentImage === "string"
    ) {

      return Response.json(
        {
          error:
            "Garment photo is missing.",
          code: "NO_GARMENT"
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
       SEND TO TRYONCLOUD
    ================================= */

    const response =
      await fetch(
        "https://www.tryoncloud.com/api/v1/generate",
        {
          method: "POST",

          headers: {
            "X-API-KEY": apiKey
          },

          body: form
        }
      );


    /* ================================
       CHECK TRYONCLOUD ERROR
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
                "TRYONCLOUD_ERROR"
            };

          }

        }

      } catch (readError) {

        console.error(
          "Error reading TryOnCloud error:",
          readError
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
            ) || "image/png",

          "Cache-Control":
            "no-store"
        }
      }
    );


  } catch (error) {

    /* ================================
       SERVER ERROR
    ================================= */

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
