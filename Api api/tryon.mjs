export async function POST(request) {

  const apiKey =
    process.env.TRYONCLOUD_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error:
          "TRYONCLOUD_API_KEY is not configured.",
        code: "NO_API_KEY"
      },
      { status: 500 }
    );
  }

  try {

    const incomingForm =
      await request.formData();

    const personImage =
      incomingForm.get("person_image");

    const garmentImage =
      incomingForm.get("garment_image");


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
        { status: 400 }
      );

    }


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
        { status: 400 }
      );

    }


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


    if (!response.ok) {

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";


      if (
        contentType.includes(
          "application/json"
        )
      ) {

        const data =
          await response.json();

        return Response.json(
          data,
          {
            status:
              response.status
          }
        );

      }


      const text =
        await response.text();


      return Response.json(
        {
          error:
            text ||
            "Try-On generation failed.",
          code:
            "TRYONCLOUD_ERROR"
        },
        {
          status:
            response.status
        }
      );

    }


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
