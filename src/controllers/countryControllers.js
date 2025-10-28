// src/controllers/countryController.js
const axios = require('axios');
const Country = require('../models/Country');
const { sendError, fetchExternalAPI } = require('../utils/apihandler');
const Jimp = require('jimp');

exports.refreshCountries = async (req, res) => {
  try {
    const countriesData = await fetchExternalAPI(
      res,
      'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies',
      'REST Countries API'
    );

    const exchangeRatesData = await fetchExternalAPI(
      res,
      'https://open.er-api.com/v6/latest/USD',
      'Exchange Rate API'
    );

    // Stop execution if any failed (returns null)
    if (!countriesData || !exchangeRatesData) return;

    const exchangeRates = exchangeRatesData.rates;
    let updatedCount = 0;

    for (const country of countriesData) {
      const name = country.name;
      if (!name) continue;

      const capital = country.capital || null;
      const region = country.region || null;
      const population = country.population || 0;
      const flag_url = country.flag || null;
      const currency_code = country.currencies?.[0]?.code || null;

      let exchange_rate = null;
      let estimated_gdp = 0;

      if (currency_code && exchangeRates[currency_code]) {
        exchange_rate = exchangeRates[currency_code];
        const randomMultiplier = Math.floor(Math.random() * 1001) + 1000;
        estimated_gdp = (population * randomMultiplier) / exchange_rate;
      }

      await Country.upsert({
        name,
        capital,
        region,
        population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        flag_url,
        last_refreshed_at: new Date()
      });

      updatedCount++;
    }

    res.json({
      message: 'Countries refreshed successfully!',
      total_updated: updatedCount,
      last_refreshed_at: new Date()
    });

  } catch (error) {
    console.error('Error refreshing countries:', error.message);
    sendError(res, 500, 'Internal server error', error.message);
  }
};

exports.getAllCountries = async (req, res) => {
  try {
    const { region, currency, sort } = req.query;

    // Build filter conditions
    const where = {};
    if (region) where.region = region;
    if (currency) where.currency_code = currency;

    // Sorting options
    let order = [];
    if (sort === 'gdp_desc') order = [['estimated_gdp', 'DESC']];
    else if (sort === 'gdp_asc') order = [['estimated_gdp', 'ASC']];
    else if (sort === 'population_desc') order = [['population', 'DESC']];
    else if (sort === 'population_asc') order = [['population', 'ASC']];

    // Fetch countries from DB
    const countries = await Country.findAll({
      where,
      order
    });

    if (countries.length === 0) {
      return res.status(404).json({ error: 'No countries found' });
    }

    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

exports.getCountryByName = async (req, res) => {
  try {
    const { name } = req.params;

    // Find by name (case-insensitive)
    const country = await Country.findOne({
      where: { name }
    });

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json(country);
  } catch (error) {
    console.error('Error fetching country:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

exports.deleteCountryByName = async (req, res) => {
  try {
    const { name } = req.params;

    // Case-insensitive find (MySQL default is case-insensitive)
    const country = await Country.findOne({ where: { name } });

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    await country.destroy();

    res.json({ message: `Country '${name}' deleted successfully` });
  } catch (error) {
    console.error('Error deleting country:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

exports.getStatus = async (req, res) => {
  try {
    // Count total countries
    const total_countries = await Country.count();

    // Find the latest refresh timestamp
    const latestCountry = await Country.findOne({
      order: [['last_refreshed_at', 'DESC']],
    });

    const last_refreshed_at = latestCountry
      ? latestCountry.last_refreshed_at
      : null;

    res.json({
      total_countries,
      last_refreshed_at,
    });
  } catch (error) {
    console.error('Error getting status:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
};

exports.getCountriesImage = async (req, res) => {
  try {
    // Fetch general stats
    const total_countries = await Country.count();
    const latestCountry = await Country.findOne({
      order: [['last_refreshed_at', 'DESC']],
    });

    const last_refreshed_at = latestCountry
      ? new Date(latestCountry.last_refreshed_at).toLocaleString()
      : 'N/A';

    // ✅ Get top 5 countries by estimated GDP
    const topCountries = await Country.findAll({
      order: [['estimated_gdp', 'DESC']],
      limit: 5,
      attributes: ['name', 'estimated_gdp'],
    });

    // ✅ Create base image
    const image = await new Jimp(800, 600, '#1e1e2f'); // taller canvas
    const fontTitle = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    const fontText = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    // ✅ Add main text
    image.print(fontTitle, 20, 50, '🌍 Country Summary');
    image.print(fontText, 20, 150, `Total Countries: ${total_countries}`);
    image.print(fontText, 20, 200, `Last Updated: ${last_refreshed_at}`);

    // ✅ Add top 5 list
    image.print(fontText, 20, 270, 'Top 5 by Estimated GDP:');
    let yOffset = 320;
    for (const country of topCountries) {
      image.print(
        fontText,
        40,
        yOffset,
        `${country.name}: ${country.estimated_gdp.toFixed(2)}`
      );
      yOffset += 40; // move down each line
    }

    // ✅ Send image
    res.set('Content-Type', 'image/png');
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    res.send(buffer);
  } catch (error) {
    console.error('Error generating image:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
};
