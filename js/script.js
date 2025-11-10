let latitude = 0
let longitude = 0
let API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}`
let currentWeatherData = null
let weekWeatherData = null
let hourlyWeatherData = null
let city = 'Nigeria'
let selectedDay = ''
let units = {
  temperature_unit: 'celsius',
  windspeed_unit: 'kmh',
  precipitation_unit: 'mm'
}
const todays_date = new Date()
const currentTempEl = document.querySelector('#today h1')
const cityEl = document.querySelector('#today h2')
const currentWeatherEl = document.querySelector('#today img')
const dateTimeEl = document.querySelector('#today h6')
const apparentTemperatureEl = document.querySelector('#apparent-temperature')
const relativeHumidityEl = document.querySelector('#relative-humidity')
const currentWindspeedEl = document.querySelector('#current-windspeed')
const currentPrecipitationEl = document.querySelector('#current-precipitaion')
const dailyForecastEls = document.querySelectorAll('#daily-forecast > div')
const hourlyForecastEls = document.querySelectorAll('.hourly-forecast')
const daySelectorEl = document.querySelector('#day-selector')
const searchInputEl = document.querySelector('#search input')
const searchSuggestionsEl = document.querySelector('#search-suggestions')
const searchBtnEl = document.querySelector('#submit-btn')
const temperatureUnitSelectorEl = document.querySelector('#temp-unit')
const windSpeedUnitSelectorEl = document.querySelector('#wind-speed-unit')
const precipitationUnitSelectorEl = document.querySelector('#precip-unit')
const unitSystemToggleEl = document.querySelector('#unit-system-changer')
const unitSelectorDropdownBtnEl = document.querySelector(
  '#unit-selector-dropdown-btn'
)
const unitSelectorDropdownEl = document.querySelector('#unit-selector-dropdown')

unitSelectorDropdownEl.style.display = 'none'
daySelectorEl.value = todays_date.toLocaleDateString('en-US', {
  weekday: 'long'
})
selectedDay = todays_date.toISOString().split('T')[0]

unitSelectorDropdownBtnEl.addEventListener('click', () => {
  if (unitSelectorDropdownEl.style.display === 'block') {
    unitSelectorDropdownEl.style.display = 'none'
  } else {
    unitSelectorDropdownEl.style.display = 'block'
  }
})

unitSystemToggleEl.addEventListener('click', () => {
  const isMetric = units.temperature_unit === 'celsius'
  if (isMetric) {
    //switch to imperial
    units.temperature_unit = 'fahrenheit'
    units.windspeed_unit = 'mph'
    units.precipitation_unit = 'inch'
    //update UI selectors
    temperatureUnitSelectorEl.querySelector('.metric>img').style.visibility =
      'hidden'
    temperatureUnitSelectorEl.querySelector('.imperial>img').style.visibility =
      'visible'
    windSpeedUnitSelectorEl.querySelector('.metric>img').style.visibility =
      'hidden'
    windSpeedUnitSelectorEl.querySelector('.imperial>img').style.visibility =
      'visible'
    precipitationUnitSelectorEl.querySelector('.metric>img').style.visibility =
      'hidden'
    precipitationUnitSelectorEl.querySelector(
      '.imperial>img'
    ).style.visibility = 'visible'
    unitSystemToggleEl.textContent = 'Switch To Metric '
  } else {
    //switch to metric
    units.temperature_unit = 'celsius'
    units.windspeed_unit = 'kmh'
    units.precipitation_unit = 'mm'
    //update UI selectors
    temperatureUnitSelectorEl.querySelector('.imperial>img').style.visibility =
      'hidden'
    temperatureUnitSelectorEl.querySelector('.metric>img').style.visibility =
      'visible'
    windSpeedUnitSelectorEl.querySelector('.imperial>img').style.visibility =
      'hidden'
    windSpeedUnitSelectorEl.querySelector('.metric>img').style.visibility =
      'visible'
    precipitationUnitSelectorEl.querySelector(
      '.imperial>img'
    ).style.visibility = 'hidden'
    precipitationUnitSelectorEl.querySelector('.metric>img').style.visibility =
      'visible'
    unitSystemToggleEl.textContent = 'Switch To Imperial '
  }
  updateCurrentWeatherUI()
})

temperatureUnitSelectorEl.querySelectorAll('.unit-option').forEach(e => {
  e.addEventListener('click', () => {
    const unit_type = e.classList[1]
    e.querySelector('img').style.visibility = 'visible'
    e.parentNode.querySelector(
      `.${unit_type === 'metric' ? 'imperial' : 'metric'}>img`
    ).style.visibility = 'hidden'
    if (unit_type === 'metric') {
      units.temperature_unit = 'celsius'
    } else {
      units.temperature_unit = 'fahrenheit'
    }
    updateCurrentWeatherUI()
  })
})

windSpeedUnitSelectorEl.querySelectorAll('.unit-option').forEach(e => {
  e.addEventListener('click', () => {
    const unit_type = e.classList[1]
    e.querySelector('img').style.visibility = 'visible'
    e.parentNode.querySelector(
      `.${unit_type === 'metric' ? 'imperial' : 'metric'}>img`
    ).style.visibility = 'hidden'
    if (unit_type === 'metric') {
      units.windspeed_unit = 'kmh'
    } else {
      units.windspeed_unit = 'mph'
    }
    updateCurrentWeatherUI()
  })
})

precipitationUnitSelectorEl.querySelectorAll('.unit-option').forEach(e => {
  e.addEventListener('click', () => {
    const unit_type = e.classList[1]
    e.querySelector('img').style.visibility = 'visible'
    e.parentNode.querySelector(
      `.${unit_type === 'metric' ? 'imperial' : 'metric'}>img`
    ).style.visibility = 'hidden'
    if (unit_type === 'metric') {
      units.precipitation_unit = 'mm'
    } else {
      units.precipitation_unit = 'inch'
    }
    updateCurrentWeatherUI()
  })
})

function updateAPIURL (latitude, longitude) {
  API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}`
  let unitEncode = ''
  //compute units
  for (u in units) {
    unitEncode += `&${u}=${units[u]}`
  }

  API_URL += unitEncode
}

searchBtnEl.addEventListener('click', async e => {
  e.preventDefault()
  city = searchInputEl.value
  await updateCurrentWeatherUI()
})

searchInputEl.addEventListener('focus', () => {
  searchSuggestionsEl.style.display = 'block'
})

searchInputEl.addEventListener('blur', () => {
  setTimeout(() => {
    searchSuggestionsEl.style.display = 'none'
  }, 500)
})

searchInputEl.addEventListener('input', async () => {
  const query = searchInputEl.value
  if (query.length < 2) {
    searchSuggestionsEl.innerHTML = ''
    return
  }
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=10`
  )
  const data = await response.json()
  searchSuggestionsEl.innerHTML = ''
  if (data.results) {
    data.results.forEach(location => {
      const div = document.createElement('div')
      div.textContent = `${location.name}, ${location.country}`
      div.addEventListener('click', async e => {
        e.stopPropagation()
        searchInputEl.value = `${location.name}, ${location.country}`
        searchSuggestionsEl.innerHTML = ''
        e.preventDefault()
        city = searchInputEl.value
        await updateCurrentWeatherUI()
      })
      searchSuggestionsEl.appendChild(div)
    })
  }
})

daySelectorEl.addEventListener('change', async () => {
  const s = daySelectorEl.value
  const dayIndex = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ].indexOf(s)
  const currentDayIndex = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ].indexOf(new Date().toLocaleDateString('en-US', { weekday: 'long' }))
  let dayDifference = dayIndex - currentDayIndex
  if (dayDifference < 0) dayDifference += 7 // Adjust for next week
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + dayDifference)
  const dayString = targetDate.toISOString().split('T')[0]
  selectedDay = dayString
  await refreshHourlyForecastUI()
})

async function getCoordinates (c) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      c
    )}`
  )
  const data = await response.json()

  if (data.length === 0) {
    return [null, null]
  }

  const { latitude, longitude } = data.results[0]
  return [latitude, longitude]
}

function weatherIconSelector (weatherCode) {
  if (weatherCode === 0) {
    return 'assets/images/icon-sunny.webp'
  } else if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) {
    return 'assets/images/icon-partly-cloudy.webp'
  } else if (weatherCode === 45 || weatherCode === 48) {
    return 'assets/images/icon-overcast.webp'
  } else if (
    weatherCode === 51 ||
    weatherCode === 53 ||
    weatherCode === 55 ||
    weatherCode === 56 ||
    weatherCode === 57
  ) {
    return 'assets/images/icon-drizzle.webp'
  } else if (
    weatherCode === 61 ||
    weatherCode === 63 ||
    weatherCode === 65 ||
    weatherCode === 66 ||
    weatherCode === 67
  ) {
    return 'assets/images/icon-rain.webp'
  } else if (
    weatherCode === 71 ||
    weatherCode === 73 ||
    weatherCode === 75 ||
    weatherCode === 77
  ) {
    return 'assets/images/icon-snowfall.webp'
  } else if (weatherCode === 80 || weatherCode === 81 || weatherCode === 82) {
    return 'assets/images/icon-rain.webp'
  } else if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
    return 'assets/images/icon-storm.webp'
  } else {
    return 'assets/images/icon-loading.svg' // default icon
  }
}

async function fetchCurrentWeather () {
  try {
    let response = await fetch(
      API_URL +
        '&current=temperature,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,weather_code'
    )
    const current_data = await response.json()
    return current_data
  } catch (error) {
    return null
  }
}

async function fetchWeekWeather () {
  try {
    const response = await fetch(
      API_URL +
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&forecast_days=7'
    )
    const daily_data = await response.json()
    return daily_data
  } catch (error) {
    return null
  }
}

async function fetchHourlyWeather (day) {
  try {
    const response = await fetch(
      API_URL +
        '&hourly=temperature,apparent_temperature,precipitation,weather_code&start_date=' +
        day +
        '&end_date=' +
        day
    )
    const hourly_data = await response.json()
    return hourly_data
  } catch (error) {
    return null
  }
}

async function updateCurrentWeatherUI () {
  ;[latitude, longitude] = await getCoordinates(city)
  updateAPIURL(latitude, longitude)
  currentWeatherData = await fetchCurrentWeather()
  cityEl.textContent = city
  dateTimeEl.textContent = todays_date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Update all fields displaying Current Weather Data
  currentTempEl.textContent = `${currentWeatherData.current.temperature}°`
  currentWeatherEl.src = weatherIconSelector(
    currentWeatherData.current.weather_code
  )
  apparentTemperatureEl.textContent = `${
    currentWeatherData.current.apparent_temperature
  }°${units.temperature_unit === 'celsius' ? 'C' : 'F'}`
  relativeHumidityEl.textContent = `${currentWeatherData.current.relative_humidity_2m}%`
  currentWindspeedEl.textContent = `${
    currentWeatherData.current.wind_speed_10m
  }${units.windspeed_unit === 'kmh' ? ' km/h' : ' mph'}`
  currentPrecipitationEl.textContent = `${
    currentWeatherData.current.precipitation
  } ${units.precipitation_unit === 'mm' ? ' mm' : ' in'}`

  weekForecastData = await fetchWeekWeather()
  dailyForecastEls.forEach(async (el, index) => {
    const maxTemp = weekForecastData.daily.temperature_2m_max[index]
    const minTemp = weekForecastData.daily.temperature_2m_min[index]
    const day = new Date(weekForecastData.daily.time[index]).toLocaleDateString(
      'en-US',
      { weekday: 'short' }
    )
    el.querySelector('.max-temp').textContent = `${maxTemp}°`
    el.querySelector('.min-temp').textContent = `${minTemp}°`
    el.querySelector('h5').textContent = day
    el.querySelector('img').src = weatherIconSelector(
      weekForecastData.daily.weather_code[index]
    )
  })
  await refreshHourlyForecastUI()
}

async function refreshHourlyForecastUI () {
  hourlyWeatherData = await fetchHourlyWeather(selectedDay)
  hourlyForecastEls.forEach((h, index) => {
    h.querySelector('img').src = weatherIconSelector(
      hourlyWeatherData.hourly.weather_code[index]
    )
    const s = h.querySelectorAll('span')
    s[0].innerText = hourlyWeatherData.hourly.time[index].split('T')[1]
    s[1].innerText = hourlyWeatherData.hourly.temperature[index] + '°'
  })
}

updateCurrentWeatherUI()
