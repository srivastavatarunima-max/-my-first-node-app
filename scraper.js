const axios = require("axios");

async function testScraper() {

  try {

    const response = await axios.get(
      "https://www.michaelpage.ae/jobs"
    );

    console.log(
      response.data.substring(0, 500)
    );

  } catch (error) {

    console.log(error.message);

  }

}

testScraper();
