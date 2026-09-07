export default {
  async fetch(request) {

    if (request.method !== "POST") {
      return Response.json(
        { error: "Only POST request is allowed." },
        { status: 405 }
      );
    }

    const apiKey =
      process.env.TRYONCLOUD_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error:
            "TRYONCLOUD_API_KEY is not configured."
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


      if (!personImage) {

        return Response.json(
          {
            error:
              "Person photo is missing.",
            code:
              "NO_PERSON"
          },
          { status: 400 }
        );

      }


      if (!garmentImage) {

        return Response.json(
          {
            error:
              "Garment photo is missing.",
            code:
              "NO_GARMENT"
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

        let errorData = {
          error:
            "Try-On failed.",
          code:
            "GENERATION_FAILED"
        };


        try {

          errorData =
            await response.json();

        } catch (e) {}


        return Response.json(
          errorData,
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
              "image/png",

            "Cache-Control":
              "no-store"
          }
        }
      );


    } catch (error) {

      console.error(
        "TryOn Error:",
        error
      );


      return Response.json(
        {
          error:
            "Server error while creating AI result.",
          code:
            "SERVER_ERROR"
        },
        { status: 500 }
      );

    }

  }
};
