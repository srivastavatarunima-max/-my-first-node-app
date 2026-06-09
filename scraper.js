app.get("/scrape-test", async (req, res) => {

  try {

    const response = await axios.get(
      "https://www.michaelpage.ae/jobs"
    );

    res.json({
      success: true,
      length: response.data.length,
      first500: response.data.substring(0, 500)
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});
